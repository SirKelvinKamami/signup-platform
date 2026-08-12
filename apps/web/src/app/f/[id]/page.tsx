"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function PublicFormPage() {
  const params = useParams();
  const [form, setForm] = useState<any>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.forms.get(params.id as string).then((f: any) => {
      setForm(f);
      if (!f.published) setError("This form is not published");
    }).catch(() => setError("Form not found"));
  }, [params.id]);

  if (error) return <div className="flex min-h-screen items-center justify-center text-red-500">{error}</div>;
  if (!form) return null;

  const schema = JSON.parse(form.schema || "{}");
  const fields = schema.fields || [];
  const settings = JSON.parse(form.settings || "{}");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.forms.submit(form.id, { data: values });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{settings.thankYouMessage || "Thank you!"}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold">{form.title}</h1>
        {form.description && <p className="text-sm text-gray-500">{form.description}</p>}
        {fields.map((f: any) => (
          <div key={f.id}>
            <label className="block text-sm font-medium">{f.label}{f.required && <span className="text-red-500">*</span>}</label>
            {["select", "radio"].includes(f.type) ? (
              <select value={values[f.id] || ""} onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" required={f.required}>
                <option value="">Select...</option>
                {f.options?.map((o: string, i: number) => <option key={i} value={o}>{o}</option>)}
              </select>
            ) : ["multiselect", "checkbox"].includes(f.type) ? (
              <div className="mt-1 space-y-1">
                {f.options?.map((o: string, i: number) => (
                  <label key={i} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={values[f.id]?.includes(o)} onChange={() => {
                      const prev = (values[f.id] || "").split(",").filter(Boolean);
                      const next = prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o];
                      setValues({ ...values, [f.id]: next.join(",") });
                    }} />
                    {o}
                  </label>
                ))}
              </div>
            ) : f.type === "textarea" ? (
              <textarea value={values[f.id] || ""} onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" required={f.required} />
            ) : (
              <input type={f.type} value={values[f.id] || ""} onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" required={f.required} />
            )}
          </div>
        ))}
        <button type="submit" className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600">
          {settings.submitLabel || "Submit"}
        </button>
      </form>
    </div>
  );
}
