import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AiConfigPage() {
  const [cfg, setCfg] = useState<any>({ provider: "none", model: "", timeoutMs: 30000, maxRetries: 2, isActive: false });
  const [status, setStatus] = useState<any>(null);
  useEffect(() => {
    api.get("/ai/config").then((r) => setCfg({ ...cfg, ...r.data })).catch(() => {});
    api.get("/ai/status").then((r) => setStatus(r.data)).catch(() => {});
  }, []);

  const save = async () => {
    await api.put("/ai/config", cfg);
    const s = await api.get("/ai/status");
    setStatus(s.data);
    alert("Guardado");
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl p-6 shadow-sm border space-y-4">
      <h1 className="text-xl font-bold text-[#14243A]">Configuración de IA</h1>
      <div className="text-sm">Estado: {status?.available ? "Disponible" : "No disponible (usará preguntas de respaldo)"}</div>
      <div>
        <label className="text-sm font-medium">Proveedor</label>
        <select value={cfg.provider} onChange={(e) => setCfg({ ...cfg, provider: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg">
          <option value="none">Ninguno (respaldo)</option>
          <option value="openai">OpenAI</option>
          <option value="gemini">Gemini</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Modelo</label>
        <input value={cfg.model || ""} onChange={(e) => setCfg({ ...cfg, model: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" placeholder="gpt-4o-mini / gemini-1.5-flash" />
      </div>
      <div>
        <label className="text-sm font-medium">Timeout (ms)</label>
        <input type="number" value={cfg.timeoutMs} onChange={(e) => setCfg({ ...cfg, timeoutMs: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
      </div>
      <div>
        <label className="text-sm font-medium">Reintentos</label>
        <input type="number" value={cfg.maxRetries} onChange={(e) => setCfg({ ...cfg, maxRetries: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={cfg.isActive} onChange={(e) => setCfg({ ...cfg, isActive: e.target.checked })} />
        <label className="text-sm">Activo</label>
      </div>
      <button onClick={save} className="bg-[#2563EB] text-white px-4 py-2 rounded-lg">Guardar</button>
      <p className="text-xs text-gray-400">Configura la API Key en backend/.env (OPENAI_API_KEY o GEMINI_API_KEY).</p>
    </div>
  );
}
