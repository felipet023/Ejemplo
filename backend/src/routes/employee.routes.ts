import { Router } from "express";
import { z } from "zod";
import * as svc from "../services/employee.service";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const data = await svc.listEmployees({
      search: req.query.search as string,
      position: req.query.position as string,
      department: req.query.department as string,
      status: req.query.status as string,
    });
    res.json(data);
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try { res.json(await svc.getEmployee(req.params.id)); } catch (e) { next(e); }
});

router.get("/:id/history", async (req, res, next) => {
  try { res.json(await svc.getEmployeeHistory(req.params.id)); } catch (e) { next(e); }
});

const createSchema = z.object({
  fullName: z.string().min(1),
  identifier: z.string().min(1),
  position: z.enum(["AUXILIAR", "ASISTENTE", "GERENTE"]),
  departmentName: z.string().optional(),
});

router.post("/", requireRoles("ADMINISTRADOR", "EVALUADOR"), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    res.status(201).json(await svc.createEmployee(data));
  } catch (e) { next(e); }
});

const updateSchema = z.object({
  fullName: z.string().optional(),
  position: z.enum(["AUXILIAR", "ASISTENTE", "GERENTE"]).optional(),
  departmentName: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

router.put("/:id", requireRoles("ADMINISTRADOR"), async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    res.json(await svc.updateEmployee(req.params.id, data));
  } catch (e) { next(e); }
});

router.delete("/:id", requireRoles("ADMINISTRADOR"), async (req, res, next) => {
  try {
    res.json(await svc.deactivateEmployee(req.params.id));
  } catch (e) { next(e); }
});

export default router;
