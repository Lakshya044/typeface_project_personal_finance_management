import TransactionForm from "@/components/forms/TransactionForm";
import TransactionTable from "@/components/TransactionTable";
import ExpensesBarChart from "@/components/charts/ExpensesBarChart";
import ReceiptTransactionsExtractor from "@/components/forms/ReceiptTransactionsExtractor";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Transaction Management
              </h1>
              <p className="text-gray-300 mt-1">
                Add transactions manually or extract from receipts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-10">
          {/* Top Row - Add Transaction and Monthly Expenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Add Transaction Form */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm w-full">
              <div className="px-6 py-4 border-b border-gray-700">
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Add Transaction
                    </h2>
                    <p className="text-sm text-gray-400">
                      Manually enter transaction details
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8 min-h-[500px] flex flex-col">
                <TransactionForm />
              </div>
            </div>

            {/* Monthly Expenses Chart */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm w-full">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-900 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Monthly Expenses
                    </h2>
                    <p className="text-sm text-gray-400">
                      Track spending trends over time
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8 min-h-[500px]">
                <ExpensesBarChart />
              </div>
            </div>
          </div>

          {/* Bottom Row - Receipt Scanner and Transaction History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Receipt Scanner */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm w-full">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-900 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Extract Transactions from Receipt
                    </h2>
                    <p className="text-sm text-gray-400">
                      AI-powered receipt scanning and extraction
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8 min-h-[500px] flex flex-col">
                <ReceiptTransactionsExtractor />
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm w-full">
              <div className="px-6 py-4 border-b border-gray-700">
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
                      Transaction History
                    </h2>
                    <p className="text-sm text-gray-400">
                      View and manage all your transactions
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8 min-h-[500px]">
                <TransactionTable />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
