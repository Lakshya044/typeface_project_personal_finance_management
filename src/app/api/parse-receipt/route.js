import { NextResponse } from 'next/server';

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

    const prompt = buildGeminiPrompt(extractedText);
    
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filePart = {
      inlineData: { data: fileBuffer.toString('base64'), mimeType: file.type },
    };

    const result = await model.generateContent([prompt, filePart]);
    const responseText = result?.response?.text?.() || '';
    
    return extractJsonArray(responseText);
  } catch (e) {
    console.error('[parse-receipt] Gemini extraction failed:', e.message);
    return [];
  }
}

function buildGeminiPrompt({ hasImage, isPdf, extractedText }) {
  return `
You output ONLY a JSON array.

The source may be:
- A standard receipt (image or PDF)
- A PDF STATEMENT or TABLE listing multiple transactions (columns like Date | Description | Amount | Category | Debit | Credit)
Your job: Normalize EVERY transaction row into the JSON array.

Each element MUST be:
{ "amount": number, "type": "expense" | "credit", "raw": "short source snippet", "date": "YYYY-MM-DD" | null }

TABLE / STATEMENT RULES (PDF especially):
- Detect header lines (Date, Description, Amount, Debit, Credit, DR, CR, Category, Balance).
- Ignore header, subtotal, running balance, opening/closing balance rows.
- If separate Debit / Credit columns: choose the non-empty one. Debit => expense (negative), Credit => credit (positive).
- Parentheses or leading minus indicate negative.
- Remove currency symbols and commas.
- One JSON object per distinct transaction line.

DATE RULES:
- Use per-row date if present; normalize to YYYY-MM-DD (pad month/day).
- Accept formats: YYYY-MM-DD, YYYY/MM/DD, DD-MM-YYYY, MM/DD/YY, etc. Convert 2‑digit years (70–99 -> 19xx, 00–69 -> 20xx).
- If a row omits the date but belongs to a block where previous row had a date, reuse that date.
- If no plausible date exists, set "date": null (do not invent).

AMOUNT / TYPE RULES:
- Expenses must be negative numbers.
- Credits/refunds (refund, credit, return, reversal, salary, deposit) must be positive.
- If only a total appears and no line items, output a single entry.
- Do NOT add “balance” lines as transactions.

GENERAL:
- Output ONLY the JSON array (no markdown, no prose).
- Keep "raw" concise (<= ~120 chars) summarizing the row.
- Do NOT include extra fields (no category field even if visible—embed any category words inside "raw").

${hasImage ? 'The image binary is attached.' : ''}
${isPdf ? 'Source is a PDF; may contain multi-row tables or statements.' : ''}
${extractedText ? `Extracted text sample (may be truncated): """${extractedText}"""` : ''}
`.trim();
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




