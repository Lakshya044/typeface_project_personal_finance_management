import { NextResponse } from 'next/server';
import { CATEGORIES } from '@/lib/categories'; // <-- NEW

export const runtime = 'nodejs';


const MAX_FILE_SIZE = 10 * 1024 * 1024; 
const SUPPORTED_MIME = /^(application\/pdf|image\/)/;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';


export async function POST(request) {
  try {
   
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

    
    let extractedText = '';
    if (file.type === 'application/pdf') {
      try {
        const pdfParse = (await import('pdf-parse')).default;
        const pdfData = await pdfParse(await file.arrayBuffer());
        extractedText = (pdfData.text || '').trim();
      } catch (e) {
        console.warn('[parse-receipt] pdf-parse failed:', e.message);
      }
    }

   
    const transactions = await runGeminiExtraction({
      file,
      extractedText,
    });

    
    if (!transactions.length) {
      return NextResponse.json(
        { error: 'Gemini could not extract any transactions.', provider: 'gemini' },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: true, provider: 'gemini', transactions },
      { status: 200 }
    );

  } catch (err) {
    console.error('[parse-receipt] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}


async function runGeminiExtraction({ file, extractedText }) {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    console.error('[parse-receipt] CRITICAL: Missing GOOGLE_GEMINI_API_KEY');
    return [];
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const isPdf = file.type === 'application/pdf';              // <-- NEW
    const hasImage = file.type.startsWith('image/');            // <-- NEW
    const prompt = buildGeminiPrompt({                          // <-- CHANGED (pass object now)
      hasImage,
      isPdf,
      extractedText
    });

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filePart = {
      inlineData: { data: fileBuffer.toString('base64'), mimeType: file.type },
    };

    const result = await model.generateContent([prompt, filePart]);
    const responseText = result?.response?.text?.() || '';
    const rawArray = extractJsonArray(responseText);

    return postProcessTransactions(rawArray); // <-- NEW normalization
  } catch (e) {
    console.error('[parse-receipt] Gemini extraction failed:', e.message);
    return [];
  }
}

// CHANGED: prompt signature already matches; body updated to include category logic & no date in description
function buildGeminiPrompt({ hasImage, isPdf, extractedText }) {
  const categoryList = CATEGORIES.join(', ');
  return `
You output ONLY a JSON array.

Source may be:
- Standard receipt (image/PDF)
- PDF statement/table with multiple rows

OUTPUT SCHEMA (each element EXACTLY these keys):
{
  "amount": number,            // expense negative, credit/refund positive
  "type": "expense" | "credit",  
  "category": string,          // ONE of: ${categoryList}
  "raw": string,               // concise description ONLY (NO date text)
  "date": "YYYY-MM-DD" | null
}

CATEGORY INFERENCE:
- Choose the BEST fitting category from: ${categoryList}
- Do NOT invent categories; if uncertain pick the closest real category (never "Other" unless truly uncategorizable).
- Infer from merchant / description keywords (e.g. salary->Salary, uber->Transportation, netflix->Entertainment, grocery->Food, electricity->Utilities, medicine/gym->Health, education/book->Education, etc.).

DESCRIPTION ("raw"):
- MUST NOT contain the date.
- NO leading/trailing date tokens, timestamps, or redundant numbers unrelated to merchant/item.
- Keep under ~120 chars, concise merchant/item label.

DATE:
- Parse per-row date where possible; normalize to YYYY-MM-DD.
- If row lacks a date but previous rows form a daily block, reuse last seen date.
- If no plausible date at all -> null (do not fabricate).

AMOUNT:
- Remove currency symbols/commas.
- Parentheses or minus sign => negative.
- Debit/Expense => negative. Credit/Refund/Salary/Deposit => positive.

VALIDATION:
- Omit rows you cannot confidently parse (no amount).
- Do NOT output balances, headers, subtotals, opening/closing lines.

GENERAL:
- Output ONLY the JSON array. No markdown. No commentary.

${hasImage ? 'Image binary attached.' : ''}
${isPdf ? 'PDF text may include tables.' : ''}
${extractedText ? `Extracted text (may be truncated): """${extractedText}"""` : ''}
`.trim();
}

// NEW: post-processing to sanitize and validate category & description
function postProcessTransactions(arr) {
  if (!Array.isArray(arr)) return [];
  const validSet = new Set(CATEGORIES.map(c => c.toLowerCase()));
  const datePrefixRegex = /^(\d{1,4}[\/\-]\d{1,2}[\/\-]\d{1,4})\s*/;
  const anyDateToken = /\b\d{1,4}[\/\-]\d{1,2}[\/\-]\d{1,4}\b/;

  return arr
    .filter(t => t && typeof t === 'object')
    .map(t => {
      let { amount, type, raw, date, category } = t;

      // amount
      const num = Number(amount);
      if (!Number.isFinite(num)) return null;
      type = (type === 'credit') ? 'credit' : 'expense';
      const signed = type === 'expense' ? -Math.abs(num) : Math.abs(num);

      // raw sanitize: ensure string, remove leading date token
      let desc = (raw == null ? '' : String(raw)).trim();
      desc = desc.replace(datePrefixRegex, '').trim();
      // if description still starts with a date token elsewhere, strip again gently
      if (anyDateToken.test(desc.split(' ')[0])) {
        desc = desc.split(' ').slice(1).join(' ').trim();
      }
      if (!desc) desc = 'Transaction';

      // category normalization
      let chosen = (category && typeof category === 'string') ? category.trim() : '';
      if (!validSet.has(chosen.toLowerCase())) {
        // quick heuristic mapping
        const lower = desc.toLowerCase();
        const mapGuess = [
          ['salary', 'Salary'],
          ['uber|ola|lyft|taxi|cab|ride', 'Transportation'],
            ['groc|super|mart|food|restaurant|cafe|meal|dine', 'Food'],
          ['rent|lease', 'Housing'],
          ['netflix|prime|spotify|subscription|subscr', 'Entertainment'],
          ['electric|water|power|gas|utility|bill', 'Utilities'],
          ['gym|fitness|health|medical|doctor|pharma', 'Health'],
          ['book|tuition|course|edu', 'Education'],
          ['travel|flight|hotel|air', 'Travel'],
          ['gift|donat', 'Gifts'],
          ['shop|amazon|store|retail', 'Shopping'],
        ];
        for (const [pattern, cat] of mapGuess) {
          if (new RegExp(pattern).test(lower) && validSet.has(cat.toLowerCase())) {
            chosen = cat;
            break;
          }
        }
        if (!chosen || !validSet.has(chosen.toLowerCase())) {
          chosen = CATEGORIES.includes('Other') ? 'Other' : CATEGORIES[0];
        }
      }

      // date normalization quick (keep if already correct pattern)
      if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        date = null;
      }

      return {
        amount: Number(signed.toFixed(2)),
        type,
        category: chosen,
        raw: desc.slice(0, 160),
        date
      };
    })
    .filter(Boolean);
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