import { PrismaClient, AnonymityMode, QuestionType, ResponseStatus, SurveyStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DIRECTION_METRICS, METRIC_CODES } from "../lib/constants";

const db = new PrismaClient();
const departments = ["Стратегия и развитие", "Операционная эффективность", "ИТ", "Финансы", "Розничный бизнес"];
const projects = ["Клиентский путь", "Единый каталог процессов", "Цифровой архив", "KPI 2.0", "BPMS", "Школа процессов", "Контроль качества", "Автоматизация отчётности"];
const roles = ["Владелец процесса", "Руководитель проекта", "Бизнес-аналитик", "Эксперт", "Участник команды"];
const formats = ["Консультация", "Методологическая поддержка", "Обследование", "Моделирование", "Оптимизация", "Обучение", "Аудит", "Внедрение системы", "Другое"];
const directions = ["Методология и нотации", "Каталог процессов", "Мониторинг и контроль", "Формирование и анализ KPI", "Оптимизация процессов", "BPMS и инструменты анализа", "Обучение", "База знаний", "Внутренний аудит", "Развитие процессных компетенций"];
const collaboration = [
  [METRIC_CODES.collaboration[0], "Понимание потребностей"], [METRIC_CODES.collaboration[1], "Профессионализм"],
  [METRIC_CODES.collaboration[2], "Коммуникация"], [METRIC_CODES.collaboration[3], "Доступность"],
  [METRIC_CODES.collaboration[4], "Соблюдение договорённостей"], [METRIC_CODES.collaboration[5], "Соблюдение сроков"],
  [METRIC_CODES.collaboration[6], "Прозрачность"], [METRIC_CODES.collaboration[7], "Вовлечение заинтересованных сторон"],
  [METRIC_CODES.collaboration[8], "Сопровождение результата"],
] as const;

async function createSurvey(title: string, slug: string, status: SurveyStatus, version: number, anonymous: AnonymityMode) {
  const survey = await db.survey.create({ data: { title, slug, status } });
  const v = await db.surveyVersion.create({ data: { surveyId: survey.id, version, anonymityMode: anonymous, startsAt: status === "PUBLISHED" ? new Date("2026-01-01") : null, endsAt: status === "PUBLISHED" ? new Date("2027-12-31") : null, publishedAt: status === "DRAFT" ? null : new Date("2026-01-01") } });
  await db.survey.update({ where: { id: survey.id }, data: { currentVersionId: v.id } });
  return { survey, version: v };
}

async function addQuestion(sectionId: string, order: number, code: string | null, text: string, type: QuestionType, required = true) {
  return db.question.create({ data: { sectionId, order, analyticsCode: code, text, type, required } });
}

