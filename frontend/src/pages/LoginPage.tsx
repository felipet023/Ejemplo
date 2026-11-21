import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@crm.local");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try { await login(email, password); nav("/"); } catch (err: any) { setError(err?.response?.data?.message || "Error de login"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="text-[#2563EB]" size={32} />
          <div>
            <h1 className="text-xl font-bold text-[#14243A]">CRM Assessment</h1>
            <p className="text-sm text-gray-500">Plataforma de evaluación de competencias</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Correo</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg" />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button className="w-full bg-[#2563EB] text-white py-2 rounded-lg font-medium">Ingresar</button>
        </form>
        <p className="text-xs text-gray-400 mt-4">Demo: admin@crm.local / Password123!</p>
      </div>
    </div>
  );
}
