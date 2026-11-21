import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";

export async function employeeReport(employeeId: string) {
  const emp = await prisma.employee.findUnique({ where: { id: employeeId }, include: { department: true } });
  if (!emp) throw new AppError("Empleado no encontrado", 404);
  const evals = await prisma.evaluation.findMany({
    where: { employeeId },
    include: { clientType: true, result: true, answers: { include: { question: true } } },
    orderBy: { createdAt: "desc" },
  });
  const aptoClients = evals.filter((e) => e.resultLabel === "APTO" || e.resultLabel === "EXCELENTE").map((e) => e.clientType.name);
  const noAptoClients = evals.filter((e) => e.resultLabel === "NO_APTO" || e.resultLabel === "REQUIERE_CAPACITACION").map((e) => e.clientType.name);
  const compSet: Record<string, number> = {};
  for (const e of evals) {
    const cs = e.result?.competenceScores as any;
    if (cs) for (const [k, v] of Object.entries(cs)) compSet[k] = (compSet[k] || 0) + (v as number);
  }
  return { employee: emp, evaluations: evals, aptoClients: [...new Set(aptoClients)], noAptoClients: [...new Set(noAptoClients)], competenceTotals: compSet };
}

export async function generalReport(filters: any) {
  return prisma.evaluation.findMany({
    where: {
      ...(filters.from ? { createdAt: { gte: new Date(filters.from) } } : {}),
      ...(filters.to ? { createdAt: { lte: new Date(filters.to) } } : {}),
    },
    include: { employee: { include: { department: true } }, clientType: true, result: true },
    orderBy: { createdAt: "desc" },
  });
}
