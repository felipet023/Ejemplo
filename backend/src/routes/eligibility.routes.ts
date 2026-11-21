import { Router } from "express";
import { z } from "zod";
import * as svc from "../services/eligibility.service";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();
router.use(authenticate);
router.get("/", async (_req, res, next) => { try { res.json(await svc.getMatrix()); } catch (e) { next(e); } });
router.put("/", requireRoles("ADMINISTRADOR"), async (req, res, next) => {
  try {
    const data = z.object({ position: z.string(), clientType: z.string(), allowed: z.boolean() }).parse(req.body);
    res.json(await svc.setAllowed(data.position, data.clientType, data.allowed));
  } catch (e) { next(e); }
});
export default router;
