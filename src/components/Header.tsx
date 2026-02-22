import { Activity, ShieldCheck, Cctv, Server, Rocket, UsersRound } from "lucide-react";
import Link from "next/link";

export function Header() {
    return (
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">BYTEK<span className="text-zinc-500 font-medium">CORE</span></span>
                </Link>
                <div className="flex items-center gap-6 text-sm font-medium text-zinc-400">
                    <Link href="/" className="hover:text-white transition-colors">Dashboard</Link>
                    <Link href="/clients" className="hover:text-white transition-colors flex items-center gap-2">
                        <UsersRound className="w-4 h-4" />
                        Clientes
                    </Link>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10"></div>
                </div>
            </div>
        </header>
    );
}
