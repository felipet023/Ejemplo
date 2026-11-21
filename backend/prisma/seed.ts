import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const compMap: Record<string, string[]> = {
  NORMAL: ["Comunicación básica", "Amabilidad", "Atención", "Identificación de necesidades", "Conocimiento del servicio"],
  INDECISO: ["Paciente", "Escucha activa", "Asesoramiento", "Argumentación", "Orientación al cliente"],
  DIFICIL: ["Manejo de conflictos", "Inteligencia emocional", "Negociación", "Resolución de problemas", "Comunicación asertiva"],
  CRITICO: ["Liderazgo", "Toma de decisiones", "Negociación avanzada", "Gestión de crisis", "Resolución de conflictos complejos"],
};

const diffMap: Record<string, string> = { NORMAL: "BAJA", INDECISO: "MEDIA", DIFICIL: "ALTA", CRITICO: "EXTREMA" };

const roleEs: Record<string, string> = { AUXILIAR: "auxiliar", ASISTENTE: "asistente", GERENTE: "gerente" };
function scenario(pos: string, client: string): string {
  const base: Record<string, string> = {
    NORMAL: "un cliente que solicita información sobre un servicio y tiene dudas sencillas",
    INDECISO: "un cliente que cambia de opinión varias veces y pide comparar opciones",
    DIFICIL: "un cliente molesto por un retraso en su pedido que exige una solución inmediata",
    CRITICO: "un cliente muy inconforme que amenaza con cancelar el servicio y escalar la queja",
  };
  return `un ${roleEs[pos] || pos.toLowerCase()} atendiendo a ${base[client]}`;
}

function makeSet(pos: string, client: string) {
  const comps = compMap[client];
  const diff = diffMap[client];
  const scen = scenario(pos, client);
  return [
    {
      type: "MULTIPLE_CHOICE" as const,
      statement: `Escenario: ${scen}. El cliente pregunta por primera vez sobre el servicio. ¿Cuál es la mejor respuesta inicial?`,
      competence: comps[0],
      options: [
        "Saludar con amabilidad, presentarse y preguntar en qué puede ayudar.",
        "Responder de forma breve y directa sin saludar.",
        "Ignorar al cliente hasta que termine de hablar.",
        "Transferir inmediatamente a otro departamento.",
      ],
      correctAnswer: 0,
      explanation: "La comunicación básica y la amabilidad son clave en el primer contacto.",
    },
    {
      type: "HYPOTHETICAL" as const,
      statement: `Situación hipotética: durante la atención, ${scen}, el cliente expresa confusión sobre dos opciones. ¿Qué harías?`,
      competence: comps[1],
      options: [
        "Escuchar activamente, resumir sus dudas y explicar las diferencias con calma.",
        "Insistir en la opción más cara sin explicar.",
        "Decir que no hay tiempo para explicar.",
        "Finalizar la conversación abruptamente.",
      ],
      correctAnswer: 0,
      explanation: "La escucha activa y el asesoramiento generan confianza.",
    },
    {
      type: "TRUE_FALSE" as const,
      statement: `Verdadero o falso: ante ${scen}, está permitido prometer resultados que no se pueden cumplir para calmar al cliente.`,
      competence: comps[2],
      options: ["Verdadero", "Falso"],
      correctAnswer: 1,
      explanation: "No se deben hacer promesas incumplibles; afecta la credibilidad.",
    },
    {
      type: "ORDERING" as const,
      statement: `Ordena las acciones para resolver correctamente el caso: ${scen}.`,
      competence: comps[3],
      options: [
        "Saludar y empatizar con el cliente",
        "Identificar la causa del problema",
        "Ofrecer una solución clara",
        "Confirmar satisfacción y cerrar",
      ],
      correctAnswer: [0, 1, 2, 3],
      explanation: "El orden lógico mejora la resolución y la experiencia.",
    },
    {
      type: "PRACTICAL_CASE" as const,
      statement: `Caso práctico: ${scen}. El cliente solicita una compensación. Redacta la respuesta que darías (máx. 20 pts).`,
      competence: comps[4],
      options: [],
      correctAnswer: null,
      explanation: "Se evalúa comunicación, empatía, resolución y cumplimiento de procedimientos.",
      rubric: { comunicacion: 4, empatia: 4, resolucion: 4, tomaDecisiones: 4, procedimientos: 4 },
    },
  ];
}

