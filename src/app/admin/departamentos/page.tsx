"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Network, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DepartmentFormDialog } from "./DepartmentFormDialog";

export default function DepartamentosPage() {
    const departments = useQuery(api.departments.getAllDepartments);

    if (departments === undefined) {
        return (
            <div className="flex h-[80vh] items-center justify-center text-zinc-400">
                <Network className="w-6 h-6 animate-pulse mr-2" />
                <span>Cargando organigrama...</span>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end border-b border-zinc-200 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Departamentos y Áreas</h1>
                    <p className="text-zinc-500 mt-1">Organigrama corporativo y gerencias de la empresa.</p>
                </div>
                <DepartmentFormDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {departments.map(dept => (
                    <div key={dept._id} className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                                    <Network className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 text-lg">{dept.name}</h3>
                                </div>
                            </div>
                        </div>
                        {dept.description && (
                            <p className="text-sm text-zinc-600 line-clamp-2">{dept.description}</p>
                        )}
                        <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-medium text-zinc-500">
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>Área Activa</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {departments.length === 0 && (
                <div className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-500 w-full mt-8">
                    <Network className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p>No hay departamentos registrados. Construye tu organigrama.</p>
                    <DepartmentFormDialog trigger={<Button variant="outline" className="mt-4">Crear Primer Departamento</Button>} />
                </div>
            )}
        </div>
    );
}
