import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_MIME = /^(application\/pdf|image\/)/;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const PROVIDER = (process.env.RECEIPT_PARSER_PROVIDER || 'gemini').toLowerCase(); 


export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.startsWith('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data.' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'File is required.' }, { status: 400 });
    }
    if (!SUPPORTED_MIME.test(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Use PDF or image.' }, { status: 415 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB).' }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

   
    let extractedText = '';
    if (file.type === 'application/pdf') {
      try {
        const pdfParse = (await import('pdf-parse')).default;
        const pdfData = await pdfParse(buffer);
        extractedText = (pdfData.text || '').trim();
        if (extractedText.length > 20000) {
          extractedText = extractedText.slice(0, 20000) + '... (truncated)';
        }
      } catch (e) {
        console.warn('[parse-receipt] pdf-parse failed or not installed:', e.message);
      }
    }

    let transactions = [];
    let providerUsed = PROVIDER;

    if (PROVIDER === 'gemini') {
      transactions = await runGeminiExtraction({ buffer, mimeType: file.type, extractedText });
      if (!transactions.length) {
        
        transactions = heuristicExtract(buffer, file.type, extractedText);
        providerUsed = transactions.length ? 'fallback-free' : 'gemini';
      }
    } else {
     
      transactions = heuristicExtract(buffer, file.type, extractedText);
    }

    if (!transactions.length) {
      return NextResponse.json(
        { error: 'No transactions extracted (try clearer image/PDF).', provider: providerUsed },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: true, provider: providerUsed, transactions },
      { status: 200 }
    );
  } catch (err) {
    console.error('[parse-receipt] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

async function runGeminiExtraction({ buffer, mimeType, extractedText }) {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    console.warn('[parse-receipt] Missing GOOGLE_GEMINI_API_KEY');
    return [];
  }
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const hasImage = mimeType.startsWith('image/');
    const parts = [];
    if (hasImage) {
      parts.push({
        inlineData: {
          data: buffer.toString('base64'),
          mimeType
        }
      });
    }

    const prompt = buildGeminiPrompt({ hasImage, extractedText });
    parts.push({ text: prompt });

    const result = await model.generateContent(parts);
    const text = result?.response?.text?.() || '';
    const arr = extractJsonArray(text);
    return normalizeTransactions(arr);
  } catch (e) {
    console.warn('[parse-receipt] Gemini extraction failed:', e.message);
    return [];
  }
}

function buildGeminiPrompt({ hasImage, extractedText }) {
  return `
You output ONLY a JSON array.

Goal: Extract receipt transactions (line items or single total).
Each element: { "amount": number, "type": "expense" | "credit", "raw": "short source snippet" }

Rules:
- Expenses MUST be negative amounts.
- Credits/refunds MUST be positive amounts (detect words REFUND, CREDIT, RETURN).
- Prefer line items; if only a total is visible, output one entry.
- Ignore duplicate totals, payment method lines, change, or tax lines if already included.
- No commentary or surrounding text—ONLY the JSON array.

${hasImage ? 'The image is attached as binary content.' : ''}
${extractedText ? `Receipt text (may be truncated): """${extractedText}"""` : ''}
`.trim();
}

function heuristicExtract(buffer, mimeType, extractedText) {
  return parseHeuristicText(extractedText || '');
}

function parseHeuristicText(text) {
  if (!text) return [];
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const IGNORE = /\b(tax|change|visa|mastercard|debit|cash|subtotal)\b/i;
  const CREDIT = /\b(refund|credit|return)\b/i;
  const TOTAL_HINT = /\b(total|amount due|grand total)\b/i;
  const ITEM_REGEX = /^(.{2,70}?)[\s\.]{2,}(-?\$?\d[\d,]*\.?\d{2})$/;
  const TAIL_PRICE = /(.*?)(-?\$?\d[\d,]*\.?\d{2})$/;

  const items = [];
  let probableTotal = null;

  for (const raw of lines) {
    if (!raw) continue;
    let line = raw;
    const totalCandidate = TOTAL_HINT.test(line);

    if (IGNORE.test(line) && !totalCandidate) continue;

    let m = line.match(ITEM_REGEX);
    if (!m) m = line.match(TAIL_PRICE);
    if (m) {
      const name = (m[1] || '').trim().replace(/\.+$/g, '').trim();
      const amount = parseAmount(m[2]);
      if (name && amount != null && !/^\d+$/.test(name)) {
        items.push({ raw: line, amount, isCredit: CREDIT.test(line) });
      }
    }

    if (totalCandidate) {
      const nums = line.match(/-?\$?\d[\d,]*\.?\d{2}/g);
      if (nums) {
        for (const n of nums) {
          const val = parseAmount(n);
          if (val != null && (probableTotal == null || val >= probableTotal)) {
            probableTotal = val;
          }
        }
      }
    }
  }

  const map = new Map();
  for (const it of items) {
    const key = it.raw.toLowerCase() + '|' + it.amount;
    if (!map.has(key)) map.set(key, it);
  }
  const unique = [...map.values()];

  let results = [];
  if (unique.length) {
    results = unique.map(u => {
      const type = u.isCredit ? 'credit' : 'expense';
      const signed = type === 'expense' ? -Math.abs(u.amount) : Math.abs(u.amount);
      return { amount: Number(signed.toFixed(2)), type, raw: u.raw.slice(0, 160) };
    });
  } else if (probableTotal != null) {
    results = [{
      amount: Number((-Math.abs(probableTotal)).toFixed(2)),
      type: 'expense',
      raw: 'TOTAL'
    }];
  }
  return results;
}

function parseAmount(str) {
  if (!str) return null;
  const num = Number(str.replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(num) ? num : null;
}

function extractJsonArray(text) {
  if (!text) return [];
  const cleaned = text.replace(/```json|```/gi, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return [];
  try {
    const slice = cleaned.slice(start, end + 1);
    const parsed = JSON.parse(slice);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeTransactions(arr) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const row of arr) {
    if (!row || typeof row !== 'object') continue;
    let { amount, type, raw } = row;
    if (amount == null) continue;
    const num = Number(amount);
    if (!Number.isFinite(num)) continue;
    if (type !== 'expense' && type !== 'credit') continue;
    const final = type === 'expense' ? -Math.abs(num) : Math.abs(num);
    out.push({
      amount: Number(final.toFixed(2)),
      type,
      raw: typeof raw === 'string' ? raw.slice(0, 160) : ''
    });
  }
  return out;
}


