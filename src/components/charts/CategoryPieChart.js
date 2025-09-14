"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEffect, useState, useMemo } from "react";
import { CATEGORIES } from "@/lib/categories";

// Professional color palette for financial charts
const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#84cc16", // Lime
  "#ec4899", // Pink
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#eab308", // Yellow
  "#f43f5e", // Rose
  "#22c55e", // Green
  "#a855f7", // Purple
  "#0ea5e9", // Sky
  "#d946ef", // Fuchsia
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

  if (!working.length) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Data Available</h3>
        <p className="text-gray-400">No transactions found for the selected period</p>
      </div>
    );
  }

 
  const expenses = working.filter((t) => typeof t.amount === "number" && t.amount < 0);

  const totals = CATEGORIES.map((cat) => ({
    name: cat,
    value: expenses
      .filter((t) => t.category === cat)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
  })).filter((d) => d.value > 0);

  if (!totals.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">{month ? "No expenses in this range." : "No expenses found."}</p>
      </div>
    );
  }

  const grandTotal = expenses.reduce(
    (sum, t) => sum + Math.abs(t.amount),
    0
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / grandTotal) * 100).toFixed(1);
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-sm" style={{ color: data.payload.fill }}>
            ₹{data.value.toFixed(2)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Expense Distribution</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {month ? `Expenses for ${month}` : "All time expenses"}
          </p>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Expenses</p>
            <p className="text-lg font-semibold text-red-400">₹{grandTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie 
              dataKey="value" 
              data={totals} 
              cx="50%" 
              cy="50%" 
              outerRadius={100}
              innerRadius={40}
              paddingAngle={2}
            >
              {totals.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: '#d1d5db', fontSize: '12px' }}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Category Breakdown</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {totals.map((item, index) => {
            const percentage = ((item.value / grandTotal) * 100).toFixed(1);
            return (
              <div key={item.name} className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm text-gray-300">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">₹{item.value.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{percentage}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
