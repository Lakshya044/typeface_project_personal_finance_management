"use client";
import useSWR from "swr";
import { useUser } from "@/contexts/AuthContext";
import { useCallback, useEffect, useRef, useState } from "react";

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) return [];          
  return res.json();               
};

export function useTransactions({
  pageSize = 20,
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

  const fetchData = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
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
      if (e.name !== "AbortError") {
        setError(e.message || "Failed to load transactions");
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, startDate, endDate]);

  // Fetch when dependencies change
  useEffect(() => {
    fetchData();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchData]);

  // Pagination controls
  const goToPage = (p) =>
    setCurrentPage((prev) => {
      const target = Math.min(Math.max(1, p), totalPages || 1);
      return target === prev ? prev : target;
    });

  const goNext = () => goToPage(currentPage + 1);
  const goPrev = () => goToPage(currentPage - 1);

  // Set date range and reset to first page
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

export default function useTransactionsOld() {
  const { user } = useUser();
  const shouldFetch = !!user;     

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "/api/transactions" : null,
    fetcher
  );

  
  const transactions = Array.isArray(data) ? data : [];

  return { transactions, isLoading, error, mutate };
}
