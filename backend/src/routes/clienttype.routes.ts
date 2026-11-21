import { Router } from "express";
import { z } from "zod";
import * as svc from "../services/clienttype.service";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();
router.use(authenticate);

router.get("/", async (_req, res, next) => { try { res.json(await svc.listClientTypes()); } catch (e) { next(e); } });
router.get("/:id", async (req, res, next) => { try { res.json(await svc.getClientType(req.params.id)); } catch (e) { next(e); } });
router.post("/", requireRoles("ADMINISTRADOR"), async (req, res, next) => {
  try {
    const data = z.object({ name: z.enum(["NORMAL","INDECISO","DIFICIL","CRITICO"]), difficulty: z.enum(["BAJA","MEDIA","ALTA","EXTREMA"]), description: z.string().optional() }).parse(req.body);
    res.status(201).json(await svc.createClientType(data));
  } catch (e) { next(e); }
});
router.put("/:id", requireRoles("ADMINISTRADOR"), async (req, res, next) => {
  try {
    const data = z.object({ difficulty: z.enum(["BAJA","MEDIA","ALTA","EXTREMA"]).optional(), description: z.string().optional() }).parse(req.body);
    res.json(await svc.updateClientType(req.params.id, data));
  } catch (e) { next(e); }
});

export default router;
