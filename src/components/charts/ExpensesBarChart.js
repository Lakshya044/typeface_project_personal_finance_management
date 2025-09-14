"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";

export default function ExpensesBarChart() {
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
  
  if (!rows.length) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Expense Data</h3>
        <p className="text-gray-400">Add some transactions to see expense trends</p>
      </div>
    );
  }

  // Aggregate by YYYY-MM string using rows instead of transactions
  const grouped = {};
  rows.forEach(({ date, amount }) => {
    if (amount >= 0) return; // only expenses
    const month = date.slice(0, 7);
    grouped[month] = (grouped[month] || 0) + Math.abs(amount);
  });
  const data = Object.entries(grouped)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-1">{label}</p>
          <p className="text-sm text-red-400">
            Total Expenses: ₹{payload[0].value.toFixed(2)}
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
        <h3 className="text-lg font-semibold text-white mb-1">Monthly Expense Trends</h3>
        <p className="text-sm text-gray-400">Track your spending patterns over time</p>
      </div>

      {/* Chart Container */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="total" 
              fill="#ef4444" 
              radius={[4, 4, 0, 0]}
              name="Expenses"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-4 bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-400">Total Months</p>
            <p className="text-lg font-semibold text-white">{data.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Average Monthly</p>
            <p className="text-lg font-semibold text-red-400">
              ₹{(data.reduce((sum, item) => sum + item.total, 0) / data.length).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Highest Month</p>
            <p className="text-lg font-semibold text-red-400">
              ₹{Math.max(...data.map(item => item.total)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
