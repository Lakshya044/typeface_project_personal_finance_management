import TransactionForm from "@/components/forms/TransactionForm";
import TransactionTable from "@/components/TransactionTable";
import ExpensesBarChart from "@/components/charts/ExpensesBarChart";
import ReceiptTransactionsExtractor from "@/components/forms/ReceiptTransactionsExtractor";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Personal Finance <span className="text-blue-400">Dashboard</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Track your transactions, manage budgets, and analyze spending patterns with our comprehensive finance management tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/addTransaction" 
                className="bg-blue-600 hover:bg-blue-700 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 inline-flex items-center justify-center transform"
              >
                <svg className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Transaction
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-gray-700 hover:bg-gray-600 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/25 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 inline-flex items-center justify-center transform"
              >
                <svg className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with 3D Animation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Core Features</h2>
          <p className="text-gray-400 text-lg">Essential tools for personal finance management</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Transaction Management with 3D hover effect */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:rotate-y-12 hover:shadow-2xl hover:shadow-blue-500/20 perspective-1000">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 transform transition-transform duration-300 hover:rotate-12 hover:scale-110">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 transition-colors duration-300 hover:text-blue-400">Transaction Management</h3>
            <p className="text-gray-400">Add, edit, and categorize your income and expenses with date filtering and pagination.</p>
          </div>

          {/* Receipt Processing with 3D hover effect */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:rotate-y-12 hover:shadow-2xl hover:shadow-green-500/20 perspective-1000">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 transform transition-transform duration-300 hover:rotate-12 hover:scale-110">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 transition-colors duration-300 hover:text-green-400">Receipt Extraction</h3>
            <p className="text-gray-400">Upload PDF or image receipts to automatically extract transaction data.</p>
          </div>

          {/* Budget Tracking with 3D hover effect */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:rotate-y-12 hover:shadow-2xl hover:shadow-purple-500/20 perspective-1000">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 transform transition-transform duration-300 hover:rotate-12 hover:scale-110">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 transition-colors duration-300 hover:text-purple-400">Budget Management</h3>
            <p className="text-gray-400">Set monthly budgets by category and track spending against your limits.</p>
          </div>

          {/* Expense Charts with 3D hover effect */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:rotate-y-12 hover:shadow-2xl hover:shadow-orange-500/20 perspective-1000">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 transform transition-transform duration-300 hover:rotate-12 hover:scale-110">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 transition-colors duration-300 hover:text-orange-400">Expense Analytics</h3>
            <p className="text-gray-400">Visualize spending trends with monthly expense bar charts and summary statistics.</p>
          </div>

          {/* Category Insights with 3D hover effect */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:rotate-y-12 hover:shadow-2xl hover:shadow-red-500/20 perspective-1000">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 transform transition-transform duration-300 hover:rotate-12 hover:scale-110">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 transition-colors duration-300 hover:text-red-400">Category Breakdown</h3>
            <p className="text-gray-400">See expense distribution across categories with interactive pie charts and detailed breakdowns.</p>
          </div>

          {/* Budget Comparison with 3D hover effect */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:rotate-y-12 hover:shadow-2xl hover:shadow-teal-500/20 perspective-1000">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 transform transition-transform duration-300 hover:rotate-12 hover:scale-110">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 transition-colors duration-300 hover:text-teal-400">Budget vs Actual</h3>
            <p className="text-gray-400">Compare planned budgets with actual spending using detailed comparison charts.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Start Managing Your Finances</h2>
            <p className="text-xl text-gray-300 mb-8">Take control of your money with our comprehensive tracking tools</p>
            <Link 
              href="/addTransaction" 
              className="bg-white text-blue-900 hover:bg-gray-100 hover:scale-105 hover:shadow-xl hover:shadow-white/20 font-semibold py-3 px-8 rounded-lg transition-all duration-300 inline-flex items-center transform"
            >
              Get Started
              <svg className="w-5 h-5 ml-2 transition-transform duration-300 hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 Personal Finance App. Track your financial journey.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

