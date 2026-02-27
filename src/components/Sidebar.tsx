"use client";

import { Settings, Users, Briefcase, LayoutDashboard, LogOut, PackageSearch, FileText, FolderKanban, CreditCard, Archive, Compass, UserCog, FileSignature, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { useAuthActions } from "@convex-dev/auth/react";

export default function Sidebar() {
    const { signOut } = useAuthActions();
    const pathname = usePathname();

    return (
        <div className="w-64 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 flex flex-col h-screen border-r border-zinc-200 dark:border-zinc-800">
            <div className="p-6 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Settings className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-white tracking-tight">BYTEK CORE</span>
                </div>
                <ThemeToggle />
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <Link href="/crm" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/crm' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'}`}>
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="text-sm font-medium">Dashboard</span>
                </Link>
                <Link href="/crm/comunicaciones" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/comunicaciones') ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'}`}>
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Comunicaciones</span>
                </Link>
                <Link href="/crm/clientes" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/clientes') ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'}`}>
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">Clientes</span>
                </Link>
                <Link href="/crm/oportunidades" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/oportunidades') ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'}`}>
                    <Compass className="w-5 h-5" />
                    <span className="text-sm font-medium">Pipeline (Oportunidades)</span>
                </Link>
                <Link href="/crm/cotizador" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/cotizador') ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'}`}>
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-medium">Cotizaciones / Proformas</span>
                </Link>
                <Link href="/crm/proyectos" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/proyectos') ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'}`}>
                    <FolderKanban className="w-5 h-5" />
                    <span className="text-sm font-medium">Proyectos / Operaciones</span>
                </Link>
                <Link href="/crm/facturacion" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/facturacion') ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'}`}>
                    <CreditCard className="w-5 h-5" />
                    <span className="text-sm font-medium">Facturación</span>
                </Link>
                <Link href="/admin/contratos" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/contratos') ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'}`}>
                    <FileSignature className="w-5 h-5" />
                    <span className="text-sm font-medium">Contratos</span>
                </Link>
                <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-900 mb-2">
                    <span className="text-xs font-semibold text-zinc-500 px-3 uppercase tracking-wider">Enlaces Externos</span>
                </div>
                <Link href="/admin/inventario" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white`}>
                    <Settings className="w-5 h-5" />
                    <span className="text-sm font-medium">Admin Central</span>
                </Link>
            </nav>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
}
