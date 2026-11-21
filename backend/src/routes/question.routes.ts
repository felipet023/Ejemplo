import { Router } from "express";
import { z } from "zod";
import * as svc from "../services/question.service";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();
router.use(authenticate);
router.get("/", async (req, res, next) => {
  try {
    res.json(await svc.listQuestions({
      position: req.query.position as string,
      clientTypeId: req.query.clientTypeId as string,
      competence: req.query.competence as string,
      isBackup: req.query.isBackup !== undefined ? req.query.isBackup === "true" : undefined,
      approved: req.query.approved !== undefined ? req.query.approved === "true" : undefined,
    }));
  } catch (e) { next(e); }
});
router.get("/:id", async (req, res, next) => { try { res.json(await svc.getQuestion(req.params.id)); } catch (e) { next(e); } });
router.patch("/:id", requireRoles("ADMINISTRADOR"), async (req, res, next) => {
  try {
    const data = z.object({ isActive: z.boolean().optional(), approved: z.boolean().optional(), isBackup: z.boolean().optional() }).parse(req.body);
    res.json(await svc.updateQuestion(req.params.id, data));
  } catch (e) { next(e); }
});
router.delete("/:id", requireRoles("ADMINISTRADOR"), async (req, res, next) => {
  try { res.json(await svc.deleteQuestion(req.params.id)); } catch (e) { next(e); }
});
export default router;
