import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function QuestionsAdminPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [filters, setFilters] = useState({ position: "", clientTypeId: "", isBackup: "" });
  const [clientTypes, setClientTypes] = useState<any[]>([]);

  useEffect(() => { api.get("/client-types").then((r) => setClientTypes(r.data)).catch(() => {}); load(); }, []);

  const load = async () => {
    const params: any = {};
    if (filters.position) params.position = filters.position;
    if (filters.clientTypeId) params.clientTypeId = filters.clientTypeId;
    if (filters.isBackup) params.isBackup = filters.isBackup;
    const r = await api.get("/questions", { params });
    setQuestions(r.data);
  };

  const toggle = async (q: any, field: "isActive" | "approved") => {
    await api.patch(`/questions/${q.id}`, { [field]: !q[field] });
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#14243A]">Banco de preguntas</h1>
      <div className="bg-white rounded-xl p-4 shadow-sm border flex gap-2">
        <select value={filters.position} onChange={(e) => setFilters({ ...filters, position: e.target.value })} className="border rounded px-2 py-1 text-sm">
          <option value="">Cargo</option>
          <option value="AUXILIAR">Auxiliar</option>
          <option value="ASISTENTE">Asistente</option>
          <option value="GERENTE">Gerente</option>
        </select>
        <select value={filters.clientTypeId} onChange={(e) => setFilters({ ...filters, clientTypeId: e.target.value })} className="border rounded px-2 py-1 text-sm">
          <option value="">Cliente</option>
          {clientTypes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.isBackup} onChange={(e) => setFilters({ ...filters, isBackup: e.target.value })} className="border rounded px-2 py-1 text-sm">
          <option value="">Todas</option>
          <option value="true">Respaldo</option>
          <option value="false">Generadas</option>
        </select>
        <button onClick={load} className="bg-[#2563EB] text-white px-3 py-1 rounded text-sm">Filtrar</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Enunciado</th>
              <th className="text-left p-3">Competencia</th>
              <th className="text-left p-3">Respaldo</th>
              <th className="text-left p-3">Activa</th>
              <th className="text-left p-3">Aprobada</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} className="border-t">
                <td className="p-3 text-xs">{q.questionId}</td>
                <td className="p-3 text-xs">{q.type}</td>
                <td className="p-3 text-xs max-w-xs truncate">{q.statement}</td>
                <td className="p-3 text-xs">{q.competence}</td>
                <td className="p-3 text-xs">{q.isBackup ? "Sí" : "No"}</td>
                <td className="p-3"><button onClick={() => toggle(q, "isActive")} className={`text-xs px-2 py-0.5 rounded ${q.isActive ? "bg-green-100 text-green-700" : "bg-gray-100"}`}>{q.isActive ? "Activa" : "Inactiva"}</button></td>
                <td className="p-3"><button onClick={() => toggle(q, "approved")} className={`text-xs px-2 py-0.5 rounded ${q.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{q.approved ? "Aprobada" : "Pendiente"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
