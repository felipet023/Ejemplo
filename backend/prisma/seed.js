"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    // Roles
    for (const name of ["ADMINISTRADOR", "GERENTE", "EVALUADOR"]) {
        await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
    }
    const adminRole = await prisma.role.findUnique({ where: { name: "ADMINISTRADOR" } });
    const gerenteRole = await prisma.role.findUnique({ where: { name: "GERENTE" } });
    const evalRole = await prisma.role.findUnique({ where: { name: "EVALUADOR" } });
    // Users
    const hash = await bcryptjs_1.default.hash("Password123!", 10);
    await prisma.user.upsert({ where: { email: "admin@crm.local" }, update: {}, create: { email: "admin@crm.local", passwordHash: hash, fullName: "Administrador CRM", roleId: adminRole.id } });
    await prisma.user.upsert({ where: { email: "gerente@crm.local" }, update: {}, create: { email: "gerente@crm.local", passwordHash: hash, fullName: "Gerente Demo", roleId: gerenteRole.id } });
    await prisma.user.upsert({ where: { email: "evaluador@crm.local" }, update: {}, create: { email: "evaluador@crm.local", passwordHash: hash, fullName: "Evaluador Demo", roleId: evalRole.id } });
    // Departments
    for (const name of ["Atención al Cliente", "Ventas", "Soporte"]) {
        await prisma.department.upsert({ where: { name }, update: {}, create: { name } });
    }
    // Client types
    const clientDefs = [
        { name: "NORMAL", difficulty: "BAJA", description: "Cliente normal" },
        { name: "INDECISO", difficulty: "MEDIA", description: "Cliente indeciso" },
        { name: "DIFICIL", difficulty: "ALTA", description: "Cliente difícil" },
        { name: "CRITICO", difficulty: "EXTREMA", description: "Cliente crítico" },
    ];
    for (const c of clientDefs) {
        await prisma.clientType.upsert({ where: { name: c.name }, update: {}, create: { name: c.name, difficulty: c.difficulty, description: c.description } });
    }
    // Competences per client type
    const compMap = {
        NORMAL: ["Comunicación básica", "Amabilidad", "Atención", "Identificación de necesidades", "Conocimiento del servicio"],
        INDECISO: ["Paciente", "Escucha activa", "Asesoramiento", "Argumentación", "Orientación al cliente"],
        DIFICIL: ["Manejo de conflictos", "Inteligencia emocional", "Negociación", "Resolución de problemas", "Comunicación asertiva"],
        CRITICO: ["Liderazgo", "Toma de decisiones", "Negociación avanzada", "Gestión de crisis", "Resolución de conflictos complejos"],
    };
    for (const [ctName, comps] of Object.entries(compMap)) {
        const ct = await prisma.clientType.findUnique({ where: { name: ctName } });
        for (const c of comps) {
            await prisma.competence.upsert({ where: { name_clientTypeId: { name: c, clientTypeId: ct.id } }, update: {}, create: { name: c, clientTypeId: ct.id } });
        }
    }
    // Backup questions (one set per position/client type approx)
    const positions = ["AUXILIAR", "ASISTENTE", "GERENTE"];
    let qCounter = 1;
    for (const pos of positions) {
        for (const ctName of ["NORMAL", "INDECISO", "DIFICIL", "CRITICO"]) {
            const ct = await prisma.clientType.findUnique({ where: { name: ctName } });
            const comps = compMap[ctName];
            const types = ["MULTIPLE_CHOICE", "HYPOTHETICAL", "TRUE_FALSE", "ORDERING", "PRACTICAL_CASE"];
            for (let i = 0; i < 5; i++) {
                await prisma.question.create({
                    data: {
                        questionId: `BK-${pos}-${ctName}-${i + 1}`,
                        type: types[i],
                        statement: `[DEMO][${pos}][${ctName}] Pregunta de respaldo ${i + 1}: ¿Cómo atenderías a este cliente? (competencia: ${comps[i % comps.length]})`,
                        competence: comps[i % comps.length],
                        difficulty: ct.difficulty,
                        options: types[i] === "TRUE_FALSE" ? ["Verdadero", "Falso"] : ["Opción A", "Opción B", "Opción C", "Opción D"],
                        correctAnswer: types[i] === "ORDERING" ? [0, 1, 2, 3] : 0,
                        explanation: "Pregunta de respaldo DEMO.",
                        maxScore: 20,
                        evaluationRubric: {},
                        isBackup: true,
                        approved: true,
                        position: pos,
                        clientTypeId: ct.id,
                    },
                });
                qCounter++;
            }
        }
    }
    // Demo employees
    const dept = await prisma.department.findFirst();
    const demoEmps = [
        { fullName: "Ana Auxiliar Demo", identifier: "EMP-001", position: "AUXILIAR" },
        { fullName: "Bruno Asistente Demo", identifier: "EMP-002", position: "ASISTENTE" },
        { fullName: "Carla Gerente Demo", identifier: "EMP-003", position: "GERENTE" },
    ];
    for (const e of demoEmps) {
        await prisma.employee.upsert({ where: { identifier: e.identifier }, update: {}, create: { fullName: e.fullName, identifier: e.identifier, position: e.position, departmentId: dept?.id } });
    }
    console.log("Seed completed");
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
