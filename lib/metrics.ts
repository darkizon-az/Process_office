import { METRIC_CODES } from "./constants";

export type MetricAnswer = { code: string | null; value: number | null; notApplicable?: boolean };

const usable = (answers: MetricAnswer[], code: string) =>
  answers.filter((a) => a.code === code && !a.notApplicable && a.value !== null).map((a) => a.value as number);
const avg = (values: number[]) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
const round2 = (v: number | null) => v === null ? null : Math.round(v * 100) / 100;

export function calculateMetrics(responses: MetricAnswer[][]) {
  const all = responses.flat();
  const satisfaction = usable(all, METRIC_CODES.overall);
  const npsValues = usable(all, METRIC_CODES.nps);
  const allScale = all.filter((a) => a.value !== null && !a.notApplicable && a.value >= 1 && a.value <= 5).map((a) => a.value as number);
  const qualityByResponse = responses.map((r) => {
    const e = usable(r, METRIC_CODES.expectations)[0];
    const v = usable(r, METRIC_CODES.value)[0];
    return e === undefined || v === undefined ? null : (e + v) / 2;
  }).filter((v): v is number => v !== null);
  const collaborationByResponse = responses.map((r) => {
    const values = METRIC_CODES.collaboration.flatMap((code) => usable(r, code));
    return values.length >= 3 ? avg(values) : null;
  }).filter((v): v is number => v !== null);
  return {
    responseCount: responses.length,
    csat: satisfaction.length ? Math.round((satisfaction.filter((v) => v >= 4).length / satisfaction.length) * 1000) / 10 : null,
    nps: npsValues.length ? Math.round(((npsValues.filter((v) => v >= 9).length - npsValues.filter((v) => v <= 6).length) / npsValues.length) * 100) : null,
    qualityIndex: round2(avg(qualityByResponse)),
    collaborationIndex: round2(avg(collaborationByResponse)),
    averageOverall: round2(avg(satisfaction)),
    negativeShare: allScale.length ? Math.round((allScale.filter((v) => v <= 2).length / allScale.length) * 1000) / 10 : null,
  };
}
