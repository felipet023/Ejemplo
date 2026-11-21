import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function ClientTypesPage() {
  const [cts, setCTs] = useState<any[]>([]);
  const [comps, setComps] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>("");
  const load = async () => {
    const r = await api.get("/client-types");
    setCTs(r.data);
    if (!selected && r.data.length) setSelected(r.data[0].id);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (selected) api.get(`/competences?clientTypeId=${selected}`).then((r) => setComps(r.data)).catch(() => {});
  }, [selected]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#14243A]">Tipos de clientes</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {cts.map((c) => (
          <button key={c.id} onClick={() => setSelected(c.id)} className={`text-left p-4 rounded-xl border ${selected === c.id ? "border-[#2563EB] bg-[#EAF2FF]" : "border-gray-200 bg-white"}`}>
            <div className="font-semibold">{c.name}</div>
            <div className="text-xs text-gray-500">Dificultad: {c.difficulty}</div>
          </button>
        ))}
      </div>
      {selected && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-semibold mb-2">Competencias</h2>
          <ul className="list-disc pl-5 text-sm">
            {comps.map((c) => <li key={c.id}>{c.name} {c.description ? `— ${c.description}` : ""}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
