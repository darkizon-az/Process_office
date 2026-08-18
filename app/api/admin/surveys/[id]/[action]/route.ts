import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ id: string; action: string }> }) {
  try {
    const user = await requireAdminApi();
    const { id, action } = await params;
    const survey = await prisma.survey.findUnique({ where: { id }, include: { currentVersion: { include: { sections: { include: { questions: { include: { options: true } } } } } } } });
    if (!survey) return NextResponse.json({ error: "Опрос не найден" }, { status: 404 });
    let resultId = survey.id;
    if (action === "publish") {
      if (survey.status !== "DRAFT") throw new Error("Опубликовать можно только черновик");
      await prisma.survey.update({ where: { id }, data: { status: "PUBLISHED", currentVersion: { update: { publishedAt: new Date(), startsAt: new Date(), endsAt: new Date(Date.now() + 365 * 86400000) } } } });
    } else if (action === "close") {
      if (survey.status !== "PUBLISHED") throw new Error("Закрыть можно только опубликованный опрос");
      await prisma.survey.update({ where: { id }, data: { status: "CLOSED" } });
    } else if (action === "archive") {
      if (survey.status !== "CLOSED") throw new Error("Архивировать можно только закрытый опрос");
      await prisma.$transaction(async (tx) => { await tx.archiveRecord.upsert({ where: { surveyId: id }, create: { surveyId: id, archivedBy: user.id }, update: { archivedAt: new Date(), archivedBy: user.id, restoredAt: null } }); await tx.survey.update({ where: { id }, data: { status: "ARCHIVED" } }); });
    } else if (action === "restore") {
      if (survey.status !== "ARCHIVED") throw new Error("Восстановить можно только архивный опрос");
      await prisma.$transaction(async (tx) => { await tx.archiveRecord.update({ where: { surveyId: id }, data: { restoredAt: new Date() } }); await tx.survey.update({ where: { id }, data: { status: "CLOSED" } }); });
    } else if (action === "copy") {
      if (!survey.currentVersion) throw new Error("Нет версии");
      const copy = await prisma.survey.create({ data: { title: `${survey.title} — копия`, slug: `${survey.slug}-copy-${Date.now()}`, status: "DRAFT", versions: { create: { version: 1, anonymityMode: survey.currentVersion.anonymityMode, sections: { create: survey.currentVersion.sections.map((s) => ({ title: s.title, description: s.description, order: s.order, questions: { create: s.questions.map((q) => ({ analyticsCode: q.analyticsCode, text: q.text, type: q.type, required: q.required, order: q.order, helpText: q.helpText, conditionJson: q.conditionJson, options: { create: q.options.map((o) => ({ value: o.value, label: o.label, order: o.order })) } })) } })) } } } }, include: { versions: true } });
      await prisma.survey.update({ where: { id: copy.id }, data: { currentVersionId: copy.versions[0].id } }); resultId = copy.id;
    } else if (action === "version") {
      if (!survey.currentVersion) throw new Error("Нет версии");
      const max = await prisma.surveyVersion.aggregate({ where: { surveyId: id }, _max: { version: true } });
      const version = await prisma.surveyVersion.create({ data: { surveyId: id, version: (max._max.version ?? 0) + 1, anonymityMode: survey.currentVersion.anonymityMode, sections: { create: survey.currentVersion.sections.map((s) => ({ title: s.title, description: s.description, order: s.order, questions: { create: s.questions.map((q) => ({ analyticsCode: q.analyticsCode, text: q.text, type: q.type, required: q.required, order: q.order, helpText: q.helpText, conditionJson: q.conditionJson, options: { create: q.options.map((o) => ({ value: o.value, label: o.label, order: o.order })) } })) } })) } } });
      await prisma.survey.update({ where: { id }, data: { currentVersionId: version.id, status: "DRAFT" } });
    } else return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
    await prisma.auditLog.create({ data: { userId: user.id, action: `SURVEY_${action.toUpperCase()}`, entityType: "SURVEY", entityId: resultId } });
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Ошибка" }, { status: (error as Error).message === "UNAUTHORIZED" ? 401 : 400 }); }
}
