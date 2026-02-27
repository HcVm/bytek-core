"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MapPin, Route, Wrench, CheckCircle2 } from "lucide-react";
import { InterventionCard } from "./InterventionCard";

export default function TechnicianHome() {
    // Para simplificar sin auth forzada, listamos todas como si este dispositivo 
    // estuviera logueado. En prod se le pasa role="technician" y su Id.
    const interventions = useQuery(api.fieldService.getInterventions, {}) || [];

    // Ordenar: Scheduled primero, luego En Route/Working, al final Completed.
    const sorted = [...interventions].sort((a, b) => {
        const priority: Record<string, number> = { scheduled: 1, en_route: 2, working: 3, completed: 4 };
        return priority[a.status] - priority[b.status];
    });

    const activeInterventions = sorted.filter(i => i.status !== 'completed');
    const pastInterventions = sorted.filter(i => i.status === 'completed');

    return (
        <div className="p-4 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Mi Ruta de Hoy</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Control de visitas, instalaciones y mantenimientos.</p>
            </div>

            <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                    <Route className="w-4 h-4" /> Despachos Activos
                </h2>
                {activeInterventions.length > 0 ? (
                    activeInterventions.map(op => (
                        <InterventionCard key={op._id} intervention={op as any} />
                    ))
                ) : (
                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center">
                        <Wrench className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay intervenciones programadas por el momento.</p>
                    </div>
                )}
            </div>

            {pastInterventions.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-sm font-semibold uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Historial Reciente
                    </h2>
                    <div className="opacity-70 dark:opacity-50">
                        {pastInterventions.map(op => (
                            <InterventionCard key={op._id} intervention={op as any} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
