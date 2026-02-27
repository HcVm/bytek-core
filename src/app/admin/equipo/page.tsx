"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { UserCog, Mail, ShieldCheck, User, Briefcase, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserFormDialog } from "./UserFormDialog";
import { EmployeeProfileDialog } from "./EmployeeProfileDialog";

export default function EquipoPage() {
    const users = useQuery(api.users.getAllUsers);
    const departments = useQuery(api.departments.getAllDepartments);

    if (users === undefined || departments === undefined) {
        return (
            <div className="flex h-[80vh] items-center justify-center text-zinc-400 dark:text-zinc-600">
                <UserCog className="w-6 h-6 animate-pulse mr-2" />
                <span>Cargando directorio del personal...</span>
            </div>
        );
    }

    const roleColors: Record<string, string> = {
        admin: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-900/50",
        sales: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900/50",
        technician: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
        developer: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50",
        client: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/50"
    };

    const roleLabels: Record<string, string> = {
        admin: "Administrador General",
        sales: "Ejecutivo Ventas (U1)",
        technician: "Técnico Field Service (U3)",
        developer: "Ingeniero Software (U2)",
        client: "Portal Cliente"
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            {/* Cabecera */}
            <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Gestión de Equipo</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Directorio de colaboradores y roles de sistema.</p>
                </div>
                <UserFormDialog />
            </div>

            {/* Listado */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {users.map(u => (
                    <div key={u._id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 dark:text-white text-sm">{u.name || "Usuario Sin Nombre"}</h3>
                                    <div className="flex items-center text-xs text-zinc-500 mt-0.5">
                                        <Mail className="w-3 h-3 mr-1" />
                                        {u.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-950 rounded-md p-3 text-xs text-zinc-600 dark:text-zinc-300 mt-2 space-y-2 border border-zinc-100 dark:border-zinc-800/50">
                            <div className="flex items-center gap-2">
                                <Building className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                                <span className="font-medium">
                                    {departments.find(d => d._id === u.departmentId)?.name || "Sin Departamento Base"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                                <span>{u.position || "Cargo no especificado"}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-2 border-t dark:border-zinc-800 pt-3 pb-2">
                            <Badge variant="outline" className={`text-xs ${roleColors[u.role || "client"]}`}>
                                {roleLabels[u.role || "client"]}
                            </Badge>
                            {u.active !== false ? (
                                <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]"><ShieldCheck className="w-3 h-3 mr-1" /> Activo</Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px]">Inactivo</Badge>
                            )}
                        </div>

                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                            <EmployeeProfileDialog userId={u._id} userName={u.name || "Desconocido"} />
                        </div>
                    </div>
                ))}
            </div>

            {users.length === 0 && (
                <div className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500 dark:text-zinc-400 w-full mt-8">
                    <UserCog className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                    <p>No hay personal registrado en el sistema.</p>
                    <UserFormDialog
                        trigger={
                            <Button variant="outline" className="mt-4">
                                Ingresar Miembro
                            </Button>
                        }
                    />
                </div>
            )}
        </div>
    );
}
