"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import Link from "next/link";

export default function LinksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => { if (!loading && !user) router.push("/auth/login"); }, [user, loading, router]);
  useEffect(() => { api.links.list().then(setLinks); }, []);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <h1 className="text-xl font-bold">Link Tracking</h1>
        <Link href="/links/new" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-600">
          New Link
        </Link>
      </header>
      <main className="mx-auto max-w-4xl space-y-4 p-8">
        {links.length === 0 && <p className="text-gray-500">No links yet. Create your first one!</p>}
        {links.map((l: any) => (
          <div key={l.id} className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
            <div>
              <h3 className="font-semibold">{l.title}</h3>
              <p className="text-xs text-gray-400">/{l.shortCode} &rarr; {l.targetUrl}</p>
            </div>
            <Link href={`/links/${l.id}/analytics`}
              className="text-sm text-indigo-500 hover:underline">Analytics</Link>
          </div>
        ))}
      </main>
    </div>
  );
}
