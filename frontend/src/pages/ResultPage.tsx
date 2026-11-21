import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";

export default function ResultPage() {
  const { id } = useParams();
  const [ev, setEv] = useState<any>(null);
  useEffect(() => { if (id) api.get(`/evaluations/${id}`).then((r) => setEv(r.data)).catch(() => {}); }, [id]);
  if (!ev) return <div>Cargando...</div>;
  const res = ev.result;
  const labelColor = res?.label === "APTO" || res?.label === "EXCELENTE" ? "text-green-600" : res?.label === "NO_APTO" ? "text-red-600" : "text-yellow-600";

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
        <h1 className="text-2xl font-bold text-[#14243A]">Resultado de evaluación</h1>
        <div className="text-5xl font-bold mt-4">{res?.score ?? ev.totalScore ?? 0}</div>
        <div className={`text-xl font-semibold mt-2 ${labelColor}`}>{res?.label || ev.resultLabel}</div>
        <div className="text-sm text-gray-500 mt-2">{ev.employee?.fullName} — {ev.clientType?.name}</div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-semibold mb-2">Competencias</h2>
        <div className="space-y-1">
          {Object.entries(res?.competenceScores || {}).map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm border-b py-1">
              <span>{k}</span>
              <span className="font-medium">{String(v)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-semibold mb-2">Recomendaciones</h2>
        <p className="text-sm">{ev.recommendations || "Sin recomendaciones."}</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-semibold mb-2">Respuestas</h2>
        <div className="space-y-3">
          {(ev.answers || []).map((a: any) => (
            <div key={a.id} className="border-b pb-2">
              <div className="text-sm font-medium">{a.question?.statement}</div>
              <div className="text-xs text-gray-500">Respuesta: {JSON.stringify(a.answer)}</div>
              <div className="text-xs">Puntaje: {a.score} {a.feedback ? `— ${a.feedback}` : ""}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Link to="/employees" className="px-4 py-2 border rounded-lg text-sm">Volver</Link>
        <Link to={`/reports?employeeId=${ev.employeeId}`} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm">Reporte</Link>
      </div>
    </div>
  );
}
