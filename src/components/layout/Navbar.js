"use client";

import Link from "next/link";
import { signInWithGoogle, auth } from "@/lib/firebaseClient";
import { useUser } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, loading } = useUser();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-black">
                Personal Finance
              </h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {user ? (
                <>

                   <Link
                    href="/"
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100 text-black"
                  >
                    Home
                  </Link>
                  <Link
                    href="/dashboard"
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100 text-black"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/addTransaction"
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 transition-all duration-200"
                  >
                    Add Transaction
                  </Link>
                </>
              ) : (
                <>
                   <Link
                    href="/"
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100 text-black"
                  >
                    Home
                  </Link>
                  <span className="px-3 py-2 text-sm font-medium text-gray-300 cursor-not-allowed select-none">
                    Dashboard
                  </span>
                  <span className="px-3 py-2 text-sm font-medium text-gray-300 cursor-not-allowed select-none">
                    Add Transaction
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* User Status */}
            {user && (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-black">Online</span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="text-sm text-black">
                  Welcome,{" "}
                  {user.displayName?.split(" ")[0] || user.email?.split("@")[0]}
                </div>
              </div>
            )}

            {/* Authentication Buttons */}
            <div className="flex items-center space-x-3">
              {!loading && !user && (
                <button
                  onClick={signInWithGoogle}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </button>
              )}

              {user && (
                <>
                  {/* User Avatar */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {(user.displayName?.[0] || user.email?.[0] || "U").toUpperCase()}
                    </div>

                    {/* Sign Out Button */}
                    <button
                      onClick={() => auth.signOut()}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      title="Sign out"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-3">
          <div className="flex flex-col space-y-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100 text-black"
                >
                  Dashboard
                </Link>
                <Link
                  href="/addTransaction"
                  className="block px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 transition-all duration-200"
                >
                  Add Transaction
                </Link>
              </>
            ) : (
              <>
                <span className="block px-3 py-2 text-sm font-medium text-gray-300 cursor-not-allowed">
                  Dashboard
                </span>
                <span className="block px-3 py-2 text-sm font-medium text-gray-300 cursor-not-allowed">
                  Add Transaction
                </span>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
