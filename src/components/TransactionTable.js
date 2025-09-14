"use client";
import { useState, useEffect } from "react";
import useTransactions from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";

export default function TransactionTable({ limit }) {
  const { transactions, isLoading, mutate } = useTransactions();
  const [error, setError] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rangeError, setRangeError] = useState("");
  const rangeActive = fromDate && toDate;

  function applyRange(e) {
    e.preventDefault();
    setRangeError("");
    if (!fromDate || !toDate) {
      setRangeError("Both start and end dates required.");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      alert("Start date cannot be after end date. Please select a valid range.");
      setRangeError("Start date must be before end date.");
      return;
    }
  }

  function clearRange() {
    setFromDate("");
    setToDate("");
    setRangeError("");
  }

  let rows = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (rangeActive) {
    rows = rows.filter((t) => {
      const d = new Date(t.date);
      return d >= new Date(fromDate) && d <= new Date(toDate);
    });
  } else {
    rows = rows.slice(0, 20);
  }

  // NEW: publish after render when rows change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.__visibleTransactions = rows;
      window.dispatchEvent(
        new CustomEvent("visible-transactions-changed", { detail: rows })
      );
    } catch {
     
    }
  }, [rows]);

  if (isLoading) return <p>Loading…</p>;
  if (!transactions.length) return <p>No transactions yet.</p>;

  async function handleDelete(id) {
    const previous = transactions;
    mutate(transactions.filter((t) => (t._id === id ? false : true)), false);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await mutate();
    } catch (err) {
      setError(err.message);
      mutate(previous, false);
    }
  }

  return (
    <>
    
      <form
        onSubmit={applyRange}
        className="mb-4 flex flex-col gap-2 md:flex-row md:items-end"
      >
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="default">
            Apply Range
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={clearRange}
            disabled={!rangeActive && !fromDate && !toDate}
          >
            Clear
          </Button>
        </div>
      </form>
      {rangeError && (
        <p className="text-xs text-red-600 mb-2">{rangeError}</p>
      )}
      {rangeActive && (
        <p className="text-xs text-gray-600 mb-2">
          Showing transactions between {fromDate} and {toDate} ({rows.length} found)
        </p>
      )}
      {!rangeActive && (
        <p className="text-xs text-gray-600 mb-2">
          Showing most recent 20 transactions
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 mb-2">
          {error} – please refresh and try again.
        </p>
      )}

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Date</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Category</th>
            <th className="p-2">Description</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {rows.map((t) => (
            <tr key={t._id} className="border-b">
              <td className="p-2">{t.date}</td>
              <td className="p-2">{t.amount}</td>
              <td className="p-2">{t.category}</td>
              <td className="p-2">{t.description}</td>
              <td className="p-2">
                <Button variant="ghost" onClick={() => handleDelete(t._id)}>
                  🗑️
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
