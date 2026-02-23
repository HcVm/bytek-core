"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { GitMerge, ListTodo, Layers, ArrowRight, KanbanSquare } from "lucide-react";
import Link from "next/link";

export default function DevDashboardOverview() {
    const allUsers = useQuery(api.users.getAllUsers);
    const userId = allUsers?.[0]?._id;

    const boards = useQuery(api.agile.getBoardsForUser, userId ? { userId } : "skip");
    // const pendingTasks = useQuery(api.agile.getMyPendingTasks, userId ? { userId } : "skip"); // Ideal for a dashboard

    if (boards === undefined) return <div className="p-10 flex items-center justify-center h-full"><span className="animate-pulse text-slate-400 font-semibold tracking-widest text-sm uppercase">Cargando Workspace...</span></div>;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Developer Dashboard</h1>
                <p className="text-slate-500 mt-1">Tu centro de mando para ingeniería de software.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <KanbanSquare className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-1">Tus Pizarras</h2>
                    <p className="text-sm text-slate-500 mb-4 flex-1">Proyectos activos a los que fuiste asignado como desarrollador o líder.</p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                        <span className="text-2xl font-black text-slate-900">{boards.length}</span>
                        <Link href="/dev/pizarras" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                            Ver todas <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col relative overflow-hidden group hover:border-indigo-200 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <ListTodo className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-1">Backlog Review</h2>
                    <p className="text-sm text-slate-500 mb-4 flex-1">Revisa tareas sin sprint asignado y planifica tu capacidad de story points.</p>
                    <div className="mt-auto pt-4 border-t border-slate-100">
                        <Link href="/dev/backlog" className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                            Ir al Backlog Global
                        </Link>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-lg flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="w-12 h-12 bg-white/20 text-white rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner relative z-10">
                        <GitMerge className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold mb-1 relative z-10">Sprints Activos</h2>
                    <p className="text-sm text-blue-100 mb-4 flex-1 relative z-10">Concéntrate en el trabajo atado a iteraciones temporales rígidas.</p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/20 relative z-10">
                        <span className="text-sm bg-white/20 px-2 py-1 rounded text-white font-medium backdrop-blur">Phase 10 Mode</span>
                        <Link href="/dev/sprints" className="text-sm font-bold hover:text-blue-200 flex items-center gap-1 group">
                            Focus Mode <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Layers className="w-5 h-5 text-slate-400" />
                    <h3 className="font-bold text-lg text-slate-800">Actividad Reciente en tus Pizarras</h3>
                </div>
                <div className="space-y-3">
                    {boards.slice(0, 3).map((board: any) => (
                        <div key={board._id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg group transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="font-medium text-slate-700">{board.title}</span>
                            </div>
                            <Link href={`/dev/pizarras/${board._id}`} className="opacity-0 group-hover:opacity-100 text-sm text-blue-600 font-medium transition-opacity">
                                Abrir Tablero
                            </Link>
                        </div>
                    ))}
                    {boards.length === 0 && <p className="text-slate-500 text-sm italic">Sin pizaras asignadas.</p>}
                </div>
            </div>
        </div>
    );
}
