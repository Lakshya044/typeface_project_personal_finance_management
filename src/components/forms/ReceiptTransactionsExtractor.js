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
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">AI Receipt Parser</h3>
        <p className="text-sm text-gray-400">Upload receipts to automatically extract transaction data</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Select Receipt File</label>
          <div className="flex items-center space-x-3">
            <input
              type="file"
              accept="application/pdf,image/*"
              disabled={loading || saving}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer bg-gray-700 border border-gray-600 rounded-lg"
            />
            <button
              type="submit"
              disabled={!file || loading || saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Parse Receipt'
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-400 bg-gray-750 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>AI Provider: {providerUsed || process.env.NEXT_PUBLIC_RECEIPT_PARSER_PROVIDER || 'Gemini'}</span>
        </div>
        <p>Supports PDF and image files up to 10MB. Expenses will be marked as negative amounts.</p>
      </div>

      {error && (
        <div className="mt-4 flex items-center space-x-2 bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {info && (
        <div className="mt-4 flex items-center space-x-2 bg-green-900/20 border border-green-800 rounded-lg p-3 text-green-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{info}</span>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-medium text-white">Extracted Transactions</h4>
            <button 
              onClick={saveAll} 
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save All Transactions'
              )}
            </button>
          </div>

          <div className="bg-gray-750 border border-gray-600 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left p-3 text-gray-300 font-medium">#</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Date</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Amount</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Type</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {transactions.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-700">
                    <td className="p-3 text-gray-300">{i + 1}</td>
                    <td className="p-3 text-gray-300 font-mono">{(typeof t.date === 'string' && t.date) || '—'}</td>
                    <td className={`p-3 font-mono font-semibold ${t.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      ₹{Math.abs(t.amount).toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        t.type === 'expense' ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300 max-w-xs truncate">{t.raw || 'No description'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* <div className="mt-4 text-xs text-gray-400 flex items-center justify-between">
        <span>Endpoint: <code className="bg-gray-700 px-1 rounded">{TRANSACTION_ENDPOINT}</code></span>
        <button
          type="button"
          onClick={() => setDebugOpen(o => !o)}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          {debugOpen ? 'Hide Debug' : 'Show Debug'}
        </button>
      </div> */}

      {/* {debugOpen && debugLines.length > 0 && (
        // <div className="mt-4 bg-gray-900 border border-gray-600 rounded-lg p-4">
        //   <h5 className="text-sm font-medium text-white mb-2">Debug Information</h5>
        //   <div className="bg-black rounded p-3 max-h-60 overflow-auto">
        //     <pre className="text-xs text-green-400 whitespace-pre-wrap">
        //       {JSON.stringify(debugLines, null, 2)}
        //     </pre>
        //   </div>
        //   <p className="text-xs text-gray-400 mt-2">
        //     If requests fail with 404: verify the server route path matches {TRANSACTION_ENDPOINT}. 
        //     If 400: check category enum or date/amount validation.
        //   </p>
        // </div>
      )} */}
    </div>
  );
};

const th = { textAlign: 'left', borderBottom: '1px solid #ccc', padding: '4px' };
const td = { borderBottom: '1px solid #eee', padding: '4px' };

export default ReceiptTransactionsExtractor;
