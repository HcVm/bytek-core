"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { GanttChartSquare, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function GanttPage() {
    const allUsers = useQuery(api.users.getAllUsers);
    const userId = allUsers?.[0]?._id;
    const boards = useQuery(api.agile.getBoardsForUser, userId ? { userId } : "skip");
    const [selectedBoardId, setSelectedBoardId] = useState<Id<"boards"> | null>(null);

    const activeBoardId = selectedBoardId || boards?.[0]?._id || null;
    const ganttTasks = useQuery(api.agile.getTasksForGantt, activeBoardId ? { boardId: activeBoardId } : "skip");

    if (boards === undefined) return <div className="p-10 flex items-center justify-center h-full"><span className="animate-pulse text-slate-400 font-semibold tracking-widest text-sm uppercase">Cargando Gantt...</span></div>;

    // Calcular rango temporal
    const now = Date.now();
    let minDate = now;
    let maxDate = now + 30 * 24 * 60 * 60 * 1000; // +30 días por defecto

    if (ganttTasks && ganttTasks.length > 0) {
        const starts = ganttTasks.map(t => t.startDate!);
        const ends = ganttTasks.map(t => t.dueDate || t.startDate! + 7 * 24 * 60 * 60 * 1000);
        minDate = Math.min(...starts) - 2 * 24 * 60 * 60 * 1000; // 2 días de margen
        maxDate = Math.max(...ends) + 2 * 24 * 60 * 60 * 1000;
    }

    const totalDuration = maxDate - minDate;
    const chartWidth = 900;
    const rowHeight = 44;
    const labelWidth = 260;

    // Generar líneas de semanas
    const weekLines: { x: number; label: string }[] = [];
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    let weekStart = minDate - (minDate % msPerWeek);
    while (weekStart <= maxDate) {
        const x = ((weekStart - minDate) / totalDuration) * chartWidth;
        const d = new Date(weekStart);
        weekLines.push({ x, label: `${d.getDate()}/${d.getMonth() + 1}` });
        weekStart += msPerWeek;
    }

    const getTypeColor = (t: string | undefined) => {
        switch (t) {
            case 'bug': return '#ef4444';
            case 'feature': return '#10b981';
            case 'epic': return '#8b5cf6';
            default: return '#6366f1';
        }
    };

    const getStatusOpacity = (s: string) => {
        switch (s) {
            case 'done': return 0.5;
            case 'review': return 0.8;
            default: return 1;
        }
    };

    return (
        <div className="p-8 max-w-full mx-auto space-y-6 overflow-hidden">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Diagrama Gantt</h1>
                    <p className="text-slate-500 dark:text-zinc-400 mt-1">Visualización cronológica de las tareas del proyecto.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={activeBoardId || ""}
                        onChange={e => setSelectedBoardId(e.target.value as Id<"boards">)}
                    >
                        {boards?.map(b => (
                            <option key={b._id} value={b._id}>{b.title}</option>
                        ))}
                    </select>
                </div>
            </header>

            {!ganttTasks || ganttTasks.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-16 text-center bg-white dark:bg-zinc-900/50">
                    <GanttChartSquare className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-zinc-700" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Sin Tareas Planificadas</h3>
                    <p className="text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                        Asigna fechas de inicio y fin a las tareas del Kanban (desde el detalle de cada tarea) para que aparezcan en el Gantt.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    {/* Leyenda */}
                    <div className="px-6 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-6 bg-slate-50 dark:bg-zinc-900/50">
                        <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400"><span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> Feature</span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400"><span className="w-3 h-3 rounded bg-red-500 inline-block"></span> Bug</span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400"><span className="w-3 h-3 rounded bg-purple-500 inline-block"></span> Epic</span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400"><span className="w-3 h-3 rounded bg-indigo-500 inline-block"></span> Task</span>
                        <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500">
                            <Calendar className="w-3 h-3" /> {ganttTasks.length} tareas planificadas
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <svg width={labelWidth + chartWidth + 40} height={ganttTasks.length * rowHeight + 60} className="block">
                            {/* Header de semanas */}
                            <g transform={`translate(${labelWidth}, 0)`}>
                                {weekLines.map((wl, i) => (
                                    <g key={i}>
                                        <line x1={wl.x} y1={30} x2={wl.x} y2={ganttTasks.length * rowHeight + 40} className="stroke-slate-200 dark:stroke-zinc-800" strokeWidth={1} strokeDasharray="4 4" />
                                        <text x={wl.x + 4} y={20} fontSize={10} className="fill-slate-400 dark:fill-zinc-500" fontFamily="Inter, sans-serif">{wl.label}</text>
                                    </g>
                                ))}
                                {/* Línea de HOY */}
                                {(() => {
                                    const todayX = ((now - minDate) / totalDuration) * chartWidth;
                                    return (
                                        <g>
                                            <line x1={todayX} y1={25} x2={todayX} y2={ganttTasks.length * rowHeight + 40} stroke="#ef4444" strokeWidth={2} />
                                            <text x={todayX + 4} y={20} fontSize={9} fill="#ef4444" fontWeight="bold" fontFamily="Inter, sans-serif">HOY</text>
                                        </g>
                                    );
                                })()}
                            </g>

                            {/* Filas de tareas */}
                            {ganttTasks.map((task, idx) => {
                                const start = task.startDate!;
                                const end = task.dueDate || start + 7 * 24 * 60 * 60 * 1000;
                                const barX = ((start - minDate) / totalDuration) * chartWidth;
                                const barW = Math.max(((end - start) / totalDuration) * chartWidth, 8);
                                const y = 35 + idx * rowHeight;
                                const color = getTypeColor(task.type);
                                const opacity = getStatusOpacity(task.status);

                                return (
                                    <g key={task._id}>
                                        {/* Fondo alterno */}
                                        {idx % 2 === 0 && (
                                            <rect x={0} y={y - 5} width={labelWidth + chartWidth + 40} height={rowHeight} className="fill-slate-50 dark:fill-zinc-900/30" />
                                        )}
                                        {/* Label */}
                                        <text x={12} y={y + 16} fontSize={12} className="fill-slate-900 dark:fill-zinc-100" fontFamily="Inter, sans-serif" fontWeight={task.type === 'epic' ? 700 : 500}>
                                            {task.title.length > 30 ? task.title.substring(0, 30) + '...' : task.title}
                                        </text>
                                        <text x={12} y={y + 30} fontSize={9} className="fill-slate-400 dark:fill-zinc-500" fontFamily="Inter, sans-serif">
                                            {task.assigneeName || "Sin asignar"} · {task.storyPoints || 0} SP
                                        </text>
                                        {/* Barra */}
                                        <g transform={`translate(${labelWidth}, 0)`}>
                                            <rect
                                                x={barX}
                                                y={y + 4}
                                                width={barW}
                                                height={24}
                                                rx={6}
                                                fill={color}
                                                opacity={opacity}
                                            />
                                            {task.status === 'done' && (
                                                <text x={barX + barW / 2} y={y + 20} fontSize={9} fill="white" textAnchor="middle" fontWeight="bold">✓</text>
                                            )}
                                        </g>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}
