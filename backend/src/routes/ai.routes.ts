import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";
import * as ai from "../services/ai.service";

const router = Router();
router.use(authenticate);

router.get("/config", async (_req, res, next) => {
  try {
    const cfg = await prisma.aiConfig.findFirst();
    res.json(cfg || { provider: "none", isActive: false });
  } catch (e) { next(e); }
});

router.put("/config", requireRoles("ADMINISTRADOR"), async (req, res, next) => {
  try {
    const data = z.object({ provider: z.enum(["openai","gemini","none"]), model: z.string().optional(), timeoutMs: z.number().optional(), maxRetries: z.number().optional(), isActive: z.boolean() }).parse(req.body);
    const existing = await prisma.aiConfig.findFirst();
    const cfg = existing
      ? await prisma.aiConfig.update({ where: { id: existing.id }, data })
      : await prisma.aiConfig.create({ data });
    res.json(cfg);
  } catch (e) { next(e); }
});

router.get("/status", async (_req, res) => {
  res.json({ available: await ai.isAiAvailable() });
});

export default router;
