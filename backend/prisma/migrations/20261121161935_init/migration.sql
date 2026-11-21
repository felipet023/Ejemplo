-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('ADMINISTRADOR', 'GERENTE', 'EVALUADOR');

-- CreateEnum
CREATE TYPE "PositionName" AS ENUM ('AUXILIAR', 'ASISTENTE', 'GERENTE');

-- CreateEnum
CREATE TYPE "ClientTypeName" AS ENUM ('NORMAL', 'INDECISO', 'DIFICIL', 'CRITICO');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'EXTREMA');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'HYPOTHETICAL', 'TRUE_FALSE', 'ORDERING', 'PRACTICAL_CASE');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ResultLabel" AS ENUM ('EXCELENTE', 'APTO', 'REQUIERE_CAPACITACION', 'NO_APTO');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" "RoleName" NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "position" "PositionName" NOT NULL,
    "departmentId" TEXT,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientType" (
    "id" TEXT NOT NULL,
    "name" "ClientTypeName" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "description" TEXT,

    CONSTRAINT "ClientType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competence" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "clientTypeId" TEXT,

    CONSTRAINT "Competence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "statement" TEXT NOT NULL,
    "competence" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "options" JSONB NOT NULL,
    "correctAnswer" JSONB NOT NULL,
    "explanation" TEXT,
    "maxScore" INTEGER NOT NULL DEFAULT 20,
    "evaluationRubric" JSONB,
    "isBackup" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "position" "PositionName",
    "clientTypeId" TEXT,
    "competenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "clientTypeId" TEXT NOT NULL,
    "position" "PositionName" NOT NULL,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'DRAFT',
    "totalScore" INTEGER,
    "resultLabel" "ResultLabel",
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeUsedSeconds" INTEGER,
    "rulesVersion" TEXT NOT NULL DEFAULT '1.0',
    "recommendations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "isCorrect" BOOLEAN,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "label" "ResultLabel" NOT NULL,
    "competenceScores" JSONB NOT NULL,
    "criticalErrors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EligibilityMatrix" (
    "id" TEXT NOT NULL,
    "position" "PositionName" NOT NULL,
    "clientType" "ClientTypeName" NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EligibilityMatrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "employeeId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiConfig" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'none',
    "model" TEXT,
    "timeoutMs" INTEGER NOT NULL DEFAULT 30000,
    "maxRetries" INTEGER NOT NULL DEFAULT 2,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionGenerationLog" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT,
    "position" "PositionName" NOT NULL,
    "clientType" "ClientTypeName" NOT NULL,
    "questionIds" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionGenerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EvaluationQuestions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_identifier_key" ON "Employee"("identifier");

-- CreateIndex
CREATE INDEX "Employee_fullName_idx" ON "Employee"("fullName");

-- CreateIndex
CREATE INDEX "Employee_position_idx" ON "Employee"("position");

-- CreateIndex
CREATE UNIQUE INDEX "ClientType_name_key" ON "ClientType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Competence_name_clientTypeId_key" ON "Competence"("name", "clientTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_questionId_key" ON "Question"("questionId");

-- CreateIndex
CREATE INDEX "Question_position_clientTypeId_idx" ON "Question"("position", "clientTypeId");

-- CreateIndex
CREATE INDEX "Question_isBackup_idx" ON "Question"("isBackup");

-- CreateIndex
CREATE INDEX "Evaluation_employeeId_idx" ON "Evaluation"("employeeId");

-- CreateIndex
CREATE INDEX "Evaluation_clientTypeId_idx" ON "Evaluation"("clientTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_evaluationId_questionId_key" ON "Answer"("evaluationId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Result_evaluationId_key" ON "Result"("evaluationId");

-- CreateIndex
CREATE UNIQUE INDEX "EligibilityMatrix_position_clientType_key" ON "EligibilityMatrix"("position", "clientType");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "_EvaluationQuestions_AB_unique" ON "_EvaluationQuestions"("A", "B");

-- CreateIndex
CREATE INDEX "_EvaluationQuestions_B_index" ON "_EvaluationQuestions"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competence" ADD CONSTRAINT "Competence_clientTypeId_fkey" FOREIGN KEY ("clientTypeId") REFERENCES "ClientType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_clientTypeId_fkey" FOREIGN KEY ("clientTypeId") REFERENCES "ClientType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_competenceId_fkey" FOREIGN KEY ("competenceId") REFERENCES "Competence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_clientTypeId_fkey" FOREIGN KEY ("clientTypeId") REFERENCES "ClientType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EvaluationQuestions" ADD CONSTRAINT "_EvaluationQuestions_A_fkey" FOREIGN KEY ("A") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EvaluationQuestions" ADD CONSTRAINT "_EvaluationQuestions_B_fkey" FOREIGN KEY ("B") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
