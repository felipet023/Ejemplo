import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";

export async function listQuestions(filters: { position?: string; clientTypeId?: string; competence?: string; isBackup?: boolean; approved?: boolean }) {
  return prisma.question.findMany({
    where: {
      ...(filters.position ? { position: filters.position as any } : {}),
      ...(filters.clientTypeId ? { clientTypeId: filters.clientTypeId } : {}),
      ...(filters.competence ? { competence: filters.competence } : {}),
      ...(filters.isBackup !== undefined ? { isBackup: filters.isBackup } : {}),
      ...(filters.approved !== undefined ? { approved: filters.approved } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getQuestion(id: string) {
  const q = await prisma.question.findUnique({ where: { id } });
  if (!q) throw new AppError("No encontrado", 404);
  return q;
}

export async function updateQuestion(id: string, data: { isActive?: boolean; approved?: boolean; isBackup?: boolean }) {
  return prisma.question.update({ where: { id }, data });
}

export async function deleteQuestion(id: string) {
  return prisma.question.update({ where: { id }, data: { isActive: false } });
}
