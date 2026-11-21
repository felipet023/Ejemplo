import { Router } from "express";
import { z } from "zod";
import { login, registerUser } from "../services/auth.service";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await login(email, password);
    res.json(result);
  } catch (e) { next(e); }
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  roleName: z.enum(["ADMINISTRADOR", "GERENTE", "EVALUADOR"]),
});

router.post("/register", authenticate, requireRoles("ADMINISTRADOR"), async (req: AuthRequest, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await registerUser(data);
    res.status(201).json(user);
  } catch (e) { next(e); }
});

router.get("/me", authenticate, async (req: AuthRequest, res) => {
  res.json(req.user);
});

export default router;
