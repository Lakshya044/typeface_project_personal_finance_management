"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import useBudgets from "@/hooks/useBudgets";
import {useTransactions} from "@/hooks/useTransactions";
import { CATEGORIES } from "@/lib/categories";
import { currentMonthId } from "@/lib/budget";

export default function BudgetComparisonChart({ month = currentMonthId() }) {
  const { budgets } = useBudgets(month);
  const { transactions } = useTransactions();          

  const budgetMap = {};
  budgets.forEach((b) => (budgetMap[b.category] = b.amount));

  const actualMap = {};
  transactions
    .filter((t) => t.date.startsWith(month) && t.amount < 0)
    .forEach((t) => {
      actualMap[t.category] = (actualMap[t.category] || 0) + Math.abs(t.amount);
    });

  const data = CATEGORIES.map((cat) => ({
    category: cat,
    Budget: budgetMap[cat] || 0,
    Actual: actualMap[cat] || 0,
  })).filter((d) => d.Budget || d.Actual); 

  if (!data.length) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Budget Data Available</h3>
        <p className="text-gray-400 mb-6">No budget or spending data found for {month}</p>
        <div className="inline-flex items-center text-sm text-blue-400">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Set up budgets to start tracking
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/40 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{`${label}`}</p>
          {payload.map((entry) => (
            <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ₹${entry.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Chart Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Budget vs Actual Spending</h3>
          <p className="text-sm text-gray-400">Comparing budgeted amounts with actual expenses for {month}</p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-300">Budget</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span className="text-gray-300">Actual</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/40 rounded-lg p-4 shadow-xl">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.6} />
            <XAxis 
              dataKey="category" 
              stroke="#9ca3af"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                backdropFilter: 'blur(8px)'
              }}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(value) => `₹${value}`}
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                backdropFilter: 'blur(8px)'
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                color: '#d1d5db', 
                fontSize: '14px',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                backdropFilter: 'blur(8px)',
                background: 'rgba(31, 41, 55, 0.6)',
                borderRadius: '8px',
                padding: '8px'
              }}
            />
            <Bar 
              dataKey="Budget" 
              fill="#3b82f6" 
              radius={[2, 2, 0, 0]}
              name="Budget"
            />
            <Bar 
              dataKey="Actual" 
              fill="#ef4444" 
              radius={[2, 2, 0, 0]}
              name="Actual"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/40 rounded-lg p-4 text-center shadow-xl">
          <div className="text-sm text-gray-400 mb-1">Total Budget</div>
          <div className="text-lg font-semibold text-blue-400">
            ₹{data.reduce((sum, item) => sum + item.Budget, 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/40 rounded-lg p-4 text-center shadow-xl">
          <div className="text-sm text-gray-400 mb-1">Total Spent</div>
          <div className="text-lg font-semibold text-red-400">
            ₹{data.reduce((sum, item) => sum + item.Actual, 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/40 rounded-lg p-4 text-center shadow-xl">
          <div className="text-sm text-gray-400 mb-1">Remaining</div>
          <div className={`text-lg font-semibold ${
            data.reduce((sum, item) => sum + item.Budget - item.Actual, 0) >= 0 
              ? 'text-green-400' 
              : 'text-red-400'
          }`}>
            ₹{data.reduce((sum, item) => sum + item.Budget - item.Actual, 0).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
