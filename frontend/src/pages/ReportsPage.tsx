import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage() {
  const [sp] = useSearchParams();
  const [employees, setEmployees] = useState<any[]>([]);
  const [selected, setSelected] = useState(sp.get("employeeId") || "");
  const [report, setReport] = useState<any>(null);
  const [general, setGeneral] = useState<any[]>([]);

  useEffect(() => { api.get("/employees").then((r) => setEmployees(r.data)).catch(() => {}); api.get("/reports/general").then((r) => setGeneral(r.data)).catch(() => {}); }, []);

  const loadEmp = async (id: string) => {
    if (!id) { setReport(null); return; }
    const r = await api.get(`/reports/employee/${id}`);
    setReport(r.data);
  };
  useEffect(() => { if (selected) loadEmp(selected); }, [selected]);

  const exportCSV = () => {
    const rows = general.map((e) => ({
      fecha: new Date(e.createdAt).toISOString(),
      empleado: e.employee?.fullName,
      cargo: e.position,
      cliente: e.clientType?.name,
      puntaje: e.totalScore,
      resultado: e.resultLabel,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "reporte.csv", { bookType: "csv" });
  };

  const exportExcel = () => {
    const rows = general.map((e) => ({
      fecha: new Date(e.createdAt).toISOString(),
      empleado: e.employee?.fullName,
      cargo: e.position,
      cliente: e.clientType?.name,
      puntaje: e.totalScore,
      resultado: e.resultLabel,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "reporte.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte General CRM Assessment", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["Fecha", "Empleado", "Cargo", "Cliente", "Puntaje", "Resultado"]],
      body: general.map((e) => [new Date(e.createdAt).toLocaleDateString(), e.employee?.fullName, e.position, e.clientType?.name, e.totalScore, e.resultLabel]),
    });
    doc.save("reporte.pdf");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#14243A]">Reportes</h1>
      <div className="bg-white rounded-xl p-4 shadow-sm border flex flex-wrap gap-2">
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="border rounded px-3 py-2 text-sm">
          <option value="">Seleccionar empleado</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
        </select>
        <button onClick={exportCSV} className="bg-gray-100 px-3 py-2 rounded text-sm">Exportar CSV</button>
        <button onClick={exportExcel} className="bg-gray-100 px-3 py-2 rounded text-sm">Exportar Excel</button>
        <button onClick={exportPDF} className="bg-gray-100 px-3 py-2 rounded text-sm">Exportar PDF</button>
      </div>

      {report && (
        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-3">
          <h2 className="font-semibold">{report.employee.fullName} ({report.employee.identifier})</h2>
          <div className="text-sm">Cargo: {report.employee.position}</div>
          <div className="text-sm">Apto para: {report.aptoClients.join(", ") || "Ninguno"}</div>
          <div className="text-sm">No apto: {report.noAptoClients.join(", ") || "Ninguno"}</div>
          <div className="text-sm">Competencias acumuladas: {Object.entries(report.competenceTotals).map(([k, v]) => `${k}: ${v}`).join(" | ")}</div>
          <div className="text-sm">Evaluaciones: {report.evaluations.length}</div>
        </div>
      )}
    </div>
  );
}
