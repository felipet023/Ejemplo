import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const [emp, setEmp] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  useEffect(() => {
    if (!id) return;
    api.get(`/employees/${id}`).then((r) => setEmp(r.data)).catch(() => {});
    api.get(`/employees/${id}/history`).then((r) => setHistory(r.data)).catch(() => {});
  }, [id]);

  if (!emp) return <div>Cargando...</div>;
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h1 className="text-xl font-bold text-[#14243A]">{emp.fullName}</h1>
        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
          <div><span className="text-gray-500">Identificador:</span> {emp.identifier}</div>
          <div><span className="text-gray-500">Cargo:</span> {emp.position}</div>
          <div><span className="text-gray-500">Departamento:</span> {emp.department?.name || "-"}</div>
          <div><span className="text-gray-500">Estado:</span> {emp.status}</div>
        </div>
        <Link to={`/evaluation/new?employeeId=${emp.id}`} className="inline-block mt-4 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm">Nueva evaluación</Link>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-semibold mb-2">Historial de evaluaciones</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b"><th className="text-left p-2">Fecha</th><th className="text-left p-2">Cliente</th><th className="text-left p-2">Puntaje</th><th className="text-left p-2">Resultado</th></tr></thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} className="border-t">
                <td className="p-2">{new Date(h.createdAt).toLocaleDateString()}</td>
                <td className="p-2">{h.clientType?.name}</td>
                <td className="p-2">{h.totalScore ?? "-"}</td>
                <td className="p-2">{h.resultLabel || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
