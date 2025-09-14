"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";   
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";

export default function TransactionForm({ preset, onClose }) {
  const { register, handleSubmit, reset, setValue, formState } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: preset || {
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      description: "",
      category: CATEGORIES[0] || "Other"   // <-- added to avoid undefined
    },
  });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(""); // optional consolidated error

  let mutate; // safe placeholder (not used unless injected)

  const safeCreate = async (payload) => {
    if (typeof mutate === "function") {
      return await mutate(payload);
    }
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data?.errors?.[0]?.message ||
        (Array.isArray(data?.errors) && data.errors[0]) ||
        data?.error ||
        "Save failed"
      );
    }
    return data;
  };

  async function onSubmit(formData) {
    setSubmitError("");
    setLoading(true);
    try {
      // normalize numeric
      const numericAmount = Number(formData.amount);
      if (!Number.isFinite(numericAmount) || numericAmount === 0) {
        throw new Error("Amount must be a non-zero number.");
      }
      const payload = {
        date: formData.date,
        amount: numericAmount,
        category: formData.category,
        description: formData.description.trim()
      };

      if (preset?._id) {
        // UPDATE (PUT)
        const res = await fetch(`/api/transactions/${preset._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
            throw new Error(
              data?.errors?.[0]?.message ||
              (Array.isArray(data?.errors) && data.errors[0]) ||
              data?.error ||
              "Update failed"
            );
        }
      } else {
        // CREATE
        await safeCreate(payload);
      }

      reset({
        amount: "",
        date: new Date().toISOString().slice(0, 10),
        description: "",
        category: CATEGORIES[0] || "Other"
      });

      onClose?.();
      try { window.dispatchEvent(new Event("transactions-changed")); } catch {}
    } catch (e) {
      setSubmitError(e.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {submitError && (
        <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-2">{submitError}</p>
      )}
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
          defaultValue={preset?.category || (CATEGORIES[0] || "Other")}
          onValueChange={(val) => setValue("category", val, { shouldValidate: true })}
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
        className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Saving...
          </div>
        ) : (
          (preset?._id ? "Update Transaction" : "Save Transaction")
        )}
      </Button>
    </form>
  );
}
