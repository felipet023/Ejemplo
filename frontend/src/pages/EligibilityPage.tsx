import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function EligibilityPage() {
  const [rows, setRows] = useState<any[]>([]);
  const load = () => api.get("/eligibility").then((r) => setRows(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const toggle = async (r: any) => {
    await api.put("/eligibility", { position: r.position, clientType: r.clientType, allowed: !r.allowed });
    load();
  };

  const positions = ["AUXILIAR", "ASISTENTE", "GERENTE"];
  const clients = ["NORMAL", "INDECISO", "DIFICIL", "CRITICO"];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#14243A]">Matriz de elegibilidad</h1>
      <div className="bg-white rounded-xl p-4 shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Cargo</th>
              {clients.map((c) => <th key={c} className="text-left p-2">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p} className="border-b">
                <td className="p-2 font-medium">{p}</td>
                {clients.map((c) => {
                  const r = rows.find((x) => x.position === p && x.clientType === c);
                  return (
                    <td key={c} className="p-2">
                      <button onClick={() => r && toggle(r)} className={`px-3 py-1 rounded text-xs ${r?.allowed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {r?.allowed ? "Permitido" : "Restringido"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
