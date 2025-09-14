"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useTransactions({
  pageSize = 10,
  startDate: initialStartDate = "",
  endDate: initialEndDate = "",
} = {}) {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  const fetchData = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("limit", String(pageSize));
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    try {
      const res = await fetch(`/api/transactions?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.errors?.join?.(", ") ||
            data?.error ||
            `Request failed (${res.status})`
        );
      }
      const data = await res.json();
      setTransactions(data.items || []);
      setTotalCount(data.totalCount || 0);
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, startDate, endDate]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  const goToPage = (p) =>
    setCurrentPage((prev) => {
      const target = Math.min(Math.max(1, p), totalPages || 1);
      return target === prev ? prev : target;
    });
  const goNext = () => goToPage(currentPage + 1);
  const goPrev = () => goToPage(currentPage - 1);

  const setDateRange = (start, end) => {
    setStartDate(start || "");
    setEndDate(end || "");
    setCurrentPage(1);
  };

  return {
    transactions,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    startDate,
    endDate,
    loading,
    error,
    goNext,
    goPrev,
    goToPage,
    setDateRange,
    refetch: fetchData,
  };
}
