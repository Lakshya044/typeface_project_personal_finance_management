"use client";
import useSWR from "swr";
import { useUser } from "@/contexts/AuthContext";

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) return [];          
  return res.json();               
};

export default function useTransactions() {
  const { user } = useUser();
  const shouldFetch = !!user;     

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "/api/transactions" : null,
    fetcher
  );

  
  const transactions = Array.isArray(data) ? data : [];

  return { transactions, isLoading, error, mutate };
}
