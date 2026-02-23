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
            <div className="flex h-[80vh] items-center justify-center text-zinc-400">
                <UserCog className="w-6 h-6 animate-pulse mr-2" />
                <span>Cargando directorio del personal...</span>
            </div>
        );
    }

    const roleColors: Record<string, string> = {
        admin: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-200",
        sales: "bg-sky-500/10 text-sky-500 border-sky-200",
        technician: "bg-emerald-500/10 text-emerald-500 border-emerald-200",
        developer: "bg-indigo-500/10 text-indigo-500 border-indigo-200",
        client: "bg-slate-500/10 text-slate-500 border-slate-200"
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
            <div className="flex justify-between items-end border-b border-zinc-200 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Gestión de Equipo</h1>
                    <p className="text-zinc-500 mt-1">Directorio de colaboradores y roles de sistema.</p>
                </div>
                <UserFormDialog />
            </div>

            {/* Listado */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {users.map(u => (
                    <div key={u._id} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 text-sm">{u.name || "Usuario Sin Nombre"}</h3>
                                    <div className="flex items-center text-xs text-zinc-500 mt-0.5">
                                        <Mail className="w-3 h-3 mr-1" />
                                        {u.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-50 rounded-md p-3 text-xs text-zinc-600 mt-2 space-y-2 border border-zinc-100">
                            <div className="flex items-center gap-2">
                                <Building className="w-3.5 h-3.5 text-zinc-400" />
                                <span className="font-medium">
                                    {departments.find(d => d._id === u.departmentId)?.name || "Sin Departamento Base"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                                <span>{u.position || "Cargo no especificado"}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-2 border-t pt-3 pb-2">
                            <Badge variant="outline" className={`text-xs ${roleColors[u.role || "client"]}`}>
                                {roleLabels[u.role || "client"]}
                            </Badge>
                            {u.active !== false ? (
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 text-[10px]"><ShieldCheck className="w-3 h-3 mr-1" /> Activo</Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-red-50 text-red-600 text-[10px]">Inactivo</Badge>
                            )}
                        </div>

                        <div className="pt-2 border-t border-zinc-100">
                            <EmployeeProfileDialog userId={u._id} userName={u.name || "Desconocido"} />
                        </div>
                    </div>
                ))}
            </div>

            {users.length === 0 && (
                <div className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-500 w-full mt-8">
                    <UserCog className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
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
