"use client";

import { Activity, LogOut, Briefcase, Calculator, BookOpen, FileSpreadsheet, FileText, Landmark, HandCoins, CreditCard, Scale, PieChart, BadgeDollarSign, ArrowRightLeft, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

export default function ContabilidadSidebar() {
    const { signOut } = useAuthActions();
    const pathname = usePathname();

    return (
        <div className="w-64 bg-zinc-950 text-zinc-300 flex flex-col h-screen border-r border-zinc-800 shadow-xl">
            <div className="p-6 flex items-center gap-3 border-b border-zinc-800">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Calculator className="w-5 h-5" />
                </div>
                <span className="font-bold text-white tracking-tight">CONTABILIDAD</span>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                <div className="pt-2 mb-2">
                    <span className="text-xs font-semibold text-zinc-500 px-3 uppercase tracking-wider">Libros Contables</span>
                </div>

                <Link href="/contabilidad/plan-cuentas" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/plan-cuentas') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm font-medium">Plan de Cuentas</span>
                </Link>
                <Link href="/contabilidad/libro-diario" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/libro-diario') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <FileSpreadsheet className="w-5 h-5" />
                    <span className="text-sm font-medium">Libro Diario</span>
                </Link>
                <Link href="/contabilidad/libro-mayor" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/libro-mayor') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-medium">Libro Mayor</span>
                </Link>
                <Link href="/contabilidad/periodos" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/periodos') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <Briefcase className="w-5 h-5" />
                    <span className="text-sm font-medium">Periodos Contables</span>
                </Link>

                <div className="pt-4 mt-4 border-t border-zinc-900 mb-2">
                    <span className="text-xs font-semibold text-zinc-500 px-3 uppercase tracking-wider">Gestión Financiera</span>
                </div>
                <Link href="/contabilidad/tesoreria" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/tesoreria') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <Landmark className="w-5 h-5" />
                    <span className="text-sm font-medium">Tesorería y Bancos</span>
                </Link>
                <Link href="/contabilidad/cuentas-cobrar" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/cuentas-cobrar') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <HandCoins className="w-5 h-5" />
                    <span className="text-sm font-medium">Cuentas por Cobrar</span>
                </Link>
                <Link href="/contabilidad/cuentas-pagar" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/cuentas-pagar') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <CreditCard className="w-5 h-5" />
                    <span className="text-sm font-medium">Cuentas por Pagar</span>
                </Link>

                <div className="pt-4 mt-4 border-t border-zinc-900 mb-2">
                    <span className="text-xs font-semibold text-zinc-500 px-3 uppercase tracking-wider">Reportes & Planning</span>
                </div>
                <Link href="/contabilidad/tributario" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/tributario') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <Scale className="w-5 h-5" />
                    <span className="text-sm font-medium">Oblig. Tributarias</span>
                </Link>
                <Link href="/contabilidad/estados-financieros" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/estados-financieros') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <PieChart className="w-5 h-5" />
                    <span className="text-sm font-medium">Estados Financieros</span>
                </Link>
                <Link href="/contabilidad/presupuestos" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/presupuestos') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <BadgeDollarSign className="w-5 h-5" />
                    <span className="text-sm font-medium">Presupuestos</span>
                </Link>
                <Link href="/contabilidad/tipo-cambio" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/tipo-cambio') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <ArrowRightLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Tipo de Cambio</span>
                </Link>

                <div className="pt-4 mt-4 border-t border-zinc-900 mb-2">
                    <span className="text-xs font-semibold text-zinc-500 px-3 uppercase tracking-wider">Enlaces Externos</span>
                </div>
                <Link href="/admin/inventario" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-zinc-900 hover:text-white`}>
                    <LayoutDashboard className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-400">Ir a Administración</span>
                </Link>
            </nav>

            <div className="p-4 border-t border-zinc-800">
                <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
}
