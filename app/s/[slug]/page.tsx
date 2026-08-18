import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SurveyWizard from "./survey-wizard";

export const dynamic = "force-dynamic";
export default async function SurveyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const survey = await prisma.survey.findUnique({ where: { slug }, include: { currentVersion: { include: { sections: { orderBy: { order: "asc" }, include: { questions: { orderBy: { order: "asc" } } } } } } } });
  if (!survey?.currentVersion) notFound();
  const now = new Date();
  const available = survey.status === "PUBLISHED" && (!survey.currentVersion.startsAt || survey.currentVersion.startsAt <= now) && (!survey.currentVersion.endsAt || survey.currentVersion.endsAt >= now);
  if (!available) return <main className="survey-shell"><div className="survey-main"><div className="card question-card"><div className="eyebrow">Process Office Feedback</div><h1>Опрос недоступен</h1><p className="muted">Сбор ответов завершён или опрос ещё не опубликован.</p></div></div></main>;
  const [departments, projects, roles, formats, directions] = await Promise.all([
    prisma.department.findMany({ where: { active: true }, orderBy: { name: "asc" } }), prisma.project.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.respondentRole.findMany({ where: { active: true }, orderBy: { name: "asc" } }), prisma.collaborationFormat.findMany({ where: { active: true }, orderBy: { name: "asc" } }), prisma.processOfficeDirection.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  const data = JSON.parse(JSON.stringify({ survey, departments, projects, roles, formats, directions }));
  return <SurveyWizard data={data} />;
}
