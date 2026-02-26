"use client";

import { LayoutDashboard, Users, UserCog, CalendarClock, Briefcase, Blocks, LayoutList, CheckSquare, GitPullRequest, Workflow, ShieldAlert, FileText, Settings, Rocket, FileCheck2, DatabaseZap, PanelLeftClose, PanelLeftOpen, BarChart3, PackageSearch, UsersRound, Building2, ShoppingCart, Truck, Wrench, Receipt, Package, Box, Layers, Archive, Component, Tags, ListTodo, ShieldCheck, Files, Activity, Network, Compass, LogOut, BookOpen, Calculator, Landmark, Wallet, CreditCard, Scale, PieChart, BadgeDollarSign, CircleDollarSign, FileSpreadsheet, HandCoins, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function AdminSidebar() {
    const { signOut } = useAuthActions();
    const pathname = usePathname();
    const [contabilidadOpen, setContabilidadOpen] = useState(pathname.includes("/contabilidad") || pathname.includes("/finanzas"));

    return (
        <div className="w-64 bg-zinc-950 text-zinc-300 flex flex-col h-screen border-r border-zinc-800">
            <div className="p-6 flex items-center gap-3 border-b border-zinc-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Activity className="w-5 h-5" />
                </div>
                <span className="font-bold text-white tracking-tight">ADMIN CORE</span>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                <div className="pt-2 mb-2">
                    <span className="text-xs font-semibold text-zinc-500 px-3 uppercase tracking-wider">Estructura Organizacional</span>
                </div>
                <Link href="/admin/departamentos" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/departamentos') ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <Network className="w-5 h-5" />
                    <span className="text-sm font-medium">Departamentos (Áreas)</span>
                </Link>
                <Link href="/admin/equipo" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/equipo') ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <UserCog className="w-5 h-5" />
                    <span className="text-sm font-medium">Directorio de Personal</span>
                </Link>
                <Link href="/admin/catalogo" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/catalogo') ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <PackageSearch className="w-5 h-5" />
                    <span className="text-sm font-medium">Catálogo Servicios</span>
                </Link>

                <div className="pt-4 mt-4 border-t border-zinc-900 mb-2">
                    <span className="text-xs font-semibold text-zinc-500 px-3 uppercase tracking-wider">Recursos Humanos</span>
                </div>
                <Link href="/admin/mi-perfil" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/mi-perfil') ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <UserCog className="w-5 h-5" />
                    <span className="text-sm font-medium">Mi Perfil (Self Service)</span>
                </Link>
                <Link href="/admin/hr" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/hr') && !pathname.includes('/mi-perfil') ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <LayoutList className="w-5 h-5" />
                    <span className="text-sm font-medium">Dashboard HR (Admin)</span>
                </Link>

                {/* ==========================================
                    SISTEMA CONTABLE Y FINANCIERO
                ========================================== */}
                <div className="pt-4 mt-4 border-t border-zinc-900 mb-2">
                    <span className="text-xs font-semibold text-amber-500 px-3 uppercase tracking-wider">Sistema Contable</span>
                </div>
                <button
                    onClick={() => setContabilidadOpen(!contabilidadOpen)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-md transition-colors ${pathname.includes('/contabilidad') || pathname.includes('/finanzas')
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'hover:bg-zinc-900 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <Calculator className="w-5 h-5" />
                        <span className="text-sm font-medium">Contabilidad</span>
                    </div>
                    {contabilidadOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {contabilidadOpen && (
                    <div className="ml-4 pl-3 border-l border-zinc-800 space-y-1">
                        <Link href="/admin/contabilidad/plan-cuentas" className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${pathname.includes('/plan-cuentas') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white text-zinc-400'}`}>
                            <BookOpen className="w-4 h-4" />
                            Plan de Cuentas
                        </Link>
                        <Link href="/admin/contabilidad/libro-diario" className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${pathname.includes('/libro-diario') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white text-zinc-400'}`}>
                            <FileSpreadsheet className="w-4 h-4" />
                            Libro Diario
                        </Link>
                        <Link href="/admin/contabilidad/libro-mayor" className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${pathname.includes('/libro-mayor') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white text-zinc-400'}`}>
                            <FileText className="w-4 h-4" />
                            Libro Mayor
                        </Link>
                        <Link href="/admin/contabilidad/tesoreria" className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${pathname.includes('/tesoreria') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white text-zinc-400'}`}>
                            <Landmark className="w-4 h-4" />
                            Tesorería y Bancos
                        </Link>
                        <Link href="/admin/contabilidad/cuentas-cobrar" className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${pathname.includes('/cuentas-cobrar') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white text-zinc-400'}`}>
                            <HandCoins className="w-4 h-4" />
                            Cuentas por Cobrar
                        </Link>
                        <Link href="/admin/contabilidad/cuentas-pagar" className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${pathname.includes('/cuentas-pagar') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white text-zinc-400'}`}>
                            <CreditCard className="w-4 h-4" />
                            Cuentas por Pagar
                        </Link>
                        <Link href="/admin/contabilidad/tributario" className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${pathname.includes('/tributario') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white text-zinc-400'}`}>
                            <Scale className="w-4 h-4" />
                            Obligaciones Tributarias
                        </Link>
                        <Link href="/admin/contabilidad/estados-financieros" className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${pathname.includes('/estados-financieros') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white text-zinc-400'}`}>
                            <PieChart className="w-4 h-4" />
                            Estados Financieros
                        </Link>
                        <Link href="/admin/contabilidad/presupuestos" className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${pathname.includes('/presupuestos') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white text-zinc-400'}`}>
                            <BadgeDollarSign className="w-4 h-4" />
                            Presupuestos
                        </Link>
                        <Link href="/admin/finanzas" className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${pathname.includes('/finanzas') ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-900 hover:text-white text-zinc-400'}`}>
                            <Wallet className="w-4 h-4" />
                            Control de Gastos
                        </Link>
                    </div>
                )}

                <div className="pt-4 mt-4 border-t border-zinc-900 mb-2">
                    <span className="text-xs font-semibold text-zinc-500 px-3 uppercase tracking-wider">Intranet ERP</span>
                </div>
                <Link href="/admin/flujos" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/flujos') ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <LayoutList className="w-5 h-5" />
                    <span className="text-sm font-medium">Flujos y Solicitudes</span>
                </Link>
                <Link href="/admin/documentos" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/documentos') ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <Files className="w-5 h-5" />
                    <span className="text-sm font-medium">Gestión Documental</span>
                </Link>
                <Link href="/admin/legal" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/legal') ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-sm font-medium">Legal & Compliance</span>
                </Link>

                <div className="pt-4 mt-4 border-t border-zinc-900 mb-2">
                    <span className="text-xs font-semibold text-zinc-500 px-3 uppercase tracking-wider">Unidad 2: Desarrollo</span>
                </div>
                <Link href="/dev" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-zinc-900 hover:text-white`}>
                    <Briefcase className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-medium">Dev Center (Jira)</span>
                </Link>

                <div className="pt-4 mt-4 border-t border-zinc-900 mb-2">
                    <span className="text-xs font-semibold text-zinc-500 px-3 uppercase tracking-wider">Logística U3</span>
                </div>
                <Link href="/admin/inventario" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/inventario') ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <Archive className="w-5 h-5" />
                    <span className="text-sm font-medium">Almacén de Hardware</span>
                </Link>
                <Link href="/admin/field-service" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/field-service') ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <Compass className="w-5 h-5" />
                    <span className="text-sm font-medium">Despacho Técnicos</span>
                </Link>

                <div className="pt-4 mt-4 border-t border-zinc-900 mb-2">
                    <span className="text-xs font-semibold text-zinc-500 px-3 uppercase tracking-wider">Enlaces Externos</span>
                </div>
                <Link href="/crm" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-zinc-900 hover:text-white`}>
                    <Briefcase className="w-5 h-5" />
                    <span className="text-sm font-medium">Ir a Ventas (CRM)</span>
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
