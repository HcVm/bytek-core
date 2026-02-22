"use client";

import { Settings, Users, Briefcase, LayoutDashboard, LogOut, PackageSearch, FileText, FolderKanban, CreditCard, Archive, Compass } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

export default function Sidebar() {
    const { signOut } = useAuthActions();
    const pathname = usePathname();

    return (
        <div className="w-64 bg-zinc-950 text-zinc-300 flex flex-col h-screen border-r border-zinc-800">
            <div className="p-6 flex items-center gap-3 border-b border-zinc-800">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Settings className="w-5 h-5" />
                </div>
                <span className="font-bold text-white tracking-tight">BYTEK CORE</span>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <Link href="/crm" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/crm' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="text-sm font-medium">Dashboard</span>
                </Link>
                <Link href="/crm/proyectos" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/proyectos') ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <FolderKanban className="w-5 h-5" />
                    <span className="text-sm font-medium">Proyectos / Operaciones</span>
                </Link>
                <Link href="/crm/facturacion" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/facturacion') ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <CreditCard className="w-5 h-5" />
                    <span className="text-sm font-medium">Facturación</span>
                </Link>
                <Link href="/crm/catalogo" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/catalogo') ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <PackageSearch className="w-5 h-5" />
                    <span className="text-sm font-medium">Catálogo Servicios</span>
                </Link>
                <Link href="/crm/clientes" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/clientes') ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">Directorio Clientes</span>
                </Link>
                <Link href="/crm/oportunidades" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/oportunidades') ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <Briefcase className="w-5 h-5" />
                    <span className="text-sm font-medium">Oportunidades</span>
                </Link>
                <Link href="/crm/cotizador" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/cotizador') ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-medium">Cotizador Rápido</span>
                </Link>

                <div className="pt-4 mt-4 border-t border-zinc-900 mb-2">
                    <span className="text-xs font-semibold text-zinc-500 px-3 uppercase tracking-wider">Operaciones & Finanzas</span>
                </div>
                <Link href="/crm/inventario" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/inventario') ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <Archive className="w-5 h-5" />
                    <span className="text-sm font-medium">Almacén de Hardware</span>
                </Link>
                <Link href="/crm/field-service" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/field-service') ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-zinc-900 hover:text-white'}`}>
                    <Compass className="w-5 h-5" />
                    <span className="text-sm font-medium">Despacho Técnicos</span>
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
