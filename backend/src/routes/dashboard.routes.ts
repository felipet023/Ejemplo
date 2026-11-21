import { Router } from "express";
import * as svc from "../services/dashboard.service";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);
router.get("/", async (_req, res, next) => { try { res.json(await svc.getDashboard()); } catch (e) { next(e); } });
export default router;
