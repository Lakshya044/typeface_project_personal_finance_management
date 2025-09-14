"use client";
import useBudgets from "@/hooks/useBudgets";
import {useTransactions} from "@/hooks/useTransactions";
import { currentMonthId } from "@/lib/budget";
import { useUser } from "@/contexts/AuthContext";

export default function InsightsCard({ month = currentMonthId() }) {
  const { user, loading } = useUser();
  const { budgets } = useBudgets(month);
  const { transactions } = useTransactions();

  // If no user, show empty state with title
  if (loading || !user) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-yellow-900/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Budget Insights</h3>
            <p className="text-sm text-gray-400">Spending alerts for {month}</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400">Sign in to view budget insights</p>
        </div>
      </div>
    );
  }

  // Map category -> { budget, spent }
  const map = {};
  budgets.forEach((b) => (map[b.category] = { budget: b.amount, spent: 0 }));

  transactions
    .filter((t) => t.date.startsWith(month) && t.amount < 0)
    .forEach((t) => {
      const entry = map[t.category] || { budget: 0, spent: 0 };
      entry.spent += Math.abs(t.amount);
      map[t.category] = entry;
    });

  const alerts = Object.entries(map)
    .filter(([_, v]) => v.budget && v.spent > v.budget * 0.8) // >80 %
    .map(([cat, v]) => ({
      cat,
      pct: Math.round((v.spent / v.budget) * 100),
    }));

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-yellow-900/20 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Budget Insights</h3>
          <p className="text-sm text-gray-400">Spending alerts for {month}</p>
        </div>
      </div>

      <div className="space-y-3">
        {!alerts.length && (
          <div className="flex items-center space-x-3 bg-green-900/20 border border-green-800 rounded-lg p-4">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-green-400 font-medium">All budgets on track! 🎉</p>
              <p className="text-sm text-green-300">Great job managing your finances this month.</p>
            </div>
          </div>
        )}
        
        {alerts.map((a) => (
          <div key={a.cat} className="flex items-center space-x-3 bg-red-900/20 border border-red-800 rounded-lg p-4">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.872-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-red-400 font-medium">
                <span className="text-white">{a.cat}</span> budget alert
              </p>
              <p className="text-sm text-red-300">
                You have spent <span className="font-semibold">{a.pct}%</span> of your budget for this category.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