async function main() {
  // Roles
  for (const name of ["ADMINISTRADOR", "GERENTE", "EVALUADOR"] as const) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }
  const adminRole = await prisma.role.findUnique({ where: { name: "ADMINISTRADOR" } });
  const gerenteRole = await prisma.role.findUnique({ where: { name: "GERENTE" } });
  const evalRole = await prisma.role.findUnique({ where: { name: "EVALUADOR" } });

  const hash = await bcrypt.hash("Password123!", 10);
  await prisma.user.upsert({ where: { email: "admin@crm.local" }, update: {}, create: { email: "admin@crm.local", passwordHash: hash, fullName: "Administrador CRM", roleId: adminRole!.id } });
  await prisma.user.upsert({ where: { email: "gerente@crm.local" }, update: {}, create: { email: "gerente@crm.local", passwordHash: hash, fullName: "Gerente Demo", roleId: gerenteRole!.id } });
  await prisma.user.upsert({ where: { email: "evaluador@crm.local" }, update: {}, create: { email: "evaluador@crm.local", passwordHash: hash, fullName: "Evaluador Demo", roleId: evalRole!.id } });

  for (const name of ["Atención al Cliente", "Ventas", "Soporte"]) {
    await prisma.department.upsert({ where: { name }, update: {}, create: { name } });
  }

  const clientDefs = [
    { name: "NORMAL", difficulty: "BAJA", description: "Cliente normal" },
    { name: "INDECISO", difficulty: "MEDIA", description: "Cliente indeciso" },
    { name: "DIFICIL", difficulty: "ALTA", description: "Cliente difícil" },
    { name: "CRITICO", difficulty: "EXTREMA", description: "Cliente crítico" },
  ] as const;
  for (const c of clientDefs) {
    await prisma.clientType.upsert({ where: { name: c.name }, update: {}, create: { name: c.name, difficulty: c.difficulty, description: c.description } });
  }

  for (const [ctName, comps] of Object.entries(compMap)) {
    const ct = await prisma.clientType.findUnique({ where: { name: ctName as any } });
    for (const c of comps) {
      await prisma.competence.upsert({ where: { name_clientTypeId: { name: c, clientTypeId: ct!.id } }, update: {}, create: { name: c, clientTypeId: ct!.id } });
    }
  }

  // Remove old backup questions to avoid duplicates
  await prisma.question.deleteMany({ where: { isBackup: true } });

  const positions = ["AUXILIAR", "ASISTENTE", "GERENTE"] as const;
  const clients = ["NORMAL", "INDECISO", "DIFICIL", "CRITICO"] as const;
  for (const pos of positions) {
    for (const client of clients) {
      const ct = await prisma.clientType.findUnique({ where: { name: client } });
      const set = makeSet(pos, client);
      for (let i = 0; i < set.length; i++) {
        const q = set[i];
        await prisma.question.create({
          data: {
            questionId: `BK-${pos}-${client}-${i + 1}`,
            type: q.type as any,
            statement: q.statement,
            competence: q.competence,
            difficulty: diffMap[client] as any,
            options: q.options as any,
            correctAnswer: q.correctAnswer === null ? {} : (q.correctAnswer as any),
            explanation: q.explanation,
            maxScore: 20,
            evaluationRubric: (q as any).rubric || {},
            isBackup: true,
            approved: true,
            position: pos as any,
            clientTypeId: ct!.id,
          },
        });
      }
    }
  }

  const dept = await prisma.department.findFirst();
  const demoEmps = [
    { fullName: "Ana Auxiliar Demo", identifier: "EMP-001", position: "AUXILIAR" },
    { fullName: "Bruno Asistente Demo", identifier: "EMP-002", position: "ASISTENTE" },
    { fullName: "Carla Gerente Demo", identifier: "EMP-003", position: "GERENTE" },
  ];
  for (const e of demoEmps) {
    await prisma.employee.upsert({ where: { identifier: e.identifier }, update: {}, create: { fullName: e.fullName, identifier: e.identifier, position: e.position as any, departmentId: dept?.id } });
  }

  console.log("Seed completed");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
