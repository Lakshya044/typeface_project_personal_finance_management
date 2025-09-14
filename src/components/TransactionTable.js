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

  if (loading && !transactions.length) return <p>Loading…</p>;
  if (!loading && !transactions.length) return <p>No transactions yet.</p>;

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
          <Button type="submit" variant="default" disabled={loading}>
            Apply Range
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={clearRange}
            disabled={loading && !fromDate && !toDate}
          >
            Clear
          </Button>
        </div>
      </form>

      {rangeError && (
        <p className="text-xs text-red-600 mb-2">{rangeError}</p>
      )}
      {(startDate || endDate) && (
        <p className="text-xs text-gray-600 mb-2">
          Filter: {startDate || "…"} → {endDate || "…"}
        </p>
      )}
      {!startDate && !endDate && (
        <p className="text-xs text-gray-600 mb-2">
          Paginated (server) – Page {currentPage} of {totalPages} (page size{" "}
          {forcedLimit})
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 mb-2">
          {error} – try again.
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
          {transactions.map((t) => (
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
          {loading && (
            <tr>
              <td
                colSpan={5}
                className="p-2 text-center text-xs text-gray-500"
              >
                Loading…
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center gap-3 mt-4 text-sm">
        <Button
          type="button"
          variant="secondary"
          onClick={goPrev}
          disabled={currentPage === 1 || loading}
        >
          Prev
        </Button>
        <span>
          Page {currentPage} / {totalPages} ({totalCount} total)
        </span>
        <Button
          type="button"
          variant="secondary"
          onClick={goNext}
          disabled={currentPage === totalPages || loading}
        >
          Next
        </Button>
        <label className="flex items-center gap-1">
          Go to:
          <input
            type="number"
            min={1}
            max={totalPages}
            className="w-16 border px-2 py-1 rounded"
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
