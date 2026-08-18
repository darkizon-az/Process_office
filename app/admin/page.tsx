import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { analyticsData } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import AnalyticsCharts from "@/components/analytics-charts";
import MetricCards from "@/components/metric-cards";

export default async function Overview(){const {metrics,trend,responses}=await analyticsData();const surveys=await prisma.survey.findMany({orderBy:{updatedAt:"desc"},take:4,include:{_count:{select:{responses:true}}}});const distribution=[1,2,3,4,5].map(rating=>({rating:String(rating),count:responses.filter(r=>r.answers.some(a=>a.questionCodeSnapshot==="OVERALL_SATISFACTION"&&a.numericValue===rating)).length}));return <><div className="page-title"><div><h1>Обзор</h1><p className="muted">Ключевые результаты по всем действующим опросам</p></div><Link className="button" href="/admin/analytics">Открыть аналитику <ArrowRight size={17}/></Link></div><MetricCards m={metrics}/><AnalyticsCharts trend={trend} distribution={distribution}/><section className="card" style={{marginTop:16,padding:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={{margin:0}}>Последние опросы</h3><Link className="hint" href="/admin/surveys">Все опросы →</Link></div><table className="data-table" style={{marginTop:12}}><tbody>{surveys.map(s=><tr key={s.id}><td><b>{s.title}</b><div className="hint">/{s.slug}</div></td><td><span className={`pill ${s.status.toLowerCase()}`}>{s.status}</span></td><td>{s._count.responses} ответов</td></tr>)}</tbody></table></section></>}
