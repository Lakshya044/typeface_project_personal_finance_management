"use client";
import { useState, useEffect } from "react";
import { useTransactions } from "@/hooks/useTransactions"; 
import { Button } from "@/components/ui/button";

export default function TransactionTable({ limit = 500 }) {
  const forcedLimit = 10; 
  const {
    transactions,
    currentPage,
    totalPages,
    totalCount,
    loading,
    error,
    goNext,
    goPrev,
    goToPage,
    setDateRange,
    startDate,
    endDate,
    refetch,
  } = useTransactions({ pageSize: forcedLimit });


  const [fromDate, setFromDate] = useState(startDate || "");
  const [toDate, setToDate] = useState(endDate || "");
  const [rangeError, setRangeError] = useState("");

  useEffect(() => {
    setFromDate(startDate || "");
    setToDate(endDate || "");
  }, [startDate, endDate]);

  function applyRange(e) {
    e.preventDefault();
    setRangeError("");
    if (!fromDate && !toDate) {
      setDateRange("", "");
      return;
    }
    if (
      (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) ||
      (toDate && !/^\d{4}-\d{2}-\d{2}$/.test(toDate))
    ) {
      setRangeError("Use YYYY-MM-DD format.");
      return;
    }
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      alert("Start date cannot be after end date.");
      setRangeError("Start date must be before end date.");
      return;
    }
    setDateRange(fromDate, toDate);
  }

  function clearRange() {
    setFromDate("");
    setToDate("");
    setRangeError("");
    setDateRange("", "");
  }

  useEffect(() => {
    function refresh() {
      refetch();
    }
    window.addEventListener("transactions-changed", refresh);
    return () => window.removeEventListener("transactions-changed", refresh);
  }, [refetch]);

 
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.__visibleTransactions = transactions;
      window.dispatchEvent(
        new CustomEvent("visible-transactions-changed", { detail: transactions })
      );
    } catch {}
  }, [transactions]);

  async function handleDelete(id) {
    try {
      await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      refetch();
    } catch {
     
    }
  }

  if (loading && !transactions.length) return <p className="text-white">Loading…</p>;
  if (!loading && !transactions.length) return <p className="text-white">No transactions yet.</p>;

  return (
    <>
      <form
        onSubmit={applyRange}
        className="mb-4 flex flex-col gap-2 md:flex-row md:items-end bg-gray-800 p-4 rounded-lg border border-gray-700"
      >
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-300">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-600 bg-gray-700 text-white px-2 py-1 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-300">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-600 bg-gray-700 text-white px-2 py-1 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="default" disabled={loading} className="bg-blue-600 hover:bg-blue-700 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 text-white transition-all duration-200 transform">
            Apply Range
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={clearRange}
            disabled={loading && !fromDate && !toDate}
            className="bg-gray-600 hover:bg-gray-500 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/25 text-white border-gray-600 transition-all duration-200 transform"
          >
            Clear
          </Button>
        </div>
      </form>

      {rangeError && (
        <p className="text-xs text-red-400 mb-2 bg-red-900/20 border border-red-800 rounded p-2">{rangeError}</p>
      )}
      {(startDate || endDate) && (
        <p className="text-xs text-gray-400 mb-2 bg-gray-800 border border-gray-700 rounded p-2">
          Filter: {startDate || "…"} → {endDate || "…"}
        </p>
      )}
      {!startDate && !endDate && (
        <p className="text-xs text-gray-400 mb-2 bg-gray-800 border border-gray-700 rounded p-2">
          Paginated (server) – Page {currentPage} of {totalPages} (page size{" "}
          {forcedLimit})
        </p>
      )}
      {error && (
        <p className="text-sm text-red-400 mb-2 bg-red-900/20 border border-red-800 rounded p-2">
          {error} – try again.
        </p>
      )}

      <table className="w-full border-collapse bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <thead className="bg-gray-750">
          <tr className="text-left border-b border-gray-700">
            <th className="p-2 text-gray-300 font-medium">Date</th>
            <th className="p-2 text-gray-300 font-medium">Amount</th>
            <th className="p-2 text-gray-300 font-medium">Category</th>
            <th className="p-2 text-gray-300 font-medium">Description</th>
            <th className="text-gray-300 font-medium" />
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t._id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
              <td className="p-2 text-gray-300 font-mono">{t.date}</td>
              <td className={`p-2 font-mono font-semibold ${t.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {t.amount < 0 ? '-' : '+'}₹{Math.abs(t.amount).toFixed(2)}
              </td>
              <td className="p-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300 border border-blue-800">
                  {t.category}
                </span>
              </td>
              <td className="p-2 text-gray-300">{t.description}</td>
              <td className="p-2">
                <Button variant="ghost" onClick={() => handleDelete(t._id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 hover:scale-110 hover:shadow-md transition-all duration-200 transform">
                  🗑️
                </Button>
              </td>
            </tr>
          ))}
          {loading && (
            <tr>
              <td
                colSpan={5}
                className="p-2 text-center text-xs text-gray-400"
              >
                Loading…
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center gap-3 mt-4 text-sm bg-gray-800 border border-gray-700 rounded-lg p-4">
        <Button
          type="button"
          variant="secondary"
          onClick={goPrev}
          disabled={currentPage === 1 || loading}
          className="bg-gray-600 hover:bg-gray-500 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/25 text-white border-gray-600 transition-all duration-200 transform"
        >
          Prev
        </Button>
        <span className="text-gray-300">
          Page {currentPage} / {totalPages} ({totalCount} total)
        </span>
        <Button
          type="button"
          variant="secondary"
          onClick={goNext}
          disabled={currentPage === totalPages || loading}
          className="bg-gray-600 hover:bg-gray-500 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/25 text-white border-gray-600 transition-all duration-200 transform"
        >
          Next
        </Button>
        <label className="flex items-center gap-1 text-gray-300">
          Go to:
          <input
            type="number"
            min={1}
            max={totalPages}
            className="w-16 border border-gray-600 bg-gray-700 text-white px-2 py-1 rounded focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const val = parseInt(e.currentTarget.value, 10);
                if (!isNaN(val)) goToPage(val);
              }
            }}
          />
        </label>
      </div>
    </>
  );
}
