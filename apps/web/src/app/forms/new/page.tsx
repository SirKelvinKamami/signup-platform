"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import FormBuilder from "@/components/FormBuilder";

export default function NewFormPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => { if (!loading && !user) router.push("/auth/login"); }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <FormBuilder
      onSave={async (data) => {
        const res: any = await api.forms.create(data);
        router.push(`/forms/${res.id}`);
      }}
    />
  );
}
