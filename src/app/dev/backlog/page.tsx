import { ListTodo, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GlobalBacklog() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                <ListTodo className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Backlog Global</h1>
            <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                El Backlog ahora se gestiona internamente por Tablero y Proyecto. Para asignar tareas y refinar historias, ingresa a la Pizarra específica de tu equipo.
            </p>
            <Link href="/dev/pizarras" className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-md">
                <ArrowLeft className="w-4 h-4" /> Volver a Pizarras (Boards)
            </Link>
        </div>
    );
}
