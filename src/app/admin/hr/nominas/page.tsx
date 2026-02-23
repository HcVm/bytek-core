import { Receipt, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GeneradorNominas() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-zinc-950 text-white">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <Receipt className="w-10 h-10" />
                </div>
                <h1 className="text-4xl font-black tracking-tight mb-3 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Motor de Planillas</h1>
                <p className="text-zinc-400 max-w-lg mx-auto mb-10 text-lg leading-relaxed">
                    Módulo de Cálculo Automático de Planillas. La ejecución masiva de Boletas estará habilitada cuando se configuren todos los Perfiles de Contrato.
                </p>
                <Link href="/admin/hr" className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-emerald-500 hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-emerald-500/25">
                    Regresar al Dashboard
                </Link>
            </div>
        </div>
    );
}
