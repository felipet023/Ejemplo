import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

export default function EmployeeFormPage() {
  const [form, setForm] = useState({ fullName: "", identifier: "", position: "AUXILIAR", departmentName: "" });
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/employees", form);
      nav("/employees");
    } catch (err: any) { setError(err?.response?.data?.message || "Error"); }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl p-6 shadow-sm border">
      <h1 className="text-xl font-bold text-[#14243A] mb-4">Registrar empleado</h1>
      <form onSubmit={submit} className="space-y-4">
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
        <div>
          <label className="text-sm font-medium">Departamento</label>
          <input value={form.departmentName} onChange={(e) => setForm({ ...form, departmentName: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="bg-[#2563EB] text-white px-4 py-2 rounded-lg">Guardar</button>
      </form>
    </div>
  );
}
