import { MessageSquareText } from "lucide-react";

export type DashboardMetrics = {
  responseCount: number;
  csat: number | null;
  nps: number | null;
  qualityIndex: number | null;
  collaborationIndex: number | null;
  averageOverall: number | null;
  negativeShare: number | null;
};

export default function MetricCards({ m }: { m: DashboardMetrics }) {
  const cards: [string, React.ReactNode, string][] = [
    ["Ответы", m.responseCount, "валидных"],
    ["CSAT", m.csat === null ? "—" : `${m.csat}%`, "оценки 4–5"],
    ["NPS", m.nps ?? "—", "промоутеры − критики"],
    ["Качество результата", m.qualityIndex ?? "—", "из 5"],
    ["Сотрудничество", m.collaborationIndex ?? "—", "из 5"],
    ["Средняя оценка", m.averageOverall ?? "—", "из 5"],
    ["Доля негатива", m.negativeShare === null ? "—" : `${m.negativeShare}%`, "оценки 1–2"],
    ["Комментарии", <MessageSquareText key="comments" size={26} />, "текстовая обратная связь"],
  ];
  return <div className="metrics">{cards.map(([label, value, note]) => <div className="card metric" key={label}><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-note">{note}</div></div>)}</div>;
}
