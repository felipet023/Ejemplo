import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";

const DEFAULTS: { position: string; clientType: string; allowed: boolean }[] = [
  { position: "AUXILIAR", clientType: "NORMAL", allowed: true },
  { position: "AUXILIAR", clientType: "INDECISO", allowed: true },
  { position: "AUXILIAR", clientType: "DIFICIL", allowed: false },
  { position: "AUXILIAR", clientType: "CRITICO", allowed: false },
  { position: "ASISTENTE", clientType: "NORMAL", allowed: true },
  { position: "ASISTENTE", clientType: "INDECISO", allowed: true },
  { position: "ASISTENTE", clientType: "DIFICIL", allowed: true },
  { position: "ASISTENTE", clientType: "CRITICO", allowed: false },
  { position: "GERENTE", clientType: "NORMAL", allowed: true },
  { position: "GERENTE", clientType: "INDECISO", allowed: true },
  { position: "GERENTE", clientType: "DIFICIL", allowed: true },
  { position: "GERENTE", clientType: "CRITICO", allowed: true },
];

export async function ensureDefaults() {
  for (const d of DEFAULTS) {
    await prisma.eligibilityMatrix.upsert({
      where: { position_clientType: { position: d.position as any, clientType: d.clientType as any } },
      update: {},
      create: { position: d.position as any, clientType: d.clientType as any, allowed: d.allowed },
    });
  }
}

export async function getMatrix() {
  await ensureDefaults();
  return prisma.eligibilityMatrix.findMany({ orderBy: [{ position: "asc" }, { clientType: "asc" }] });
}

export async function setAllowed(position: string, clientType: string, allowed: boolean) {
  return prisma.eligibilityMatrix.upsert({
    where: { position_clientType: { position: position as any, clientType: clientType as any } },
    update: { allowed },
    create: { position: position as any, clientType: clientType as any, allowed },
  });
}

export async function isAllowed(position: string, clientType: string): Promise<boolean> {
  await ensureDefaults();
  const row = await prisma.eligibilityMatrix.findUnique({
    where: { position_clientType: { position: position as any, clientType: clientType as any } },
  });
  return row?.allowed ?? false;
}
