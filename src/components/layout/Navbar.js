"use client";

import Link from "next/link";
import { signInWithGoogle, auth } from "@/lib/firebaseClient";
import { useUser } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, loading } = useUser();

  return (
    <header className="border-b">
      <nav className="container mx-auto flex items-center gap-6 p-4">
        {user ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/addTransaction">Add Transaction</Link>
          </>
        ) : (
          <>
            <span className="text-gray-400 cursor-not-allowed select-none">
              {/* Dashboard */}
            </span>
            <span className="text-gray-400 cursor-not-allowed select-none">
              {/* Add Transaction */}
            </span>
          </>
        )}

        <div className="ml-auto">
          {!loading && !user && (
            <Button onClick={signInWithGoogle}>Sign in with Google</Button>
          )}

          {user && (
            <Button variant="outline" onClick={() => auth.signOut()}>
              Sign out&nbsp;(
              {user.displayName?.split(" ")[0] || user.email?.split("@")[0]})
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
