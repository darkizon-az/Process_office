import { z } from "zod";

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(128) });
export const surveyResponseSchema = z.object({
  surveyId: z.string().min(1), surveyVersionId: z.string().min(1), idempotencyKey: z.string().uuid(),
  anonymityMode: z.enum(["ANONYMOUS", "IDENTIFIED"]),
  respondentName: z.string().trim().max(100).optional(), respondentEmail: z.string().email().max(150).optional(),
  contactConsent: z.boolean().default(false), departmentId: z.string().min(1), projectId: z.string().min(1),
  roleId: z.string().min(1), formatId: z.string().min(1), directionIds: z.array(z.string()).min(1).max(10),
  interactionStart: z.string().date(), interactionEnd: z.string().date(),
  answers: z.array(z.object({ questionId: z.string(), numericValue: z.number().min(0).max(10).nullable().optional(), textValue: z.string().max(2000).nullable().optional(), notApplicable: z.boolean().optional() })).max(100),
}).superRefine((data, ctx) => {
  if (data.anonymityMode === "IDENTIFIED" && (!data.respondentName || !data.respondentEmail)) ctx.addIssue({ code: "custom", message: "Укажите имя и рабочий email" });
  if (data.anonymityMode === "ANONYMOUS" && (data.respondentName || data.respondentEmail)) ctx.addIssue({ code: "custom", message: "Анонимный ответ не может содержать контактные данные" });
  if (data.interactionStart > data.interactionEnd) ctx.addIssue({ code: "custom", message: "Дата начала должна быть раньше даты окончания" });
});

export const filterSchema = z.object({ surveyId: z.string().optional(), versionId: z.string().optional(), departmentId: z.string().optional(), projectId: z.string().optional(), formatId: z.string().optional(), roleId: z.string().optional(), directionId: z.string().optional(), anonymityMode: z.enum(["ANONYMOUS", "IDENTIFIED"]).optional(), from: z.string().date().optional(), to: z.string().date().optional() });

export const safeCell = (value: unknown) => { const text = String(value ?? ""); return /^[=+\-@]/.test(text) ? `'${text}` : text; };
