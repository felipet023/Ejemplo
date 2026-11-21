import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import * as ai from "./ai.service";
import * as scoring from "./scoring.service";
import * as eligibility from "./eligibility.service";
import { z } from "zod";

export async function identifyEmployee(data: { fullName: string; identifier: string; position: string }) {
  const emp = await prisma.employee.findUnique({ where: { identifier: data.identifier }, include: { department: true } });
  if (!emp) throw new AppError("Empleado no encontrado", 404);
  if (emp.fullName.trim().toLowerCase() !== data.fullName.trim().toLowerCase()) throw new AppError("El nombre no coincide", 400);
  if (emp.position !== (data.position as any)) throw new AppError("El cargo no coincide", 400);
  if (emp.status !== "ACTIVE") throw new AppError("Empleado inactivo", 403);
  return emp;
}

export async function startEvaluation(data: { employeeId: string; clientTypeId: string }) {
  const emp = await prisma.employee.findUnique({ where: { id: data.employeeId } });
  if (!emp) throw new AppError("Empleado no encontrado", 404);
  const ct = await prisma.clientType.findUnique({ where: { id: data.clientTypeId } });
  if (!ct) throw new AppError("Tipo de cliente no encontrado", 404);

  const allowed = await eligibility.isAllowed(emp.position, ct.name);
  if (!allowed) throw new AppError("Este cargo no está habilitado para este tipo de cliente", 403);

  // recent questions
  const recentLogs = await prisma.questionGenerationLog.findMany({
    where: { employeeId: emp.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const recentIds = recentLogs.flatMap((l) => (l.questionIds as string[]) || []);
  const recentQuestions = recentIds.length
    ? await prisma.question.findMany({ where: { id: { in: recentIds } }, select: { statement: true } })
    : [];
  const recentStatements = recentQuestions.map((q) => q.statement);

  const competences = await prisma.competence.findMany({ where: { clientTypeId: ct.id } });

  const evalRec = await prisma.evaluation.create({
    data: {
      employeeId: emp.id,
      clientTypeId: ct.id,
      position: emp.position,
      status: "IN_PROGRESS",
    },
  });

  // generate questions
  let generated: any[];
  let usedBackup = false;
  const ctx = {
    position: emp.position,
    clientType: ct.name,
    difficulty: ct.difficulty,
    competences: competences.map((c) => c.name),
    recentQuestionStatements: recentStatements,
    companyContext: "CRM Assessment - atención al cliente",
  };

  try {
    const aiAvailable = await ai.isAiAvailable();
    if (!aiAvailable) throw new Error("IA no disponible");
    generated = await ai.generateQuestions(ctx as any);
  } catch (e) {
    // fallback backup questions
    usedBackup = true;
    const backups = await prisma.question.findMany({
      where: { isBackup: true, clientTypeId: ct.id, position: emp.position, isActive: true },
      take: 5,
    });
    // if not enough, broaden
    let pool = backups;
    if (pool.length < 5) {
      pool = await prisma.question.findMany({
        where: { isBackup: true, clientTypeId: ct.id, isActive: true },
        take: 5,
      });
    }
    if (pool.length < 5) {
      pool = await prisma.question.findMany({ where: { isBackup: true, isActive: true }, take: 5 });
    }
    if (pool.length < 5) throw new AppError("No hay preguntas de respaldo disponibles", 503);
    generated = pool.map((q) => ({
      questionId: q.questionId,
      type: q.type,
      statement: q.statement,
      competence: q.competence,
      difficulty: q.difficulty,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      maximumScore: q.maxScore,
      evaluationRubric: q.evaluationRubric,
      _existingId: q.id,
    }));
  }

  // persist questions (if new from AI, create records)
  const questionRecords: any[] = [];
  for (const g of generated) {
    if (g._existingId) {
      const q = await prisma.question.findUnique({ where: { id: g._existingId } });
      questionRecords.push(q);
      continue;
    }
    // map difficulty string
    const q = await prisma.question.create({
      data: {
        questionId: g.questionId,
        type: g.type,
        statement: g.statement,
        competence: g.competence,
        difficulty: g.difficulty,
        options: g.options,
        correctAnswer: g.correctAnswer,
        explanation: g.explanation || "",
        maxScore: g.maximumScore,
        evaluationRubric: g.evaluationRubric || {},
        isBackup: false,
        approved: true,
        position: emp.position,
        clientTypeId: ct.id,
      },
    });
    questionRecords.push(q);
  }

  // link
  await prisma.evaluation.update({
    where: { id: evalRec.id },
    data: { questions: { connect: questionRecords.map((q) => ({ id: q.id })) } },
  });

  // log generation
  await prisma.questionGenerationLog.create({
    data: {
      employeeId: emp.id,
      position: emp.position,
      clientType: ct.name,
      questionIds: questionRecords.map((q) => q.id),
    },
  });

  // activity log
  await prisma.activityLog.create({
    data: { action: "EVALUATION_STARTED", entity: "evaluation", entityId: evalRec.id, metadata: { usedBackup } },
  });

  const full = await prisma.evaluation.findUnique({
    where: { id: evalRec.id },
    include: { questions: true, clientType: true, employee: true },
  });

  // hide correct answers
  const safeQuestions = (full?.questions || []).map((q) => ({
    id: q.id,
    questionId: q.questionId,
    type: q.type,
    statement: q.statement,
    competence: q.competence,
    difficulty: q.difficulty,
    options: q.options,
    maximumScore: q.maxScore,
  }));

  return {
    evaluationId: evalRec.id,
    employee: { id: emp.id, fullName: emp.fullName, identifier: emp.identifier, position: emp.position },
    clientType: { id: ct.id, name: ct.name, difficulty: ct.difficulty },
    usedBackup,
    questions: safeQuestions,
  };
}

export async function getEvaluation(id: string) {
  const ev = await prisma.evaluation.findUnique({
    where: { id },
    include: { employee: true, clientType: true, questions: true, answers: { include: { question: true } }, result: true },
  });
  if (!ev) throw new AppError("Evaluación no encontrada", 404);
  return ev;
}

const submitSchema = z.object({
  answers: z.array(z.object({ questionId: z.string(), answer: z.any() })),
});

export async function submitAnswers(evaluationId: string, payload: any) {
  const data = submitSchema.parse(payload);
  const ev = await prisma.evaluation.findUnique({ where: { id: evaluationId }, include: { questions: true } });
  if (!ev) throw new AppError("Evaluación no encontrada", 404);
  if (ev.status === "COMPLETED") throw new AppError("La evaluación ya fue finalizada", 400);

  // upsert answers
  for (const a of data.answers) {
    const q = ev.questions.find((qq) => qq.id === a.questionId || qq.questionId === a.questionId);
    if (!q) continue;
    const existing = await prisma.answer.findUnique({ where: { evaluationId_questionId: { evaluationId, questionId: q.id } } });
    if (existing) {
      await prisma.answer.update({ where: { id: existing.id }, data: { answer: a.answer } });
    } else {
      await prisma.answer.create({ data: { evaluationId, questionId: q.id, answer: a.answer } });
    }
  }
  return { saved: data.answers.length };
}

export async function finalizeEvaluation(evaluationId: string, timeUsedSeconds?: number) {
  const ev = await prisma.evaluation.findUnique({
    where: { id: evaluationId },
    include: { questions: true, answers: true, employee: true, clientType: true },
  });
  if (!ev) throw new AppError("Evaluación no encontrada", 404);
  if (ev.status === "COMPLETED") throw new AppError("Ya finalizada", 400);

  // ensure all questions answered
  if (ev.answers.length < ev.questions.length) throw new AppError("Cuestionario incompleto", 400);

  // For practical cases with open answers, evaluate with AI if needed
  for (const q of ev.questions) {
    if (q.type === "PRACTICAL_CASE" && typeof q.correctAnswer !== "number") {
      const ans = ev.answers.find((a) => a.questionId === q.id);
      if (ans) {
        const rubric = q.evaluationRubric || {};
        const raw = ans.answer as any;
        const text = typeof raw === "string" ? raw : (raw?.text ?? JSON.stringify(raw));
        const { score, feedback } = await ai.evaluateOpenAnswer(rubric, text, { competence: q.competence });
        await prisma.answer.update({ where: { id: ans.id }, data: { score, feedback } });
      }
    }
  }

  const refreshed = await prisma.evaluation.findUnique({ where: { id: evaluationId }, include: { questions: true, answers: true } });
  const answersInput = (refreshed!.answers || []).map((a) => ({ questionId: a.questionId, answer: a.answer, score: a.score }));
  // attach score to answer for scoring
  const scoreRes = await scoring.scoreEvaluation(evaluationId, answersInput as any, refreshed!.questions);

  // recommendations
  const weak = Object.entries(scoreRes.competenceScores).filter(([, v]) => v < (20)).map(([k]) => k);
  const recommendations = weak.length
    ? `Mejorar competencias: ${weak.join(", ")}.`
    : "Buen desempeño general. Mantener capacitación continua.";

  await prisma.evaluation.update({
    where: { id: evaluationId },
    data: {
      status: "COMPLETED",
      totalScore: scoreRes.totalScore,
      resultLabel: scoreRes.label,
      completedAt: new Date(),
      timeUsedSeconds: timeUsedSeconds || null,
      rulesVersion: scoring.RULES_VERSION,
      recommendations,
    },
  });

  await prisma.result.create({
    data: {
      evaluationId,
      score: scoreRes.totalScore,
      label: scoreRes.label,
      competenceScores: scoreRes.competenceScores,
      criticalErrors: scoreRes.criticalErrors,
    },
  });

  await prisma.activityLog.create({
    data: { action: "EVALUATION_COMPLETED", entity: "evaluation", entityId: evaluationId, metadata: { score: scoreRes.totalScore, label: scoreRes.label } },
  });

  return getEvaluation(evaluationId);
}

export async function listEvaluations(filters: { employeeId?: string; position?: string; clientType?: string; from?: string; to?: string; result?: string }) {
  return prisma.evaluation.findMany({
    where: {
      ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
      ...(filters.position ? { position: filters.position as any } : {}),
      ...(filters.clientType ? { clientType: { name: filters.clientType as any } } : {}),
      ...(filters.result ? { resultLabel: filters.result as any } : {}),
      ...(filters.from || filters.to ? { createdAt: { ...(filters.from ? { gte: new Date(filters.from) } : {}), ...(filters.to ? { lte: new Date(filters.to) } : {}) } } : {}),
    },
    include: { employee: true, clientType: true, result: true },
    orderBy: { createdAt: "desc" },
  });
}
