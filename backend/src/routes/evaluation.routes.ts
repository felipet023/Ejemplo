import { Router } from "express";
import { z } from "zod";
import * as svc from "../services/evaluation.service";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();
router.use(authenticate);

router.post("/identify", async (req, res, next) => {
  try {
    const data = z.object({ fullName: z.string(), identifier: z.string(), position: z.string() }).parse(req.body);
    res.json(await svc.identifyEmployee(data));
  } catch (e) { next(e); }
});

router.post("/start", async (req, res, next) => {
  try {
    const data = z.object({ employeeId: z.string(), clientTypeId: z.string() }).parse(req.body);
    res.json(await svc.startEvaluation(data));
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try { res.json(await svc.getEvaluation(req.params.id)); } catch (e) { next(e); }
});

router.post("/:id/answers", async (req, res, next) => {
  try { res.json(await svc.submitAnswers(req.params.id, req.body)); } catch (e) { next(e); }
});

router.post("/:id/finalize", async (req, res, next) => {
  try {
    const timeUsedSeconds = req.body?.timeUsedSeconds;
    res.json(await svc.finalizeEvaluation(req.params.id, timeUsedSeconds));
  } catch (e) { next(e); }
});

router.get("/", async (req, res, next) => {
  try {
    const data = await svc.listEvaluations({
      employeeId: req.query.employeeId as string,
      position: req.query.position as string,
      clientType: req.query.clientType as string,
      from: req.query.from as string,
      to: req.query.to as string,
      result: req.query.result as string,
    });
    res.json(data);
  } catch (e) { next(e); }
});

export default router;
