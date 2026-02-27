"use client";

import { LayoutDashboard, KanbanSquare, GitMerge, FileCode2, LogOut, Settings, ListTodo, GanttChartSquare, ShieldAlert, FileBarChart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { ThemeToggle } from "../ThemeToggle";

export function DevSidebar() {
    const { signOut } = useAuthActions();
    const pathname = usePathname();

    return (
        <div className="w-64 bg-slate-950 text-slate-300 flex flex-col h-screen border-r border-slate-800 font-sans">
            <div className="p-6 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <FileCode2 className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-bold text-white tracking-tight leading-none block">BYTEK DEV</span>
                        <span className="text-[10px] text-blue-400 font-medium uppercase tracking-widest block mt-0.5">Engineering Workspace</span>
                    </div>
                </div>
                <ThemeToggle />
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="pt-2 mb-2 mt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Main</span>
                </div>
                <Link href="/dev" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${pathname === '/dev' ? 'bg-blue-500/15 text-blue-400 font-medium border border-blue-500/20' : 'hover:bg-slate-900 hover:text-white'}`}>
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-sm">Dev Dashboard</span>
                </Link>
                <Link href="/dev/pizarras" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${pathname.includes('/dev/pizarras') ? 'bg-blue-500/15 text-blue-400 font-medium border border-blue-500/20' : 'hover:bg-slate-900 hover:text-white'}`}>
                    <KanbanSquare className="w-4 h-4" />
                    <span className="text-sm">Tableros de Proyecto</span>
                </Link>

                <div className="pt-4 mb-2 mt-4 border-t border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Agile & Sprints</span>
                </div>
                <Link href="/dev/backlog" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${pathname.includes('/dev/backlog') ? 'bg-blue-500/15 text-blue-400 font-medium border border-blue-500/20' : 'hover:bg-slate-900 hover:text-white'}`}>
                    <ListTodo className="w-4 h-4" />
                    <span className="text-sm">Backlog Global</span>
                </Link>
                <Link href="/dev/sprints" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${pathname.includes('/dev/sprints') ? 'bg-blue-500/15 text-blue-400 font-medium border border-blue-500/20' : 'hover:bg-slate-900 hover:text-white'}`}>
                    <GitMerge className="w-4 h-4" />
                    <span className="text-sm">Active Sprints</span>
                </Link>

                <div className="pt-4 mb-2 mt-4 border-t border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Planificación Estratégica</span>
                </div>
                <Link href="/dev/gantt" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${pathname.includes('/dev/gantt') ? 'bg-blue-500/15 text-blue-400 font-medium border border-blue-500/20' : 'hover:bg-slate-900 hover:text-white'}`}>
                    <GanttChartSquare className="w-4 h-4" />
                    <span className="text-sm">Diagrama Gantt</span>
                </Link>
                <Link href="/dev/riesgos" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${pathname.includes('/dev/riesgos') ? 'bg-blue-500/15 text-blue-400 font-medium border border-blue-500/20' : 'hover:bg-slate-900 hover:text-white'}`}>
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-sm">Registro de Riesgos</span>
                </Link>
                <Link href="/dev/reportes" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${pathname.includes('/dev/reportes') ? 'bg-blue-500/15 text-blue-400 font-medium border border-blue-500/20' : 'hover:bg-slate-900 hover:text-white'}`}>
                    <FileBarChart className="w-4 h-4" />
                    <span className="text-sm">Reportes Post-Mortem</span>
                </Link>

                <div className="pt-4 mb-2 mt-4 border-t border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Settings</span>
                </div>
                <Link href="/admin/flujos" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all hover:bg-slate-900 hover:text-white group`}>
                    <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                    <span className="text-sm">Volver al Admin Core</span>
                    <span className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Esc</span>
                </Link>
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-red-500/10 hover:text-red-400 text-slate-400"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
}
