"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import Link from "next/link";

export default function SubmissionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => { if (!loading && !user) router.push("/auth/login"); }, [user, loading, router]);
  useEffect(() => {     api.forms.submissions(params.id as string).then(setSubmissions); }, [params.id]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <h1 className="text-xl font-bold">Submissions</h1>
        <Link href={`/forms/${params.id}`} className="rounded-lg border px-4 py-2 text-sm">Back to Form</Link>
      </header>
      <main className="mx-auto max-w-4xl space-y-4 p-8">
        {submissions.length === 0 && <p className="text-gray-500">No submissions yet.</p>}
        {submissions.map((s: any) => {
          const data = JSON.parse(s.data || "{}");
          return (
            <div key={s.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(data, null, 2)}</pre>
              <p className="mt-2 text-xs text-gray-400">{new Date(s.createdAt).toLocaleString()}</p>
            </div>
          );
        })}
      </main>
    </div>
  );
}
