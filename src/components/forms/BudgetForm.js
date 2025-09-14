"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { budgetSchema } from "@/lib/validation";
import { CATEGORIES } from "@/lib/categories";
import { currentMonthId } from "@/lib/budget";
import useBudgets from "@/hooks/useBudgets";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} 
from "@/components/ui/select";
import { Button } from "@/components/ui/button";

/**
 * @param {{ preset?: object, defaultMonth?: string, onClose?: () => void }}
 */
export default function BudgetForm({ preset, defaultMonth, onClose }) {
  const monthNow = defaultMonth || currentMonthId();
  const { mutate } = useBudgets(preset?.month || monthNow);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: preset || {
      month: monthNow,
      category: "Food",
      amount: "",
    },
  });

  const [loading, setLoading] = useState(false);

  async function onSubmit(data) {
    setLoading(true);
    const method = preset?._id ? "PUT" : "POST";
    const url = preset?._id ? `/api/budgets/${preset._id}` : "/api/budgets";

    await fetch(url, { method, body: JSON.stringify(data) });
    await mutate(); 

    setLoading(false);
    reset();
    onClose?.();
  }

  
  async function handleDelete() {
    if (!preset?._id) return;
    const confirmed = confirm("Delete this budget?");
    if (!confirmed) return;

    setLoading(true);
    await fetch(`/api/budgets/${preset._id}`, { method: "DELETE" });
    await mutate();
    setLoading(false);
    onClose?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Month */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Month</label>
        <Input 
          {...register("month")} 
          type="month" 
          className="bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Category</label>
        <Select
          defaultValue={preset?.category}
          onValueChange={(v) => setValue("category", v)}
          {...register("category")}
        >
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500">
            <SelectValue placeholder="Select category" />
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
        {errors.category && (
          <p className="text-red-400 text-sm">{errors.category.message}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Budget Amount</label>
        <Input
          {...register("amount", { valueAsNumber: true })}
          placeholder="Enter budget amount in ₹"
          type="number"
          step="0.01"
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.amount && (
          <p className="text-red-400 text-sm">{errors.amount.message}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button 
          type="submit" 
          disabled={loading} 
          className="flex-1 bg-blue-600 hover:bg-blue-700 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </div>
          ) : (
            "Save Budget"
          )}
        </Button>

        {preset?._id && (
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform"
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
