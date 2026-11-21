import { prisma } from "../config/db";

export async function getDashboard() {
  const [employees, evaluations, results] = await Promise.all([
    prisma.employee.count(),
    prisma.evaluation.count({ where: { status: "COMPLETED" } }),
    prisma.result.findMany({ include: { evaluation: { include: { employee: true, clientType: true } } } }),
  ]);
  const aptos = results.filter((r) => r.label === "APTO" || r.label === "EXCELENTE").length;
  const noAptos = results.filter((r) => r.label === "NO_APTO").length;
  const requiere = results.filter((r) => r.label === "REQUIERE_CAPACITACION").length;
  const avg = results.length ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length) : 0;

  // evaluations by position
  const byPosition = await prisma.evaluation.groupBy({ by: ["position"], _count: { _all: true }, where: { status: "COMPLETED" } });

  // results by client type
  const byClient = await prisma.evaluation.groupBy({ by: ["clientTypeId"], _count: { _all: true }, where: { status: "COMPLETED" } });
  const clientTypes = await prisma.clientType.findMany();
  const byClientNamed = byClient.map((b) => ({ clientType: clientTypes.find((c) => c.id === b.clientTypeId)?.name, count: b._count._all }));

  // performance by department
  const evals = await prisma.evaluation.findMany({ where: { status: "COMPLETED" }, include: { employee: { include: { department: true } }, result: true } });
  const deptMap: Record<string, { total: number; count: number }> = {};
  for (const e of evals) {
    const d = e.employee.department?.name || "Sin departamento";
    if (!deptMap[d]) deptMap[d] = { total: 0, count: 0 };
    deptMap[d].total += e.result?.score || 0;
    deptMap[d].count += 1;
  }
  const byDepartment = Object.entries(deptMap).map(([name, v]) => ({ department: name, average: v.count ? Math.round(v.total / v.count) : 0, count: v.count }));

  // score evolution (last 10)
  const recent = await prisma.evaluation.findMany({ where: { status: "COMPLETED" }, orderBy: { completedAt: "asc" }, take: 50, include: { result: true } });
  const evolution = recent.map((e) => ({ date: e.completedAt, score: e.result?.score || 0 }));

  // competence frequency
  const compCounts: Record<string, number> = {};
  for (const r of results) {
    const cs = r.competenceScores as any;
    if (cs && typeof cs === "object") for (const k of Object.keys(cs)) compCounts[k] = (compCounts[k] || 0) + 1;
  }

  // eligibility matrix of employees (aptitude per client type)
  const employeesList = await prisma.employee.findMany({ where: { status: "ACTIVE" }, include: { evaluations: { where: { status: "COMPLETED" }, include: { clientType: true, result: true } } } });
  const matrix = employeesList.map((emp) => {
    const row: any = { employeeId: emp.id, identifier: emp.identifier, fullName: emp.fullName, position: emp.position };
    for (const ct of clientTypes) {
      const evs = emp.evaluations.filter((e) => e.clientTypeId === ct.id).sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));
      const latest = evs[0];
      row[ct.name] = latest?.resultLabel || "SIN_EVALUAR";
    }
    return row;
  });

  return {
    indicators: { employees, evaluations, aptos, noAptos, requiere, average: avg },
    byPosition: byPosition.map((b) => ({ position: b.position, count: b._count._all })),
    byClient: byClientNamed,
    byDepartment,
    evolution,
    competences: Object.entries(compCounts).map(([name, count]) => ({ name, count })),
    matrix,
    clientTypes: clientTypes.map((c) => c.name),
  };
}
