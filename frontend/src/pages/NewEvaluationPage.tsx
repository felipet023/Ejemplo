import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import { CheckCircle2 } from "lucide-react";

export default function NewEvaluationPage() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fullName: "", identifier: "", position: "AUXILIAR" });
  const [employee, setEmployee] = useState<any>(null);
  const [clientTypes, setClientTypes] = useState<any[]>([]);
  const [eligibility, setEligibility] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/client-types").then((r) => setClientTypes(r.data)).catch(() => {});
    api.get("/eligibility").then((r) => setEligibility(r.data)).catch(() => {});
    const eid = sp.get("employeeId");
    if (eid) {
      api.get(`/employees/${eid}`).then((r) => {
        setEmployee(r.data);
        setForm({ fullName: r.data.fullName, identifier: r.data.identifier, position: r.data.position });
      }).catch(() => {});
    }
  }, []);

  const identify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const r = await api.post("/evaluations/identify", form);
      setEmployee(r.data);
      setStep(2);
    } catch (err: any) { setError(err?.response?.data?.message || "Identificación inválida"); }
  };

  const isAllowed = (ctName: string) => {
    const row = eligibility.find((x) => x.position === form.position && x.clientType === ctName);
    return row?.allowed ?? false;
  };

  const selectedCt = clientTypes.find((c) => c.id === selectedClient);

  const start = async () => {
    if (!employee || !selectedClient) return;
    setLoading(true);
    setError("");
    try {
      const r = await api.post("/evaluations/start", { employeeId: employee.id, clientTypeId: selectedClient });
      nav(`/evaluation/${r.data.evaluationId}`);
    } catch (err: any) { setError(err?.response?.data?.message || "No se pudo iniciar"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-[#14243A]">Nueva evaluación</h1>
      <div className="flex gap-2 mb-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`px-3 py-1 rounded-full text-sm ${step >= s ? "bg-[#2563EB] text-white" : "bg-gray-200"}`}>Paso {s}</div>
        ))}
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}

      {step === 1 && (
        <form onSubmit={identify} className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <h2 className="font-semibold">Identificación del empleado</h2>
          <div>
            <label className="text-sm font-medium">Nombre completo</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="text-sm font-medium">Identificador</label>
            <input value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="text-sm font-medium">Cargo</label>
            <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg">
              <option value="AUXILIAR">Auxiliar</option>
              <option value="ASISTENTE">Asistente</option>
              <option value="GERENTE">Gerente</option>
            </select>
          </div>
          <button className="bg-[#2563EB] text-white px-4 py-2 rounded-lg">Validar identidad</button>
        </form>
      )}

      {step === 2 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <h2 className="font-semibold">Seleccionar tipo de cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {clientTypes.map((ct) => {
              const allowed = isAllowed(ct.name);
              return (
                <button
                  key={ct.id}
                  disabled={!allowed}
                  onClick={() => setSelectedClient(ct.id)}
                  className={`text-left p-4 rounded-xl border ${selectedClient === ct.id ? "border-[#2563EB] bg-[#EAF2FF]" : "border-gray-200"} ${!allowed ? "opacity-40 cursor-not-allowed" : "hover:border-[#2563EB]"}`}
                >
                  <div className="font-semibold">{ct.name}</div>
                  <div className="text-xs text-gray-500">Dificultad: {ct.difficulty}</div>
                  <div className="text-xs mt-1">{allowed ? "Permitido para este cargo" : "Restringido"}</div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="px-4 py-2 border rounded-lg">Atrás</button>
            <button onClick={() => setStep(3)} disabled={!selectedClient} className="bg-[#2563EB] text-white px-4 py-2 rounded-lg disabled:opacity-50">Continuar</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <h2 className="font-semibold">Confirmación</h2>
          <div className="space-y-1 text-sm">
            <div><span className="text-gray-500">Nombre:</span> {employee?.fullName}</div>
            <div><span className="text-gray-500">Identificador:</span> {employee?.identifier}</div>
            <div><span className="text-gray-500">Cargo:</span> {employee?.position}</div>
            <div><span className="text-gray-500">Tipo de cliente:</span> {selectedCt?.name}</div>
            <div><span className="text-gray-500">Dificultad:</span> {selectedCt?.difficulty}</div>
            <div><span className="text-gray-500">Cantidad de preguntas:</span> 5</div>
            <div><span className="text-gray-500">Tiempo estimado:</span> 10 minutos</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="px-4 py-2 border rounded-lg">Atrás</button>
            <button onClick={start} disabled={loading} className="bg-[#2563EB] text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <CheckCircle2 size={16} /> {loading ? "Generando..." : "Comenzar evaluación"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
