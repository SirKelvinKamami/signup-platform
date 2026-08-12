"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import Link from "next/link";
import FormBuilder from "@/components/FormBuilder";

export default function FormDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    api.forms.get(params.id as string).then(setForm);
  }, [params.id]);

  if (loading || !user || !form) return null;

  if (editing) {
    const schema = JSON.parse(form.schema || "{}");
    const settings = JSON.parse(form.settings || "{}");
    return (
      <FormBuilder
        initial={{
          title: form.title,
          description: form.description || "",
          fields: schema.fields || [],
          settings,
        }}
        onSave={async (data) => {
          await api.forms.update(form.id, data);
          setForm({ ...form, ...data });
          setEditing(false);
        }}
      />
    );
  }

  const schema = JSON.parse(form.schema || "{}");
  const fields = schema.fields || [];

  const togglePublish = async () => {
    await api.forms.update(form.id, { published: !form.published });
    setForm({ ...form, published: !form.published });
  };

  const publicUrl = `${window.location.origin}/f/${form.id}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <div>
          <h1 className="text-xl font-bold">{form.title}</h1>
          <p className="text-xs text-gray-400">{form.published ? "Published" : "Draft"} · {fields.length} fields</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
            Edit
          </button>
          <button onClick={togglePublish} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
            {form.published ? "Unpublish" : "Publish"}
          </button>
          <Link href={`/forms/${form.id}/submissions`}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">Submissions</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 p-8">
        {form.published && (
          <div className="rounded-lg border bg-green-50 p-4 text-sm text-green-700">
            Published at: <a href={publicUrl} target="_blank" className="underline">{publicUrl}</a>
            <button onClick={() => navigator.clipboard.writeText(publicUrl)}
              className="ml-2 rounded bg-green-200 px-2 py-0.5 text-xs hover:bg-green-300">Copy</button>
          </div>
        )}
        <div className="space-y-3">
          {fields.map((f: any) => (
            <div key={f.id} className="rounded-xl border bg-white p-5 shadow-sm">
              <label className="block text-sm font-medium text-gray-700">{f.label}{f.required && <span className="text-red-400">*</span>}</label>
              {["select", "multiselect", "radio"].includes(f.type) ? (
                <div className="mt-1 space-y-1">
                  {(f.options || []).map((o: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <input type={f.type === "multiselect" ? "checkbox" : "radio"} disabled className="accent-indigo-500" />
                      <span className="text-gray-600">{o}</span>
                    </div>
                  ))}
                </div>
              ) : f.type === "textarea" ? (
                <textarea disabled className="mt-1 w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-500" rows={3} placeholder={f.placeholder} />
              ) : (
                <input type={f.type} disabled className="mt-1 w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-500" placeholder={f.placeholder} />
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
