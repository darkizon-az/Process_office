export const METRIC_CODES = {
  overall: "OVERALL_SATISFACTION",
  expectations: "EXPECTATIONS_MATCH",
  value: "PRACTICAL_VALUE",
  reuse: "REUSE_INTENT",
  nps: "NPS",
  collaboration: [
    "COLLABORATION_UNDERSTANDING", "COLLABORATION_PROFESSIONALISM",
    "COLLABORATION_COMMUNICATION", "COLLABORATION_AVAILABILITY",
    "COLLABORATION_AGREEMENTS", "COLLABORATION_DEADLINES",
    "COLLABORATION_TRANSPARENCY", "COLLABORATION_INVOLVEMENT",
    "COLLABORATION_SUPPORT",
  ],
} as const;

export const DIRECTION_METRICS = [
  ["RESULT_QUALITY", "Качество результата"],
  ["MATERIAL_CLARITY", "Понятность материалов"],
  ["USEFULNESS", "Полезность"],
  ["TIMELINESS", "Своевременность"],
  ["APPLICABILITY", "Применимость рекомендаций"],
] as const;

export const MIN_SAMPLE = Number(process.env.ANALYTICS_MIN_SAMPLE ?? 5);
export const ANONYMOUS_COMMENT_MIN = Number(process.env.ANONYMOUS_COMMENT_MIN ?? 3);
