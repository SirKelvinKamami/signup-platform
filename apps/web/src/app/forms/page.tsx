"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import Link from "next/link";

export default function FormsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [forms, setForms] = useState<any[]>([]);

  useEffect(() => { if (!loading && !user) router.push("/auth/login"); }, [user, loading, router]);
  useEffect(() => { api.forms.list().then(setForms); }, []);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <h1 className="text-xl font-bold">Forms</h1>
        <Link href="/forms/new" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-600">
          New Form
        </Link>
      </header>
      <main className="mx-auto max-w-4xl space-y-4 p-8">
        {forms.length === 0 && <p className="text-gray-500">No forms yet. Create your first one!</p>}
        {forms.map((f: any) => (
          <Link key={f.id} href={`/forms/${f.id}`}
            className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md">
            <div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.published ? "Published" : "Draft"}</p>
            </div>
            <span className="text-sm text-gray-400">{new Date(f.createdAt).toLocaleDateString()}</span>
          </Link>
        ))}
      </main>
    </div>
  );
}
