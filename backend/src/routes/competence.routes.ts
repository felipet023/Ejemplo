import { Router } from "express";
import { z } from "zod";
import * as svc from "../services/competence.service";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();
router.use(authenticate);
router.get("/", async (req, res, next) => { try { res.json(await svc.listCompetences(req.query.clientTypeId as string)); } catch (e) { next(e); } });
router.post("/", requireRoles("ADMINISTRADOR"), async (req, res, next) => {
  try {
    const data = z.object({ name: z.string(), description: z.string().optional(), clientTypeId: z.string().optional() }).parse(req.body);
    res.status(201).json(await svc.createCompetence(data));
  } catch (e) { next(e); }
});
router.delete("/:id", requireRoles("ADMINISTRADOR"), async (req, res, next) => {
  try { res.json(await svc.deleteCompetence(req.params.id)); } catch (e) { next(e); }
});
export default router;
