-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN');

-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'INVALIDATED', 'TEST');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'SCALE_1_5', 'SCALE_0_10', 'SHORT_TEXT', 'LONG_TEXT', 'DATE', 'PERIOD');

-- CreateEnum
CREATE TYPE "AnonymityMode" AS ENUM ('ANONYMOUS', 'IDENTIFIED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "SurveyStatus" NOT NULL DEFAULT 'DRAFT',
    "currentVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyVersion" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "anonymityMode" "AnonymityMode" NOT NULL DEFAULT 'ANONYMOUS',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveySection" (
    "id" TEXT NOT NULL,
    "surveyVersionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "SurveySection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "analyticsCode" TEXT,
    "text" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "helpText" TEXT,
    "conditionJson" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RespondentRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RespondentRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaborationFormat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CollaborationFormat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessOfficeDirection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProcessOfficeDirection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "surveyVersionId" TEXT NOT NULL,
    "status" "ResponseStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "idempotencyKey" TEXT NOT NULL,
    "anonymityMode" "AnonymityMode" NOT NULL,
    "respondentName" TEXT,
    "respondentEmail" TEXT,
    "contactConsent" BOOLEAN NOT NULL DEFAULT false,
    "departmentId" TEXT,
    "projectId" TEXT,
    "roleId" TEXT,
    "formatId" TEXT,
    "interactionStart" TIMESTAMP(3),
    "interactionEnd" TIMESTAMP(3),
    "departmentSnapshot" TEXT NOT NULL,
    "projectSnapshot" TEXT NOT NULL,
    "roleSnapshot" TEXT NOT NULL,
    "formatSnapshot" TEXT NOT NULL,
    "invalidationReason" TEXT,
    "invalidatedBy" TEXT,
    "invalidatedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponseDirection" (
    "responseId" TEXT NOT NULL,
    "directionId" TEXT NOT NULL,
    "directionSnapshot" TEXT NOT NULL,

    CONSTRAINT "SurveyResponseDirection_pkey" PRIMARY KEY ("responseId","directionId")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "questionCodeSnapshot" TEXT,
    "questionTextSnapshot" TEXT NOT NULL,
    "questionTypeSnapshot" "QuestionType" NOT NULL,
    "numericValue" DOUBLE PRECISION,
    "textValue" TEXT,
    "dateValue" TIMESTAMP(3),
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "notApplicable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerOption" (
    "answerId" TEXT NOT NULL,
    "questionOptionId" TEXT NOT NULL,
    "valueSnapshot" TEXT NOT NULL,
    "labelSnapshot" TEXT NOT NULL,

    CONSTRAINT "AnswerOption_pkey" PRIMARY KEY ("answerId","questionOptionId")
);

-- CreateTable
CREATE TABLE "SavedDashboardView" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "configJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedDashboardView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportRecord" (
    "id" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "filtersJson" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExportRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveRecord" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "archivedBy" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restoredAt" TIMESTAMP(3),

    CONSTRAINT "ArchiveRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "detailsJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Survey_slug_key" ON "Survey"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Survey_currentVersionId_key" ON "Survey"("currentVersionId");

-- CreateIndex
CREATE INDEX "Survey_status_idx" ON "Survey"("status");

-- CreateIndex
CREATE INDEX "SurveyVersion_surveyId_publishedAt_idx" ON "SurveyVersion"("surveyId", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyVersion_surveyId_version_key" ON "SurveyVersion"("surveyId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "SurveySection_surveyVersionId_order_key" ON "SurveySection"("surveyVersionId", "order");

-- CreateIndex
CREATE INDEX "Question_analyticsCode_idx" ON "Question"("analyticsCode");

-- CreateIndex
CREATE UNIQUE INDEX "Question_sectionId_order_key" ON "Question"("sectionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_questionId_value_key" ON "QuestionOption"("questionId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RespondentRole_name_key" ON "RespondentRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CollaborationFormat_name_key" ON "CollaborationFormat"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessOfficeDirection_name_key" ON "ProcessOfficeDirection"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_idempotencyKey_key" ON "SurveyResponse"("idempotencyKey");

-- CreateIndex
CREATE INDEX "SurveyResponse_surveyId_status_submittedAt_idx" ON "SurveyResponse"("surveyId", "status", "submittedAt");

-- CreateIndex
CREATE INDEX "SurveyResponse_departmentId_projectId_idx" ON "SurveyResponse"("departmentId", "projectId");

-- CreateIndex
CREATE INDEX "SurveyResponse_anonymityMode_idx" ON "SurveyResponse"("anonymityMode");

-- CreateIndex
CREATE INDEX "Answer_questionCodeSnapshot_numericValue_idx" ON "Answer"("questionCodeSnapshot", "numericValue");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_responseId_questionId_key" ON "Answer"("responseId", "questionId");

-- CreateIndex
CREATE INDEX "SavedDashboardView_userId_idx" ON "SavedDashboardView"("userId");

-- CreateIndex
CREATE INDEX "ExportRecord_createdAt_idx" ON "ExportRecord"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ArchiveRecord_surveyId_key" ON "ArchiveRecord"("surveyId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "SurveyVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyVersion" ADD CONSTRAINT "SurveyVersion_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveySection" ADD CONSTRAINT "SurveySection_surveyVersionId_fkey" FOREIGN KEY ("surveyVersionId") REFERENCES "SurveyVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "SurveySection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyVersionId_fkey" FOREIGN KEY ("surveyVersionId") REFERENCES "SurveyVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "RespondentRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_formatId_fkey" FOREIGN KEY ("formatId") REFERENCES "CollaborationFormat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponseDirection" ADD CONSTRAINT "SurveyResponseDirection_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "SurveyResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponseDirection" ADD CONSTRAINT "SurveyResponseDirection_directionId_fkey" FOREIGN KEY ("directionId") REFERENCES "ProcessOfficeDirection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "SurveyResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerOption" ADD CONSTRAINT "AnswerOption_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerOption" ADD CONSTRAINT "AnswerOption_questionOptionId_fkey" FOREIGN KEY ("questionOptionId") REFERENCES "QuestionOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveRecord" ADD CONSTRAINT "ArchiveRecord_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
