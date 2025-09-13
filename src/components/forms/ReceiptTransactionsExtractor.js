'use client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

const ReceiptTransactionsExtractor = () => {
  const { handleSubmit } = useForm()
  const [file, setFile] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [providerUsed, setProviderUsed] = useState('')

  function handleFileChange(e) {
    setError('')
    setInfo('')
    setTransactions([])
    const f = e.target.files?.[0]
    if (!f) { setFile(null); return }
    if (!/^(application\/pdf|image\/)/.test(f.type)) {
      setError('Only PDF or image files are supported.')
      setFile(null)
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File exceeds 10MB limit.')
      setFile(null)
      return
    }
    setFile(f)
  }

  const onSubmit = async () => {
    if (!file) { setError('Please choose a file first.'); return }
    setLoading(true)
    setError('')
    setInfo('')
    setTransactions([])
    setProviderUsed('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/parse-receipt', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Parsing failed.')
      } else if (Array.isArray(data.transactions) && data.transactions.length) {
        setTransactions(data.transactions)
        setInfo(`Detected ${data.transactions.length} transaction(s).`)
        setProviderUsed(data.provider || '')
      } else {
        setError('No transactions detected.')
      }
    } catch {
      setError('Network error during parsing.')
    } finally {
      setLoading(false)
    }
  }

  async function saveAll() {
    if (!transactions.length) return
    setSaving(true)
    setError('')
    setInfo('')
    try {
      const date = new Date().toISOString().slice(0, 10)
      for (let i = 0; i < transactions.length; i++) {
        const t = transactions[i]
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date,
            amount: t.amount,
            description: t.raw ? `Receipt: ${t.raw.slice(0, 40)}` : 'Receipt import',
            category: '',
            merchant: ''
          })
        })
        const rjson = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(rjson?.error || `Failed to save item #${i + 1}`)
      }
      setInfo('All transactions saved successfully.')
      setTransactions([])
      setFile(null)
    } catch (err) {
      setError(err.message || 'Save failed.')
    } finally {
      setSaving(false)
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
                <th style={th}>Amount</th>
                <th style={th}>Type</th>
                <th style={th}>Raw Snippet</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={i} style={{ background: '#fafafa' }}>
                  <td style={td}>{i + 1}</td>
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
    </div>
  )
}

const th = { textAlign: 'left', borderBottom: '1px solid #ccc', padding: '4px' }
const td = { borderBottom: '1px solid #eee', padding: '4px' }

export default ReceiptTransactionsExtractor
