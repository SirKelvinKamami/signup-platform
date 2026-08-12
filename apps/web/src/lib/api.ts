const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message || res.statusText);
  }

  return res.json();
}

export const api = {
  auth: {
    register: (body: any) => request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
    login: (body: any) => request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  },
  users: {
    me: () => request("/api/users/me"),
  },
  forms: {
    list: () => request("/api/forms"),
    get: (id: string) => request(`/api/forms/${id}`),
    create: (body: any) => request("/api/forms", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) => request(`/api/forms/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request(`/api/forms/${id}`, { method: "DELETE" }),
    submit: (id: string, data: any) => request(`/api/forms/${id}/submit`, { method: "POST", body: JSON.stringify(data) }),
    submissions: (id: string) => request(`/api/forms/${id}/submissions`),
  },
  links: {
    list: () => request("/api/links"),
    create: (body: any) => request("/api/links", { method: "POST", body: JSON.stringify(body) }),
    analytics: (id: string) => request(`/api/links/${id}/analytics`),
  },
  subscriptions: {
    plans: () => request("/api/subscriptions/plans"),
    current: () => request("/api/subscriptions/current"),
  },
};
