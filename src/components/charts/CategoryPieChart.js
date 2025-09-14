"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState, useMemo } from "react";
import { CATEGORIES } from "@/lib/categories";

const COLORS = [
  "#f87171", "#fb923c", "#fbbf24",
  "#34d399", "#60a5fa", "#a78bfa",
  "#f472b6", "#4ade80", "#94a3b8",
];

/**
 * @param {{ month?: string }} props
 */
export default function CategoryPieChart({ month }) {
  
  const [rows, setRows] = useState(
    typeof window !== "undefined" && Array.isArray(window.__visibleTransactions)
      ? window.__visibleTransactions
      : []
  );

  useEffect(() => {
    function handler(e) {
      if (Array.isArray(e.detail)) setRows(e.detail);
    }
    window.addEventListener("visible-transactions-changed", handler);
    return () =>
      window.removeEventListener("visible-transactions-changed", handler);
  }, []);

  
  const working = useMemo(() => {
    if (!month) return rows;
    return rows.filter((t) => t.date?.startsWith(month));
  }, [rows, month]);

  if (!working.length) return null;

 
  const expenses = working.filter((t) => typeof t.amount === "number" && t.amount < 0);

  const totals = CATEGORIES.map((cat) => ({
    name: cat,
    value: expenses
      .filter((t) => t.category === cat)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
  })).filter((d) => d.value > 0);

  if (!totals.length)
    return <p>{month ? "No expenses in this range." : "No expenses."}</p>;

  const grandTotal = expenses.reduce(
    (sum, t) => sum + Math.abs(t.amount),
    0
  );

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
        Total Expense: {grandTotal.toFixed(2)}
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie dataKey="value" data={totals} cx="50%" cy="50%" outerRadius={110}>
            {totals.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
