import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Plus, Search } from "lucide-react";

export default function EmployeesPage() {
  const [emps, setEmps] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
  const nav = useNavigate();

  const load = () => {
    const params: any = {};
    if (search) params.search = search;
    if (position) params.position = position;
    api.get("/employees", { params }).then((r) => setEmps(r.data)).catch(() => {});
  };
  useEffect(load, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#14243A]">Empleados</h1>
        <button onClick={() => nav("/employees/new")} className="bg-[#2563EB] text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={16} /> Nuevo</button>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-2 top-2.5 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-2 border rounded-lg" placeholder="Buscar..." />
        </div>
        <select value={position} onChange={(e) => setPosition(e.target.value)} className="border rounded-lg px-3">
          <option value="">Todos los cargos</option>
          <option value="AUXILIAR">Auxiliar</option>
          <option value="ASISTENTE">Asistente</option>
          <option value="GERENTE">Gerente</option>
        </select>
        <button onClick={load} className="bg-gray-100 px-4 rounded-lg">Filtrar</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Identificador</th>
              <th className="text-left p-3">Cargo</th>
              <th className="text-left p-3">Departamento</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {emps.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-3">{e.fullName}</td>
                <td className="p-3">{e.identifier}</td>
                <td className="p-3">{e.position}</td>
                <td className="p-3">{e.department?.name || "-"}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${e.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{e.status}</span>
                </td>
                <td className="p-3">
                  <Link to={`/employees/${e.id}`} className="text-[#2563EB] text-sm">Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
