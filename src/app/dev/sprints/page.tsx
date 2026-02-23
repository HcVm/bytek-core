import { GitMerge, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GlobalSprints() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-zinc-950 text-white">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-6 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                    <GitMerge className="w-10 h-10" />
                </div>
                <h1 className="text-4xl font-black tracking-tight mb-3 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Centro de Sprints</h1>
                <p className="text-zinc-400 max-w-lg mx-auto mb-10 text-lg leading-relaxed">
                    Las iteraciones temporales (Sprints) están activas en el Backend Ágil. La UI de arrastrar Sprints se habilitará en la próxima actualización del motor de BYTEK CORE.
                </p>
                <Link href="/dev/pizarras" className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-indigo-500 hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-indigo-500/25">
                    Ir a Mis Tableros Activos
                </Link>
            </div>
        </div>
    );
}
