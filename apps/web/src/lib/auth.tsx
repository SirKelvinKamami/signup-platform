"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "./api";

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  organization?: { name: string; slug: string };
};

type AuthContext = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; name: string; password: string; organizationName: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthCtx = createContext<AuthContext>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      api.users.me()
        .then(setUser)
        .catch(() => { localStorage.removeItem("token"); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res: any = await api.auth.login({ email, password });
    localStorage.setItem("token", res.accessToken);
    setToken(res.accessToken);
    const me = await api.users.me();
    setUser(me as any);
  }, []);

  const register = useCallback(async (data: any) => {
    const res: any = await api.auth.register(data);
    localStorage.setItem("token", res.accessToken);
    setToken(res.accessToken);
    const me = await api.users.me();
    setUser(me as any);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
