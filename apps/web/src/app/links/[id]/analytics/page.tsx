"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function LinkAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => { if (!loading && !user) router.push("/auth/login"); }, [user, loading, router]);
  useEffect(() => { api.links.analytics(params.id as string).then(setAnalytics); }, [params.id]);

  if (loading || !user || !analytics) return null;

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-8 py-4">
        <h1 className="text-xl font-bold">Link Analytics</h1>
      </header>
      <main className="mx-auto max-w-5xl space-y-6 p-8">
        <div className="text-3xl font-bold">{analytics.totalClicks} total clicks</div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Clicks by Date">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.clicksByDate}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="By Device">
            {analytics.clicksByDevice.map((d: any) => (
              <div key={d.device} className="flex justify-between text-sm">
                <span>{d.device}</span><span className="font-semibold">{d.count}</span>
              </div>
            ))}
          </Card>
          <Card title="By Browser">
            {analytics.clicksBySource.map((s: any) => (
              <div key={s.source} className="flex justify-between text-sm">
                <span>{s.source}</span><span className="font-semibold">{s.count}</span>
              </div>
            ))}
          </Card>
          <Card title="By OS">
            {analytics.clicksByMedium.map((m: any) => (
              <div key={m.medium} className="flex justify-between text-sm">
                <span>{m.medium}</span><span className="font-semibold">{m.count}</span>
              </div>
            ))}
          </Card>
          <Card title="By Country">
            {analytics.clicksByCountry.map((c: any) => (
              <div key={c.country} className="flex justify-between text-sm">
                <span>{c.country}</span><span className="font-semibold">{c.count}</span>
              </div>
            ))}
          </Card>
        </div>
      </main>
    </div>
  );
}
