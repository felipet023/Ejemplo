import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string; fullName: string };
}

export async function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new AppError("No autorizado", 401);
    const token = header.slice(7);
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { role: true } });
    if (!user) throw new AppError("Usuario no encontrado", 401);
    req.user = { id: user.id, role: user.role.name, email: user.email, fullName: user.fullName };
    next();
  } catch (e) {
    next(e instanceof AppError ? e : new AppError("Token inválido", 401));
  }
}
