"use client";
import {useTransactions} from "@/hooks/useTransactions";

export default function SummaryCards() {
  const { transactions } = useTransactions({ pageSize: 1000 }); // Get more data for accurate summary

  const totalExpense = transactions
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-red-400">₹{totalExpense.toFixed(2)}</p>
          </div>
          <div className="w-12 h-12 bg-red-900/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Income</p>
            <p className="text-2xl font-bold text-green-400">₹{totalIncome.toFixed(2)}</p>
          </div>
          <div className="w-12 h-12 bg-green-900/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Net Balance</p>
            <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              ₹{netBalance.toFixed(2)}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            netBalance >= 0 ? 'bg-blue-900/20' : 'bg-red-900/20'
          }`}>
            <svg className={`w-6 h-6 ${netBalance >= 0 ? 'text-blue-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
