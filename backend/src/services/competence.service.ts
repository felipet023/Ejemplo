import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";

export async function listCompetences(clientTypeId?: string) {
  return prisma.competence.findMany({ where: clientTypeId ? { clientTypeId } : {}, orderBy: { name: "asc" } });
}
export async function createCompetence(data: { name: string; description?: string; clientTypeId?: string }) {
  return prisma.competence.create({ data });
}
export async function deleteCompetence(id: string) {
  const c = await prisma.competence.findUnique({ where: { id } });
  if (!c) throw new AppError("No encontrado", 404);
  return prisma.competence.delete({ where: { id } });
}
