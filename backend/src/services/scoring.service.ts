import { prisma } from "../config/db";

export const RULES_VERSION = "1.0";

export interface AnswerInput {
  questionId: string;
  answer: any;
  score?: number;
}

export interface ScoreResult {
  totalScore: number;
  label: "EXCELENTE" | "APTO" | "REQUIERE_CAPACITACION" | "NO_APTO";
  competenceScores: Record<string, number>;
  criticalErrors: string[];
}

const CRITICAL_ERROR_RULES: Record<string, (q: any, answer: any) => boolean> = {
  // Example: if a critical competence question answered wrong -> critical error
};

export async function scoreEvaluation(evaluationId: string, answers: AnswerInput[], questions: any[]): Promise<ScoreResult> {
  const competenceScores: Record<string, number> = {};
  let total = 0;
  const criticalErrors: string[] = [];

  for (const q of questions) {
    const ans = answers.find((a) => a.questionId === q.questionId || a.questionId === q.id);
    if (!ans) continue;
    let score = 0;
    let isCorrect = false;

    if (q.type === "MULTIPLE_CHOICE" || q.type === "HYPOTHETICAL" || q.type === "TRUE_FALSE") {
      const ms = q.maxScore ?? q.maximumScore ?? 20;
      if (ans.answer === q.correctAnswer) { score = ms; isCorrect = true; }
    } else if (q.type === "ORDERING") {
      // compare arrays
      const correct = JSON.stringify(q.correctAnswer);
      const given = JSON.stringify(ans.answer);
      const ms2 = q.maxScore ?? q.maximumScore ?? 20;
      if (correct === given) { score = ms2; isCorrect = true; }
      else {
        // partial credit: count matching positions
        const cArr = q.correctAnswer as number[];
        const gArr = ans.answer as number[];
        if (Array.isArray(cArr) && Array.isArray(gArr)) {
          let matches = 0;
          for (let i = 0; i < Math.min(cArr.length, gArr.length); i++) if (cArr[i] === gArr[i]) matches++;
          score = Math.round((matches / cArr.length) * (q.maxScore ?? q.maximumScore ?? 20));
        }
      }
    } else if (q.type === "PRACTICAL_CASE") {
      // open answer: if correctAnswer is a number index, compare; else use AI eval score already? We'll handle via ai evaluate
      if (typeof q.correctAnswer === "number") {
        const ms = q.maxScore ?? q.maximumScore ?? 20;
      if (ans.answer === q.correctAnswer) { score = ms; isCorrect = true; }
      } else {
        score = typeof ans.score === "number" ? ans.score : (typeof ans.answer?.score === "number" ? ans.answer.score : 0);
        score = Math.max(0, Math.min(q.maxScore ?? q.maximumScore ?? 20, score));
      }
    }

    // competence accumulation
    const comp = q.competence || "General";
    competenceScores[comp] = (competenceScores[comp] || 0) + score;

    // critical errors: defined by rules config (none by default except score 0 on critical competence?) 
    // We'll mark critical error if question tagged critical and answered wrong
    if (q.isCritical && !isCorrect) criticalErrors.push(q.questionId);

    total += score;
    // persist answer score
    await prisma.answer.updateMany({
      where: { evaluationId, questionId: q.id },
      data: { score, isCorrect, feedback: ans.answer?.feedback || null },
    });
  }

  let label: ScoreResult["label"];
  if (total >= 90) label = "EXCELENTE";
  else if (total >= 80) label = "APTO";
  else if (total >= 60) label = "REQUIERE_CAPACITACION";
  else label = "NO_APTO";

  // minimum competence check: if any competence score 0 and total high? keep simple
  // critical errors override
  if (criticalErrors.length > 0 && label === "EXCELENTE") label = "APTO";
  if (criticalErrors.length > 2) label = "NO_APTO";

  return { totalScore: total, label, competenceScores, criticalErrors };
}
