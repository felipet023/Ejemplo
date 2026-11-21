import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users, ClipboardCheck, CheckCircle, XCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api.get("/dashboard").then((r) => setData(r.data)).catch(() => {}); }, []);

  if (!data) return <div>Cargando dashboard...</div>;
  const ind = data.indicators;
  const cards = [
    { label: "Empleados registrados", value: ind.employees, icon: Users, color: "text-blue-600" },
    { label: "Evaluaciones realizadas", value: ind.evaluations, icon: ClipboardCheck, color: "text-indigo-600" },
    { label: "Empleados aptos", value: ind.aptos, icon: CheckCircle, color: "text-green-600" },
    { label: "No aptos", value: ind.noAptos, icon: XCircle, color: "text-red-600" },
    { label: "Requieren capacitación", value: ind.requiere, icon: AlertTriangle, color: "text-yellow-600" },
    { label: "Promedio general", value: ind.average, icon: TrendingUp, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#14243A]">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm border">
            <c.icon className={c.color} size={20} />
            <div className="text-2xl font-bold mt-2">{c.value}</div>
            <div className="text-xs text-gray-500">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-semibold mb-2">Evaluaciones por cargo</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.byPosition}>
              <XAxis dataKey="position" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-semibold mb-2">Resultados por tipo de cliente</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.byClient} dataKey="count" nameKey="clientType" cx="50%" cy="50%" outerRadius={80} label>
                {data.byClient.map((_: any, i: number) => <Cell key={i} fill={["#2563EB","#16A34A","#EAB308","#DC2626"][i % 4]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-semibold mb-2">Rendimiento por departamento</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.byDepartment}>
              <XAxis dataKey="department" /><YAxis /><Tooltip /><Bar dataKey="average" fill="#16A34A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-semibold mb-2">Evolución de calificaciones</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.evolution}>
              <XAxis dataKey="date" hide /><YAxis /><Tooltip /><Line type="monotone" dataKey="score" stroke="#2563EB" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold mb-2">Matriz de elegibilidad de empleados</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Empleado</th>
                <th className="text-left p-2">Cargo</th>
                {data.clientTypes.map((c: string) => <th key={c} className="text-left p-2">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.matrix.map((m: any) => (
                <tr key={m.employeeId} className="border-b">
                  <td className="p-2">{m.fullName}</td>
                  <td className="p-2">{m.position}</td>
                  {data.clientTypes.map((c: string) => (
                    <td key={c} className="p-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${m[c] === "APTO" || m[c] === "EXCELENTE" ? "bg-green-100 text-green-700" : m[c] === "NO_APTO" ? "bg-red-100 text-red-700" : m[c] === "REQUIERE_CAPACITACION" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>{m[c]}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
