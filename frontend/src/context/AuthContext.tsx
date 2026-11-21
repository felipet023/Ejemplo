import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

interface User { id: string; email: string; fullName: string; role: string; }
interface Ctx { user: User | null; token: string | null; login: (email: string, password: string) => Promise<void>; logout: () => void; loading: boolean; }
const AuthContext = createContext<Ctx>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get("/auth/me").then((r) => setUser(r.data)).catch(() => { localStorage.removeItem("token"); setToken(null); }).finally(() => setLoading(false));
    } else setLoading(false);
  }, [token]);

  const login = async (email: string, password: string) => {
    const r = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", r.data.token);
    setToken(r.data.token);
    setUser(r.data.user);
  };
  const logout = () => { localStorage.removeItem("token"); setToken(null); setUser(null); };

  return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