async function main() {
  const existingData = (await db.user.count()) + (await db.survey.count());
  const resetRequested = process.env.SEED_RESET === "true";
  if (existingData > 0 && !resetRequested) {
    console.log("Seed skipped: database already contains application data");
    return;
  }

  await db.auditLog.deleteMany(); await db.exportRecord.deleteMany(); await db.savedDashboardView.deleteMany(); await db.answerOption.deleteMany(); await db.answer.deleteMany(); await db.surveyResponseDirection.deleteMany(); await db.surveyResponse.deleteMany(); await db.questionOption.deleteMany(); await db.question.deleteMany(); await db.surveySection.deleteMany(); await db.survey.updateMany({ data: { currentVersionId: null } }); await db.surveyVersion.deleteMany(); await db.archiveRecord.deleteMany(); await db.survey.deleteMany(); await db.department.deleteMany(); await db.project.deleteMany(); await db.respondentRole.deleteMany(); await db.collaborationFormat.deleteMany(); await db.processOfficeDirection.deleteMany(); await db.user.deleteMany();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123!";
  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD must be set for production seed");
  }
  if (adminPassword.length < 12) throw new Error("ADMIN_PASSWORD must contain at least 12 characters");
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await db.user.create({ data: { email: process.env.ADMIN_EMAIL ?? "admin@process-office.local", name: "Анна Смирнова", passwordHash } });
  await db.department.createMany({ data: departments.map((name) => ({ name })) });
  await db.project.createMany({ data: projects.map((name) => ({ name })) });
  await db.respondentRole.createMany({ data: roles.map((name) => ({ name })) });
  await db.collaborationFormat.createMany({ data: formats.map((name) => ({ name })) });
  await db.processOfficeDirection.createMany({ data: directions.map((name) => ({ name })) });
  const mainSurvey = await createSurvey("Оценка работы процессного офиса", "feedback-2026", "PUBLISHED", 2, "ANONYMOUS");
  await createSurvey("Оценка работы процессного офиса — новая редакция", "feedback-draft", "DRAFT", 1, "IDENTIFIED");
  await createSurvey("Итоги взаимодействия 2025", "feedback-2025", "CLOSED", 1, "ANONYMOUS");
  const archived = await createSurvey("Пилотный опрос", "feedback-pilot", "ARCHIVED", 1, "ANONYMOUS");
  await db.archiveRecord.create({ data: { surveyId: archived.survey.id, archivedBy: admin.id } });
  const general = await db.surveySection.create({ data: { surveyVersionId: mainSurvey.version.id, title: "Общая оценка", description: "Оцените результат взаимодействия с процессным офисом", order: 1 } });
  const collab = await db.surveySection.create({ data: { surveyVersionId: mainSurvey.version.id, title: "Качество сотрудничества", order: 2 } });
  const dir = await db.surveySection.create({ data: { surveyVersionId: mainSurvey.version.id, title: "Выбранные направления", order: 3 } });
  const comments = await db.surveySection.create({ data: { surveyVersionId: mainSurvey.version.id, title: "Комментарии", order: 4 } });
  const questions = [];
  questions.push(await addQuestion(general.id, 1, METRIC_CODES.overall, "Общая удовлетворённость", "SCALE_1_5"));
  questions.push(await addQuestion(general.id, 2, METRIC_CODES.expectations, "Соответствие ожиданиям", "SCALE_1_5"));
  questions.push(await addQuestion(general.id, 3, METRIC_CODES.value, "Практическая ценность", "SCALE_1_5"));
  questions.push(await addQuestion(general.id, 4, METRIC_CODES.reuse, "Готовность повторно обратиться", "SCALE_1_5"));
  questions.push(await addQuestion(general.id, 5, METRIC_CODES.nps, "Вероятность рекомендации", "SCALE_0_10"));
  for (const [i, [code, text]] of collaboration.entries()) questions.push(await addQuestion(collab.id, i + 1, code, text, "SCALE_1_5"));
  for (const [i, [code, text]] of DIRECTION_METRICS.entries()) questions.push(await addQuestion(dir.id, i + 1, code, text, "SCALE_1_5", false));
  questions.push(await addQuestion(comments.id, 1, "COMMENT_USEFUL", "Что было полезно?", "LONG_TEXT", false));
  questions.push(await addQuestion(comments.id, 2, "COMMENT_IMPROVE", "Что можно улучшить?", "LONG_TEXT", false));
  questions.push(await addQuestion(comments.id, 3, "COMMENT_DIFFICULTIES", "Какие сложности возникли?", "LONG_TEXT", false));
  questions.push(await addQuestion(comments.id, 4, "COMMENT_HELP", "Какая помощь необходима?", "LONG_TEXT", false));
  const deps = await db.department.findMany(); const projs = await db.project.findMany(); const rls = await db.respondentRole.findMany(); const fmts = await db.collaborationFormat.findMany(); const dirs = await db.processOfficeDirection.findMany();
  const useful = ["Команда быстро структурировала проблему и дала применимые рекомендации.", "Полезны шаблоны и разбор процесса на рабочей сессии.", "Удалось согласовать единый подход между подразделениями.", "Ценным был практический взгляд на метрики процесса."];
  const improve = ["Хотелось бы раньше получать промежуточные материалы.", "Нужно больше примеров из нашей отрасли.", "Стоит сократить время согласования итоговой схемы.", "Добавить короткие памятки после консультаций."];
  for (let i = 0; i < 56; i++) {
    const anonymous = i % 3 !== 0; const submitted = new Date(Date.UTC(2026, 1 + (i % 6), 2 + (i % 24), 9 + (i % 7)));
    const status: ResponseStatus = i === 7 || i === 31 ? "INVALIDATED" : "SUBMITTED";
    const response = await db.surveyResponse.create({ data: {
      surveyId: mainSurvey.survey.id, surveyVersionId: mainSurvey.version.id, status, idempotencyKey: crypto.randomUUID(), anonymityMode: anonymous ? "ANONYMOUS" : "IDENTIFIED",
      respondentName: anonymous ? null : `Респондент ${i + 1}`, respondentEmail: anonymous ? null : `respondent${i + 1}@company.local`, contactConsent: !anonymous && i % 2 === 0,
      departmentId: deps[i % deps.length].id, projectId: projs[i % projs.length].id, roleId: rls[i % rls.length].id, formatId: fmts[i % fmts.length].id,
      departmentSnapshot: deps[i % deps.length].name, projectSnapshot: projs[i % projs.length].name, roleSnapshot: rls[i % rls.length].name, formatSnapshot: fmts[i % fmts.length].name,
      interactionStart: new Date(Date.UTC(2026, i % 6, 1)), interactionEnd: submitted, submittedAt: submitted,
      invalidationReason: status === "INVALIDATED" ? "Тестовое заполнение" : null, invalidatedBy: status === "INVALIDATED" ? admin.id : null, invalidatedAt: status === "INVALIDATED" ? submitted : null,
    }});
    for (const offset of [0, 3 + (i % 4)]) await db.surveyResponseDirection.create({ data: { responseId: response.id, directionId: dirs[(i + offset) % dirs.length].id, directionSnapshot: dirs[(i + offset) % dirs.length].name } });
    for (const q of questions) {
      const isComment = q.type === "LONG_TEXT"; const na = !isComment && q.sectionId !== general.id && (i + q.order) % 17 === 0;
      const base = 2 + ((i * 7 + q.order * 3) % 4); const numeric = q.type === "SCALE_0_10" ? Math.min(10, base * 2 + (i % 2)) : base;
      const text = q.analyticsCode === "COMMENT_USEFUL" && i % 2 === 0 ? useful[i % useful.length] : q.analyticsCode === "COMMENT_IMPROVE" && i % 3 === 0 ? improve[i % improve.length] : null;
      if (!isComment || text) await db.answer.create({ data: { responseId: response.id, questionId: q.id, questionCodeSnapshot: q.analyticsCode, questionTextSnapshot: q.text, questionTypeSnapshot: q.type, numericValue: isComment || na ? null : numeric, textValue: text, notApplicable: na } });
    }
  }
  await db.auditLog.create({ data: { userId: admin.id, action: "SEED_CREATED", entityType: "SYSTEM", detailsJson: JSON.stringify({ responses: 56, surveys: 4 }) } });
  console.log("Seed complete: 4 surveys, 56 responses");
}
main().finally(() => db.$disconnect());
