"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { FileBarChart, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function ReportesIndexPage() {
    const projects = useQuery(api.projects.getProjects);

    if (!projects) return (
        <div className="p-10 flex items-center justify-center h-full">
            <span className="animate-pulse text-slate-400 font-semibold tracking-widest text-sm uppercase">Cargando Proyectos...</span>
        </div>
    );

    const statusColors: Record<string, string> = {
        planning: "bg-amber-100 text-amber-700",
        in_progress: "bg-blue-100 text-blue-700",
        review: "bg-purple-100 text-purple-700",
        completed: "bg-emerald-100 text-emerald-700",
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    <FileBarChart className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /> Reportes Post-Mortem
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 mt-1">Selecciona un proyecto para generar su análisis ejecutivo de métricas y lecciones aprendidas.</p>
            </header>

            {projects.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-16 text-center bg-white dark:bg-zinc-900/50">
                    <FileBarChart className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-zinc-700" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Sin Proyectos</h3>
                    <p className="text-slate-500 dark:text-zinc-400 mt-1">Cuando se creen proyectos desde Oportunidades ganadas, aparecerán aquí para análisis.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {projects.map(project => (
                        <Link
                            key={project._id}
                            href={`/dev/reportes/${project._id}`}
                            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 flex items-center gap-4 hover:border-indigo-300 hover:shadow-md transition-all group block"
                        >
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                                <FileBarChart className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{project.title}</p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{project.clientName}</p>
                            </div>
                            <Badge className={`${statusColors[project.status] || 'bg-slate-100 text-slate-600'} text-[10px] uppercase font-bold border-0 shadow-none`}>
                                {project.status.replace("_", " ")}
                            </Badge>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
