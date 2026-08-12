"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => { if (!loading && !user) router.push("/auth/login"); }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <h1 className="text-xl font-bold">SignUp Platform</h1>
        <div className="flex items-center gap-4 text-sm">
          <span>{user.organization?.name || user.email}</span>
          <button onClick={logout} className="text-gray-500 hover:text-red-500">Logout</button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/forms" className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md">
            <h2 className="text-lg font-semibold">Forms</h2>
            <p className="mt-1 text-sm text-gray-500">Create & manage sign-up forms</p>
          </Link>
          <Link href="/links" className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md">
            <h2 className="text-lg font-semibold">Link Tracking</h2>
            <p className="mt-1 text-sm text-gray-500">Track clicks & campaign performance</p>
          </Link>
          <Link href="/subscriptions" className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md">
            <h2 className="text-lg font-semibold">Subscriptions</h2>
            <p className="mt-1 text-sm text-gray-500">View your plan & usage</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
