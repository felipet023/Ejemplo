import { Router } from "express";
import * as svc from "../services/report.service";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);
router.get("/employee/:id", async (req, res, next) => { try { res.json(await svc.employeeReport(req.params.id)); } catch (e) { next(e); } });
router.get("/general", async (req, res, next) => {
  try { res.json(await svc.generalReport({ from: req.query.from, to: req.query.to })); } catch (e) { next(e); }
});
export default router;
