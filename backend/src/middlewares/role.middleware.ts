import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { AppError } from "../utils/AppError";

export function requireRoles(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError("No autorizado", 401));
    if (!roles.includes(req.user.role)) return next(new AppError("Acceso denegado", 403));
    next();
  };
}
