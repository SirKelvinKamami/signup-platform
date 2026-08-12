"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function SubscriptionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [current, setCurrent] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => { if (!loading && !user) router.push("/auth/login"); }, [user, loading, router]);

  useEffect(() => {
    api.subscriptions.current().then(setCurrent);
    api.subscriptions.plans().then(setPlans);
  }, []);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-8 py-4">
        <h1 className="text-xl font-bold">Subscriptions</h1>
      </header>
      <main className="mx-auto max-w-4xl space-y-6 p-8">
        {current && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Current Plan: {current.plan?.name || "Free"}</h2>
            <p className="text-sm text-gray-500">Status: {current.status}</p>
            {current.plan?.features && (
              <pre className="mt-2 text-xs text-gray-400">{JSON.stringify(JSON.parse(current.plan.features), null, 2)}</pre>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {plans.map((p: any) => (
            <div key={p.id} className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-1 text-2xl font-bold">${(p.price / 100).toFixed(2)}<span className="text-sm font-normal text-gray-500">/{p.interval}</span></p>
              {p.features && (
                <ul className="mt-4 space-y-1 text-sm text-gray-600">
                  {Object.entries(JSON.parse(p.features)).map(([k, v]: any) => (
                    <li key={k}>{k.replace(/([A-Z])/g, " $1")}: {v}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
