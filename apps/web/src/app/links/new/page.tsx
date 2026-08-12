"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function NewLinkPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", targetUrl: "", utmSource: "", utmMedium: "", utmCampaign: "", utmTerm: "", utmContent: "" });

  useEffect(() => { if (!loading && !user) router.push("/auth/login"); }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.links.create(form);
    router.push("/links");
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-8 py-4">
        <h1 className="text-xl font-bold">Create Link</h1>
      </header>
      <main className="mx-auto max-w-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-8 shadow-lg">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Target URL</label>
            <input type="url" value={form.targetUrl} onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(["utmSource", "utmMedium", "utmCampaign", "utmTerm", "utmContent"] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium capitalize">{field.replace("utm", "UTM ")}</label>
                <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
          <button type="submit" className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600">
            Create Link
          </button>
        </form>
      </main>
    </div>
  );
}
