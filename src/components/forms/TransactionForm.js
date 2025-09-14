"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema } from "@/lib/validation";
import {useTransactions} from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";   
import { Input } from "@/components/ui/input";

import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";

export default function TransactionForm({ preset, onClose }) {
  const { mutate } = useTransactions();
  const { register, handleSubmit, reset, setValue, formState } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: preset || {
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      description: "",
    },
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(data) {
    setLoading(true);
    const method = preset?._id ? "PUT" : "POST";
    const url = preset?._id
      ? `/api/transactions/${preset._id}`
      : "/api/transactions";

    const res = await fetch(url, { method, body: JSON.stringify(data) });
    if (!res.ok) {
      setLoading(false);
      return;
    }
    await mutate();          
    reset();                
    setLoading(false);
    onClose?.();

    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("transactions-changed")); 
      }
    } catch {}
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Amount</label>
        <Input 
          {...register("amount", { valueAsNumber: true })} 
          placeholder="Enter amount (negative for expenses)" 
          type="number" 
          step="0.01"
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
        />
        {formState.errors.amount && <p className="text-red-400 text-sm">{formState.errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Date</label>
        <Input 
          {...register("date")} 
          type="date" 
          className="bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
        />
        {formState.errors.date && <p className="text-red-400 text-sm">{formState.errors.date.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Description</label>
        <Input 
          {...register("description")} 
          placeholder="Enter transaction description" 
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Category</label>
        <Select
          defaultValue={preset?.category}
          onValueChange={(val) => setValue("category", val)}
        >
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            {CATEGORIES.map((c) => (
              <SelectItem 
                key={c} 
                value={c}
                className="text-white hover:bg-gray-600 focus:bg-gray-600"
              >
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formState.errors.category && (
          <p className="text-red-400 text-sm">{formState.errors.category.message}</p>
        )}
      </div>

      <Button 
        disabled={loading} 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Saving...
          </div>
        ) : (
          "Save Transaction"
        )}
      </Button>
    </form>
  );
}
