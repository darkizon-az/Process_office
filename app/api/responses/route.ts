import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { surveyResponseSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const input = surveyResponseSchema.parse(await request.json());
    const existing = await prisma.surveyResponse.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return NextResponse.json({ id: existing.id, duplicate: true });
    const survey = await prisma.survey.findUnique({ where: { id: input.surveyId }, include: { currentVersion: { include: { sections: { include: { questions: true } } } } } });
    const now = new Date(); const version = survey?.currentVersion;
    if (!survey || !version || version.id !== input.surveyVersionId || survey.status !== "PUBLISHED" || (version.startsAt && version.startsAt > now) || (version.endsAt && version.endsAt < now)) return NextResponse.json({ error: "Опрос сейчас не принимает ответы" }, { status: 409 });
    if (version.anonymityMode !== input.anonymityMode) return NextResponse.json({ error: "Режим анонимности не совпадает с версией опроса" }, { status: 400 });
    const [department, project, role, format, directions] = await Promise.all([
      prisma.department.findUnique({ where: { id: input.departmentId } }), prisma.project.findUnique({ where: { id: input.projectId } }), prisma.respondentRole.findUnique({ where: { id: input.roleId } }), prisma.collaborationFormat.findUnique({ where: { id: input.formatId } }), prisma.processOfficeDirection.findMany({ where: { id: { in: input.directionIds }, active: true } }),
    ]);
    if (!department?.active || !project?.active || !role?.active || !format?.active || directions.length !== input.directionIds.length) return NextResponse.json({ error: "Некорректные значения контекста" }, { status: 400 });
    const questions = version.sections.flatMap((s) => s.questions); const questionMap = new Map(questions.map((q) => [q.id, q])); const answerMap = new Map(input.answers.map((a) => [a.questionId, a]));
    for (const q of questions.filter((q) => q.required)) { const a = answerMap.get(q.id); if (!a || (!a.notApplicable && a.numericValue == null && !a.textValue)) return NextResponse.json({ error: `Заполните поле «${q.text}»` }, { status: 400 }); }
    const result = await prisma.$transaction(async (tx) => {
      const response = await tx.surveyResponse.create({ data: { surveyId: survey.id, surveyVersionId: version.id, status: "SUBMITTED", idempotencyKey: input.idempotencyKey, anonymityMode: input.anonymityMode, respondentName: input.anonymityMode === "IDENTIFIED" ? input.respondentName : null, respondentEmail: input.anonymityMode === "IDENTIFIED" ? input.respondentEmail : null, contactConsent: input.anonymityMode === "IDENTIFIED" && input.contactConsent, departmentId: department.id, projectId: project.id, roleId: role.id, formatId: format.id, interactionStart: new Date(input.interactionStart), interactionEnd: new Date(input.interactionEnd), departmentSnapshot: department.name, projectSnapshot: project.name, roleSnapshot: role.name, formatSnapshot: format.name, submittedAt: now } });
      await tx.surveyResponseDirection.createMany({ data: directions.map((d) => ({ responseId: response.id, directionId: d.id, directionSnapshot: d.name })) });
      for (const a of input.answers) { const q = questionMap.get(a.questionId); if (!q) continue; await tx.answer.create({ data: { responseId: response.id, questionId: q.id, questionCodeSnapshot: q.analyticsCode, questionTextSnapshot: q.text, questionTypeSnapshot: q.type, numericValue: a.notApplicable ? null : a.numericValue, textValue: a.textValue?.trim() || null, notApplicable: a.notApplicable ?? false } }); }
      return response;
    });
    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (error) { if ((error as {code?:string}).code === "P2002") return NextResponse.json({ error: "Этот ответ уже был отправлен" }, { status: 409 }); console.error("Response submission failed"); return NextResponse.json({ error: "Проверьте заполнение формы" }, { status: 400 }); }
}
