import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import { signToken } from "../utils/jwt";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  if (!user) throw new AppError("Credenciales inválidas", 401);
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new AppError("Credenciales inválidas", 401);
  const token = signToken({ userId: user.id, role: user.role.name });
  return {
    token,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role.name },
  };
}

export async function registerUser(data: { email: string; password: string; fullName: string; roleName: string }) {
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) throw new AppError("El usuario ya existe", 409);
  const role = await prisma.role.findUnique({ where: { name: data.roleName as any } });
  if (!role) throw new AppError("Rol no válido", 400);
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { email: data.email, passwordHash, fullName: data.fullName, roleId: role.id },
    include: { role: true },
  });
  return { id: user.id, email: user.email, fullName: user.fullName, role: user.role.name };
}
