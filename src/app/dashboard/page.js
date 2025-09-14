// src/app/dashboard/page.js
"use client";

import { useState } from "react";
import { currentMonthId } from "@/lib/budget";

import SummaryCards from "@/components/dashboard/SummaryCards";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import TransactionTable from "@/components/TransactionTable";

import AddBudgetDialog from "@/components/dashboard/AddBudgetDialog";
import MonthPicker from "@/components/dashboard/MonthPicker";

import BudgetComparisonChart from "@/components/charts/BudgetComparisonChart";
import InsightsCard from "@/components/dashboard/InsightsCard";

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonthId());

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-300 mt-1">
                Track your financial overview and insights
              </p>
            </div>
           
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* KPI Summary Cards */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm">
            <div className="p-6">
              <SummaryCards />
            </div>
          </div>

          {/* Budget Analysis Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Budget Analysis
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Compare your spending against budgets for {month}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <MonthPicker month={month} onChange={setMonth} />
                <AddBudgetDialog defaultMonth={month} />
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm">
              <div className="p-6">
                <BudgetComparisonChart month={month} />
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm">
              <div className="p-6">
                <InsightsCard month={month} />
              </div>
            </div>
          </div>

          {/* Financial Overview Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Transactions */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-700 bg-gray-750">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Recent Transactions
                    </h2>
                    <p className="text-sm text-gray-400">
                      Latest financial activity
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <TransactionTable limit={5} />
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-700 bg-gray-750">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Category Breakdown
                    </h2>
                    <p className="text-sm text-gray-400">
                      Spending distribution by category
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <CategoryPieChart />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
