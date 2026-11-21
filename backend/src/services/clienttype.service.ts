import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";

export async function listClientTypes() {
  return prisma.clientType.findMany({ include: { competences: true }, orderBy: { name: "asc" } });
}

export async function getClientType(id: string) {
  const ct = await prisma.clientType.findUnique({ where: { id }, include: { competences: true } });
  if (!ct) throw new AppError("No encontrado", 404);
  return ct;
}

export async function createClientType(data: { name: string; difficulty: string; description?: string }) {
  return prisma.clientType.create({ data: { name: data.name as any, difficulty: data.difficulty as any, description: data.description } });
}

export async function updateClientType(id: string, data: { difficulty?: string; description?: string }) {
  return prisma.clientType.update({ where: { id }, data: { ...(data.difficulty ? { difficulty: data.difficulty as any } : {}), ...(data.description !== undefined ? { description: data.description } : {}) } });
}
