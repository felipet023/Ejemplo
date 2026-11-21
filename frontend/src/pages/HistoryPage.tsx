import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function HistoryPage() {
  const [evals, setEvals] = useState<any[]>([]);
  const [filters, setFilters] = useState({ employeeId: "", position: "", clientType: "", result: "", from: "", to: "" });
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => { api.get("/employees").then((r) => setEmployees(r.data)).catch(() => {}); load(); }, []);

  const load = async () => {
    const params: any = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    const r = await api.get("/evaluations", { params });
    setEvals(r.data);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#14243A]">Historial</h1>
      <div className="bg-white rounded-xl p-4 shadow-sm border grid grid-cols-2 md:grid-cols-6 gap-2">
        <select value={filters.employeeId} onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })} className="border rounded px-2 py-1 text-sm">
          <option value="">Empleado</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
        </select>
        <select value={filters.position} onChange={(e) => setFilters({ ...filters, position: e.target.value })} className="border rounded px-2 py-1 text-sm">
          <option value="">Cargo</option>
          <option value="AUXILIAR">Auxiliar</option>
          <option value="ASISTENTE">Asistente</option>
          <option value="GERENTE">Gerente</option>
        </select>
        <select value={filters.clientType} onChange={(e) => setFilters({ ...filters, clientType: e.target.value })} className="border rounded px-2 py-1 text-sm">
          <option value="">Cliente</option>
          <option value="NORMAL">Normal</option>
          <option value="INDECISO">Indeciso</option>
          <option value="DIFICIL">Difícil</option>
          <option value="CRITICO">Crítico</option>
        </select>
        <select value={filters.result} onChange={(e) => setFilters({ ...filters, result: e.target.value })} className="border rounded px-2 py-1 text-sm">
          <option value="">Resultado</option>
          <option value="APTO">APTO</option>
          <option value="NO_APTO">NO APTO</option>
          <option value="REQUIERE_CAPACITACION">REQUIERE CAPACITACIÓN</option>
        </select>
        <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="border rounded px-2 py-1 text-sm" />
        <button onClick={load} className="bg-[#2563EB] text-white rounded px-3 py-1 text-sm">Filtrar</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Fecha</th>
              <th className="text-left p-3">Empleado</th>
              <th className="text-left p-3">Cargo</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-left p-3">Puntaje</th>
              <th className="text-left p-3">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {evals.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-3">{new Date(e.createdAt).toLocaleDateString()}</td>
                <td className="p-3">{e.employee?.fullName}</td>
                <td className="p-3">{e.position}</td>
                <td className="p-3">{e.clientType?.name}</td>
                <td className="p-3">{e.totalScore ?? "-"}</td>
                <td className="p-3">{e.resultLabel || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
