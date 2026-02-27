"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft, TrendingUp, DollarSign, Target, ShieldCheck, Bug,
    Gauge, Clock, BarChart3, CheckCircle2, AlertTriangle, Zap, FileBarChart
} from "lucide-react";

export default function ProjectReportPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as Id<"projects">;

    const report = useQuery(api.reports.generateProjectReport, { projectId });

    if (!report) return (
        <div className="p-10 flex items-center justify-center h-full">
            <span className="animate-pulse text-slate-400 dark:text-zinc-500 font-semibold tracking-widest text-sm uppercase">
                Generando Reporte Post-Mortem...
            </span>
        </div>
    );

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600";
        if (score >= 60) return "text-amber-600";
        return "text-red-600";
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50";
        if (score >= 60) return "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50";
        return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50";
    };

    const getVarianceLabel = (v: number) => {
        if (v > 5) return { label: "Sobre Presupuesto", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30" };
        if (v < -5) return { label: "Bajo Presupuesto", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" };
        return { label: "En Rango", color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30" };
    };

    const variance = getVarianceLabel(report.financial.budgetVariance);

    // Overall Health Score (promedio ponderado de las métricas disponibles)
    const scores: number[] = [];
    scores.push(report.delivery.taskCompletionRate);
    scores.push(report.delivery.spCompletionRate);
    scores.push(report.milestones.completionRate);
    if (report.delivery.scheduleAdherence !== null) scores.push(report.delivery.scheduleAdherence);
    scores.push(report.risks.resolutionRate);
    scores.push(100 - report.quality.bugRate); // Inverso: menos bugs = mejor
    const healthScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 pb-20">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white -ml-4 mb-2" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                    </Button>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <FileBarChart className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        Reporte Post-Mortem
                    </h1>
                    <p className="text-slate-500 dark:text-zinc-400 mt-1">
                        {report.project.title} · Cliente: <span className="font-semibold text-slate-700 dark:text-zinc-300">{report.project.clientName}</span>
                    </p>
                </div>
                <Badge className={`${report.project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} text-xs uppercase font-bold border-0 px-3 py-1`}>
                    {report.project.status.replace("_", " ")}
                </Badge>
            </div>

            {/* HEALTH SCORE */}
            <div className={`border rounded-2xl p-6 flex items-center gap-6 ${getScoreBg(healthScore)}`}>
                <div className={`text-5xl font-black ${getScoreColor(healthScore)}`}>{healthScore}</div>
                <div>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white">Índice de Salud del Proyecto</h2>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Promedio ponderado de: Entrega de Tareas, Story Points, Hitos, Cumplimiento de Plazos, Resolución de Riesgos y Calidad.</p>
                </div>
                <Gauge className={`w-12 h-12 ml-auto ${getScoreColor(healthScore)}`} />
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} label="Tareas Completadas" value={`${report.delivery.completedTasks} / ${report.delivery.totalTasks}`} sub={`${report.delivery.taskCompletionRate}%`} />
                <KpiCard icon={<Zap className="w-5 h-5 text-indigo-600" />} label="Story Points" value={`${report.delivery.completedSP} / ${report.delivery.totalSP}`} sub={`${report.delivery.spCompletionRate}%`} />
                <KpiCard icon={<TrendingUp className="w-5 h-5 text-blue-600" />} label="Velocidad Promedio" value={`${report.delivery.avgVelocity} SP/sprint`} sub={`${report.sprints.closed} sprints cerrados`} />
                <KpiCard icon={<Clock className="w-5 h-5 text-amber-600" />} label="Cumplimiento Plazos" value={report.delivery.scheduleAdherence !== null ? `${report.delivery.scheduleAdherence}%` : "N/D"} sub={`${report.delivery.onTimeTasks} a tiempo · ${report.delivery.lateTasks} tarde`} />
            </div>

            {/* SECCIONES DETALLADAS EN 2 COLUMNAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* FINANZAS */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="font-bold text-sm text-slate-700 dark:text-zinc-300">Rendimiento Financiero</h3>
                    </div>
                    <div className="p-5 space-y-4">
                        <MetricRow label="Valor Estimado" value={`S/ ${report.financial.estimatedValue.toLocaleString()}`} />
                        <MetricRow label="Total Facturado" value={`S/ ${report.financial.totalInvoiced.toLocaleString()}`} />
                        <MetricRow label="Total Cobrado" value={`S/ ${report.financial.totalPaid.toLocaleString()}`} highlight />
                        <MetricRow label="Pendiente de Cobro" value={`S/ ${report.financial.pendingPayment.toLocaleString()}`} />
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <span className="text-sm text-slate-600 dark:text-zinc-400">Variación Presupuestal</span>
                            <Badge className={`${variance.color} text-xs font-bold border-0 shadow-none`}>
                                {report.financial.budgetVariance > 0 ? "+" : ""}{report.financial.budgetVariance}% · {variance.label}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* CALIDAD */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 flex items-center gap-2">
                        <Bug className="w-4 h-4 text-red-500 dark:text-red-400" />
                        <h3 className="font-bold text-sm text-slate-700 dark:text-zinc-300">Calidad y Distribución</h3>
                    </div>
                    <div className="p-5 space-y-4">
                        <MetricRow label="Tasa de Bugs" value={`${report.quality.bugRate}%`} warn={report.quality.bugRate > 20} />
                        <div className="grid grid-cols-4 gap-2 pt-2">
                            <MiniStat label="Features" count={report.quality.typeBreakdown.features} color="bg-emerald-100 text-emerald-700" />
                            <MiniStat label="Bugs" count={report.quality.typeBreakdown.bugs} color="bg-red-100 text-red-700" />
                            <MiniStat label="Epics" count={report.quality.typeBreakdown.epics} color="bg-purple-100 text-purple-700" />
                            <MiniStat label="Tasks" count={report.quality.typeBreakdown.tasks} color="bg-blue-100 text-blue-700" />
                        </div>
                        <div className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase mt-3">Distribución por Prioridad</div>
                        <div className="flex gap-2">
                            <PriorityBar label="Low" count={report.quality.priorityBreakdown.low} total={report.delivery.totalTasks} color="bg-slate-300" />
                            <PriorityBar label="Med" count={report.quality.priorityBreakdown.medium} total={report.delivery.totalTasks} color="bg-yellow-400" />
                            <PriorityBar label="High" count={report.quality.priorityBreakdown.high} total={report.delivery.totalTasks} color="bg-orange-500" />
                            <PriorityBar label="Urg" count={report.quality.priorityBreakdown.urgent} total={report.delivery.totalTasks} color="bg-red-500" />
                        </div>
                    </div>
                </div>

                {/* RIESGOS */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h3 className="font-bold text-sm text-slate-700 dark:text-zinc-300">Gestión de Riesgos</h3>
                    </div>
                    <div className="p-5 space-y-4">
                        <MetricRow label="Total Riesgos Identificados" value={report.risks.total.toString()} />
                        <MetricRow label="Resueltos" value={report.risks.resolved.toString()} highlight />
                        <MetricRow label="En Mitigación" value={report.risks.mitigating.toString()} />
                        <MetricRow label="Aceptados" value={report.risks.accepted.toString()} />
                        <MetricRow label="Críticos" value={report.risks.critical.toString()} warn={report.risks.critical > 0} />
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <span className="text-sm text-slate-600 dark:text-zinc-400">Tasa de Resolución</span>
                            <span className={`text-sm font-bold ${report.risks.resolutionRate >= 80 ? 'text-emerald-600' : report.risks.resolutionRate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{report.risks.resolutionRate}%</span>
                        </div>
                    </div>
                </div>

                {/* HITOS */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="font-bold text-sm text-slate-700 dark:text-zinc-300">Hitos y Sprints</h3>
                    </div>
                    <div className="p-5 space-y-4">
                        <MetricRow label="Hitos Completados" value={`${report.milestones.completed} / ${report.milestones.total}`} />
                        <MetricRow label="Hitos Pagados" value={`${report.milestones.paid} / ${report.milestones.total}`} />
                        <MetricRow label="Sprints Cerrados" value={`${report.sprints.closed} / ${report.sprints.total}`} />
                        <MetricRow label="Sprints Activos" value={report.sprints.active.toString()} />
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <span className="text-sm text-slate-600 dark:text-zinc-400">Tasa de Completitud</span>
                            <span className={`text-sm font-bold ${report.milestones.completionRate >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{report.milestones.completionRate}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ESTADO DEL PIPELINE */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
                    <h3 className="font-bold text-sm text-slate-700 dark:text-zinc-300">Pipeline de Tareas</h3>
                </div>
                <div className="p-5">
                    <div className="flex rounded-lg overflow-hidden h-10 bg-slate-100 dark:bg-zinc-800">
                        {report.delivery.totalTasks > 0 && (
                            <>
                                <div style={{ width: `${(report.quality.statusBreakdown.done / report.delivery.totalTasks) * 100}%` }} className="bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold transition-all">
                                    {report.quality.statusBreakdown.done > 0 && `Done (${report.quality.statusBreakdown.done})`}
                                </div>
                                <div style={{ width: `${(report.quality.statusBreakdown.review / report.delivery.totalTasks) * 100}%` }} className="bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold transition-all">
                                    {report.quality.statusBreakdown.review > 0 && `Review (${report.quality.statusBreakdown.review})`}
                                </div>
                                <div style={{ width: `${(report.quality.statusBreakdown.in_progress / report.delivery.totalTasks) * 100}%` }} className="bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold transition-all">
                                    {report.quality.statusBreakdown.in_progress > 0 && `WIP (${report.quality.statusBreakdown.in_progress})`}
                                </div>
                                <div style={{ width: `${(report.quality.statusBreakdown.todo / report.delivery.totalTasks) * 100}%` }} className="bg-slate-300 flex items-center justify-center text-slate-600 text-[10px] font-bold transition-all">
                                    {report.quality.statusBreakdown.todo > 0 && `To Do (${report.quality.statusBreakdown.todo})`}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* LECCIONES APRENDIDAS */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-6">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" /> Puntos de Mejora (Auto-Generados)
                </h3>
                <div className="space-y-3">
                    {report.quality.bugRate > 15 && (
                        <InsightCard type="warn" text={`La tasa de bugs es ${report.quality.bugRate}% — considerar implementar revisiones de código más rigurosas y TDD.`} />
                    )}
                    {report.delivery.scheduleAdherence !== null && report.delivery.scheduleAdherence < 70 && (
                        <InsightCard type="warn" text={`Solo ${report.delivery.scheduleAdherence}% de las tareas se entregaron a tiempo — revisar la estimación de Story Points y la capacidad del equipo.`} />
                    )}
                    {report.risks.critical > 0 && report.risks.resolutionRate < 80 && (
                        <InsightCard type="danger" text={`Existen ${report.risks.critical} riesgos críticos con solo ${report.risks.resolutionRate}% de tasa de resolución — priorizar la mitigación proactiva en futuros proyectos.`} />
                    )}
                    {report.financial.budgetVariance > 10 && (
                        <InsightCard type="warn" text={`El proyecto excedió el presupuesto en ${report.financial.budgetVariance}% — mejorar la precisión de las cotizaciones iniciales.`} />
                    )}
                    {report.delivery.avgVelocity > 0 && report.delivery.avgVelocity < 10 && (
                        <InsightCard type="info" text={`Velocidad promedio de ${report.delivery.avgVelocity} SP/sprint — considerar sprints más cortos o redistributir la carga.`} />
                    )}
                    {report.milestones.completionRate === 100 && report.quality.bugRate <= 15 && (
                        <InsightCard type="success" text="Todos los hitos se completaron con una tasa de bugs controlada. ¡Excelente ejecución!" />
                    )}
                    {report.delivery.taskCompletionRate === 100 && (
                        <InsightCard type="success" text="100% de las tareas completadas. El alcance fue gestionado exitosamente." />
                    )}
                    {report.quality.bugRate <= 15 && report.delivery.taskCompletionRate >= 90 && report.risks.resolutionRate >= 70 && (
                        <InsightCard type="success" text="El proyecto muestra métricas saludables en todas las dimensiones. Documentar las prácticas usadas como plantilla para futuros proyectos." />
                    )}
                </div>
            </div>

            <p className="text-center text-xs text-slate-400 dark:text-zinc-500">Reporte generado el {new Date(report.generatedAt).toLocaleString('es-PE')}</p>
        </div>
    );
}

// ========== SUB-COMPONENTES ==========

function KpiCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase">{label}</span></div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{sub}</p>
        </div>
    );
}

function MetricRow({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-zinc-400">{label}</span>
            <span className={`text-sm font-bold ${warn ? 'text-red-600 dark:text-red-400' : highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-zinc-200'}`}>{value}</span>
        </div>
    );
}

function MiniStat({ label, count, color }: { label: string; count: number; color: string }) {
    return (
        <div className={`${color} dark:opacity-80 rounded-lg p-2 text-center`}>
            <p className="text-lg font-black">{count}</p>
            <p className="text-[10px] uppercase font-bold">{label}</p>
        </div>
    );
}

function PriorityBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex-1">
            <div className="h-5 bg-slate-100 dark:bg-zinc-800 rounded overflow-hidden">
                <div className={`${color} dark:opacity-80 h-full rounded transition-all`} style={{ width: `${pct}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-1">{label} ({count})</p>
        </div>
    );
}

function InsightCard({ type, text }: { type: "warn" | "danger" | "info" | "success"; text: string }) {
    const styles: Record<string, string> = {
        warn: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200",
        danger: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-200",
        info: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-200",
        success: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200",
    };
    const icons: Record<string, string> = { warn: "⚠️", danger: "🔴", info: "💡", success: "✅" };
    return (
        <div className={`${styles[type]} border rounded-lg px-4 py-3 text-sm flex items-start gap-2`}>
            <span className="shrink-0">{icons[type]}</span>
            <span>{text}</span>
        </div>
    );
}
