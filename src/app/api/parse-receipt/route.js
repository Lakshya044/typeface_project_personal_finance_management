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
Each element MUST be:
{ "amount": number, "type": "expense" | "credit", "raw": "short source snippet", "date": "YYYY-MM-DD" | null }

DATE RULES:
- Extract the purchase/receipt date (prefer the main transaction date, not print/export times).
- If only one date appears, use it for all items.
- If multiple valid dates appear (e.g., order vs. delivery), choose the one closest to totals or header.
- Output in strict ISO format YYYY-MM-DD (pad month/day with leading zero).
- If the date is incomplete but inferable (e.g., "2025/9/3" or "03-09-25"), normalize to YYYY-MM-DD (assume 20xx for 2-digit years 20–69 -> 20yy, 70–99 -> 19yy).
- If no plausible date is present, set "date": null (do NOT invent one).

AMOUNT / TYPE RULES:
- Expenses MUST be negative amounts.
- Credits/refunds MUST be positive amounts (detect words REFUND, CREDIT, RETURN).
- Prefer line items; if only a total exists, output one entry.
- Ignore duplicate totals, payment method lines, change, or tax lines if already included.

GENERAL:
- No commentary or surrounding text—ONLY the JSON array.
- Do NOT wrap in markdown fences.

${hasImage ? 'The image is attached as binary content.' : ''}
${extractedText ? `Receipt text (may be truncated): """${extractedText}"""` : ''}
`.trim();
}

// NEW: util to normalize various date formats to YYYY-MM-DD (returns null if invalid)
function normalizeDateString(str) {
  if (!str || typeof str !== 'string') return null;
  str = str.trim().replace(/[.]/g, '/');
  // Patterns:
  // 1. YYYY-MM-DD or YYYY/MM/DD
  let m = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (m) {
    const [ , y, mo, d ] = m;
    const mm = String(mo).padStart(2,'0');
    const dd = String(d).padStart(2,'0');
    if (+mm >=1 && +mm <=12 && +dd>=1 && +dd<=31) return `${y}-${mm}-${dd}`;
    return null;
  }
  // 2. DD-MM-YYYY or DD/MM/YYYY
  m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const [ , d, mo, y ] = m;
    const mm = String(mo).padStart(2,'0');
    const dd = String(d).padStart(2,'0');
    if (+mm >=1 && +mm <=12 && +dd>=1 && +dd<=31) return `${y}-${mm}-${dd}`;
    return null;
  }
  // 3. DD-MM-YY or MM-DD-YY (ambiguous) -> assume first is day if > 12 else treat first as month
  m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/);
  if (m) {
    let [ , a, b, yy ] = m;
    let year = parseInt(yy,10);
    year = year >= 70 ? 1900 + year : 2000 + year;
    let day, month;
    if (parseInt(a,10) > 12) { day = a; month = b; } else if (parseInt(b,10) > 12) { day = b; month = a; } else { month = a; day = b; }
    const mm = String(month).padStart(2,'0');
    const dd = String(day).padStart(2,'0');
    if (+mm >=1 && +mm <=12 && +dd>=1 && +dd<=31) return `${year}-${mm}-${dd}`;
  }
  return null;
}

// NEW: scan a block of text for the first plausible date
function findFirstDate(text) {
  if (!text) return null;
  const dateTokenRegex = /\b(\d{1,4}[\/\-]\d{1,2}[\/\-]\d{1,4})\b/g;
  let match;
  while ((match = dateTokenRegex.exec(text))) {
    const norm = normalizeDateString(match[1]);
    if (norm) return norm;
  }
  return null;
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

  // NEW: attempt to capture a global receipt date once
  const globalDate = findFirstDate(text);

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
        // NEW: try to find a date inside the line; fallback to globalDate
        const lineDate = findFirstDate(line) || globalDate || null;
        items.push({ raw: line, amount, isCredit: CREDIT.test(line), date: lineDate });
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
    const key = (it.raw.toLowerCase() + '|' + it.amount);
    if (!map.has(key)) map.set(key, it);
  }
  const unique = [...map.values()];

  let results = [];
  if (unique.length) {
    results = unique.map(u => {
      const type = u.isCredit ? 'credit' : 'expense';
      const signed = type === 'expense' ? -Math.abs(u.amount) : Math.abs(u.amount);
      return {
        amount: Number(signed.toFixed(2)),
        type,
        raw: u.raw.slice(0, 160),
        date: u.date || globalDate || null
      };
    });
  } else if (probableTotal != null) {
    results = [{
      amount: Number((-Math.abs(probableTotal)).toFixed(2)),
      type: 'expense',
      raw: 'TOTAL',
      date: globalDate || null
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
    let { amount, type, raw, date } = row;
    if (amount == null) continue;
    const num = Number(amount);
    if (!Number.isFinite(num)) continue;
    if (type !== 'expense' && type !== 'credit') continue;

    // Accept model-provided sign; ensure expense negative / credit positive
    let signed = type === 'expense' ? -Math.abs(num) : Math.abs(num);

    // Normalize date if provided; else attempt from raw
    let finalDate = null;
    if (typeof date === 'string') {
      finalDate = normalizeDateString(date);
    }
    if (!finalDate && typeof raw === 'string') {
      const derived = findFirstDate(raw);
      if (derived) finalDate = derived;
    }

    out.push({
      amount: Number(signed.toFixed(2)),
      type,
      raw: typeof raw === 'string' ? raw.slice(0, 160) : '',
      date: finalDate // may be null
    });
  }
  return out;
}


