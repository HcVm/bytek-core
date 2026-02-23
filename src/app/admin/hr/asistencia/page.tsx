import { Fingerprint, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AsistenciaGlobal() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                <Fingerprint className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Monitor de Asistencia</h1>
            <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                Visualizador en vivo de entradas y salidas biométricas. (Próximamente versión completa con filtros por sede).
            </p>
            <Link href="/admin/hr" className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-md">
                <ArrowLeft className="w-4 h-4" /> Volver a Panel HR
            </Link>
        </div>
    );
}
