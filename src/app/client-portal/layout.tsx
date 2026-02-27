import { Cctv, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ClientPortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 flex flex-col">
            {/* Navbar corporativo y limpio para el cliente exterior */}
            <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-md border border-indigo-100 dark:border-indigo-400/20">
                        <Cctv className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg leading-none tracking-tight text-zinc-900 dark:text-white">BYTEK CORE</span>
                        <span className="text-[10px] uppercase text-zinc-500 dark:text-zinc-400 font-semibold tracking-wider">Portal Cliente</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/client-portal">
                        <Button variant="ghost" size="sm" className="text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50">
                            <LogOut className="w-4 h-4 mr-2" /> Salir
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Zona de contenido dinámico (Dashboard del Cliente específico) */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>

            {/* Footer simple */}
            <footer className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                Powered by BYTEK S.A.C.S. &copy; {new Date().getFullYear()} — Infraestructura Transparente.
            </footer>
        </div>
    );
}
