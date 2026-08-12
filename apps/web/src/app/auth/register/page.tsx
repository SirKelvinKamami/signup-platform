"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", name: "", password: "", organizationName: "" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold">Create Account</h1>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {(["name", "email", "password", "organizationName"] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium capitalize">{field === "organizationName" ? "Organization" : field}</label>
            <input type={field === "password" ? "password" : "text"} value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" required />
          </div>
        ))}
        <button type="submit" className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600">
          Create Account
        </button>
        <p className="text-center text-sm text-gray-500">
          Already have an account? <a href="/auth/login" className="text-indigo-500">Sign In</a>
        </p>
      </form>
    </div>
  );
}
