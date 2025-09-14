'use client'
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const ReceiptTransactionsExtractor = () => {
  const { handleSubmit } = useForm(); 
 
  const [file, setFile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [providerUsed, setProviderUsed] = useState('');
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugLines, setDebugLines] = useState([]); 


  function handleFileChange(e) {
    setError('');
    setInfo('');
    setTransactions([]);
    const f = e.target.files?.[0];
    if (!f) { setFile(null); return; }
    if (!/^(application\/pdf|image\/)/.test(f.type)) {
      setError('Only PDF or image files are supported.');
      setFile(null);
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File exceeds 10MB limit.');
      setFile(null);
      return;
    }
    setFile(f);
  }

  const onSubmit = async () => {
    if (!file) { setError('Please choose a file first.'); return; }
    setLoading(true);
    setError('');
    setInfo('');
    setTransactions([]);
    setProviderUsed('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/parse-receipt', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      console.log('[ReceiptExtractor] /api/parse-receipt -> status:', res.status, 'payload:', data);
      if (!res.ok) {
        console.error('[ReceiptExtractor] parse-receipt error detail:', data);
        setError(data?.error || 'Parsing failed.');
      } else if (Array.isArray(data.transactions) && data.transactions.length) {
        setTransactions(data.transactions);
        setInfo(`Detected ${data.transactions.length} transaction(s).`);
        setProviderUsed(data.provider || '');
      } else {
        setError('No transactions detected.');
      }
    } catch (e) {
      console.error('[ReceiptExtractor] parse-receipt network/uncaught error:', e);
      setError('Network error during parsing.');
    } finally {
      setLoading(false);
    }
  };

  const DEFAULT_CATEGORY = process.env.NEXT_PUBLIC_FALLBACK_CATEGORY || 'Other';
function guessCategory(raw = '') {
  const r = raw.toLowerCase();
  if (/groc|super|mart|food/.test(r)) return 'Food';
  if (/uber|lyft|ride|taxi|transport/.test(r)) return 'Transportation';
  if (/coffee|cafe|restaurant|dine|meal|food/.test(r)) return 'Entertainment';
  if (/rent|lease/.test(r)) return 'Other'; 
  if (/subscr|netflix|prime|spotify|service/.test(r)) return 'Entertainment';
  if (/util|electric|water|gas|power|bill/.test(r)) return 'Utilities';
  return DEFAULT_CATEGORY; 
}



  const TRANSACTION_ENDPOINT =
    process.env.NEXT_PUBLIC_TRANSACTION_ENDPOINT ||
    '/api/transactions'; 

  async function saveAll() {
    if (!transactions.length) return;
    setSaving(true);
    setError('');
    setInfo('');
    setDebugLines([]);
    try {
      const today = new Date().toISOString().slice(0, 10); // reference fallback date
      const successes = [];
      const failures = [];

      for (const [idx, t] of transactions.entries()) {
        const amountNum = Number(t.amount);
        if (!Number.isFinite(amountNum)) {
          failures.push({ index: idx, error: 'Amount not numeric' });
          continue;
        }

        // NEW: prefer extracted date if valid ISO (YYYY-MM-DD), else fallback to today
        let transactionDate =
          typeof t.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date)
            ? t.date
            : today;

        const rawSnippet = typeof t.raw === 'string' ? t.raw : '';
        const description = (`Receipt: ${rawSnippet}` || 'Receipt import').slice(0, 100);
        const category = guessCategory(rawSnippet);

        const payload = { date: transactionDate, amount: amountNum, description, category };

        let respJson = null;
        let status = 0;
        try {
          const res = await fetch(TRANSACTION_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          status = res.status;
          respJson = await res.json().catch(() => ({}));
          console.log('[ReceiptExtractor] POST /api/transactions row', idx + 1, 'status:', res.status, 'response:', respJson);
          if (!res.ok) {
            throw new Error(respJson?.error || `Failed to save item #${idx + 1}`);
          } else {
            successes.push(idx);
          }
        } catch (innerErr) {
          failures.push({ index: idx, error: innerErr.message });
        }

        setDebugLines(d => [
          ...d,
          {
            idx,
            chosenDate: transactionDate,
            originalDate: t.date ?? null,
            request: payload,
            status,
            response: respJson
          }
        ]);
      }

      if (failures.length && successes.length) {
        setError(`Saved ${successes.length}, failed ${failures.length}. Open debug for details.`);
      } else if (failures.length) {
        setError(`All ${failures.length} saves failed. Check endpoint & data.`);
      } else {
        setInfo(`All ${successes.length} transactions saved successfully.`);
        setTransactions([]);
        setFile(null);
        // optional: notify rest of app
        try { window.dispatchEvent(new Event('transactions-changed')); } catch {}
      }
    } catch (err) {
      setError(err.message || 'Save failed (unexpected).');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: 8 }}>
      <h2 style={{ marginTop: 0 }}>Receipt Transactions Extractor</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: '0.75rem' }}>
        <input
          type="file"
          accept="application/pdf,image/*"
          disabled={loading || saving}
          onChange={handleFileChange}
        />
        <button
          type="submit"
          style={{ marginLeft: '0.5rem' }}
          disabled={!file || loading || saving}
        >
          {loading ? 'Processing...' : 'Upload & Parse'}
        </button>
      </form>
      <p style={{ fontSize: '0.75rem', color: '#555', marginTop: 0 }}>
        Provider: {providerUsed || process.env.NEXT_PUBLIC_RECEIPT_PARSER_PROVIDER || 'Gemini'} | Expenses negative, credits positive. Max file size 10MB.
      </p>
      {error && <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</div>}
      {info && <div style={{ color: 'green', fontSize: '0.85rem', marginTop: '0.5rem' }}>{info}</div>}
      {transactions.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>Date{/* NEW */}</th>
                <th style={th}>Amount</th>
                <th style={th}>Type</th>
                <th style={th}>Raw Snippet</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={i} style={{ background: '#fafafa' }}>
                  <td style={td}>{i + 1}</td>
                  <td style={td}>{(typeof t.date === 'string' && t.date) || '—'}</td> {/* NEW */}
                  <td style={{ ...td, color: t.amount < 0 ? '#b00' : '#060' }}>{t.amount}</td>
                  <td style={td}>{t.type}</td>
                  <td style={td}>{t.raw || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '0.75rem' }}>
            <button onClick={saveAll} disabled={saving}>
              {saving ? 'Saving...' : 'Save All'}
            </button>
          </div>
        </div>
      )}
      <p style={{ fontSize: '0.65rem', color: '#777', marginTop: '0.25rem' }}>
        Using endpoint: <code>{TRANSACTION_ENDPOINT}</code>{' '}
        <button
          type="button"
          onClick={() => setDebugOpen(o => !o)}
          style={{ marginLeft: '0.5rem' }}
        >
          {debugOpen ? 'Hide Debug' : 'Show Debug'}
        </button>
      </p>
      {debugOpen && debugLines.length > 0 && (
        <div
          style={{
            marginTop: '1rem',
            background: '#1e1e1e',
            color: '#d1d1d1',
            padding: '0.75rem',
            borderRadius: 6,
            fontSize: '0.7rem',
            maxHeight: 220,
            overflow: 'auto'
          }}
        >
          <strong>Debug Log</strong>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
{JSON.stringify(debugLines, null, 2)}
          </pre>
          <p style={{ margin: 0 }}>
            If requests fail with 404: verify the server route path matches {TRANSACTION_ENDPOINT}. If 400: check category
            enum or date/amount validation.
          </p>
        </div>
      )}
    </div>
  );
};

const th = { textAlign: 'left', borderBottom: '1px solid #ccc', padding: '4px' };
const td = { borderBottom: '1px solid #eee', padding: '4px' };

export default ReceiptTransactionsExtractor;
