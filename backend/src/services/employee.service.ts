import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";

export async function listEmployees(filters: { search?: string; position?: string; department?: string; status?: string }) {
  return prisma.employee.findMany({
    where: {
      ...(filters.search ? { OR: [{ fullName: { contains: filters.search, mode: "insensitive" } }, { identifier: { contains: filters.search, mode: "insensitive" } }] } : {}),
      ...(filters.position ? { position: filters.position as any } : {}),
      ...(filters.status ? { status: filters.status as any } : {}),
      ...(filters.department ? { department: { name: filters.department } } : {}),
    },
    include: { department: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEmployee(id: string) {
  const emp = await prisma.employee.findUnique({ where: { id }, include: { department: true, evaluations: { include: { clientType: true, result: true } } } });
  if (!emp) throw new AppError("Empleado no encontrado", 404);
  return emp;
}

export async function createEmployee(data: { fullName: string; identifier: string; position: string; departmentName?: string }) {
  const exists = await prisma.employee.findUnique({ where: { identifier: data.identifier } });
  if (exists) throw new AppError("Identificador ya existe", 409);
  let departmentId: string | undefined;
  if (data.departmentName) {
    const dept = await prisma.department.upsert({ where: { name: data.departmentName }, update: {}, create: { name: data.departmentName } });
    departmentId = dept.id;
  }
  return prisma.employee.create({
    data: { fullName: data.fullName, identifier: data.identifier, position: data.position as any, departmentId },
    include: { department: true },
  });
}

export async function updateEmployee(id: string, data: { fullName?: string; position?: string; departmentName?: string; status?: string }) {
  const emp = await prisma.employee.findUnique({ where: { id } });
  if (!emp) throw new AppError("Empleado no encontrado", 404);
  let departmentId = emp.departmentId;
  if (data.departmentName) {
    const dept = await prisma.department.upsert({ where: { name: data.departmentName }, update: {}, create: { name: data.departmentName } });
    departmentId = dept.id;
  }
  return prisma.employee.update({
    where: { id },
    data: {
      ...(data.fullName ? { fullName: data.fullName } : {}),
      ...(data.position ? { position: data.position as any } : {}),
      ...(data.status ? { status: data.status as any } : {}),
      departmentId,
    },
    include: { department: true },
  });
}

export async function deactivateEmployee(id: string) {
  return updateEmployee(id, { status: "INACTIVE" });
}

export async function getEmployeeHistory(id: string) {
  return prisma.evaluation.findMany({
    where: { employeeId: id },
    include: { clientType: true, result: true, answers: { include: { question: true } } },
    orderBy: { createdAt: "desc" },
  });
}
