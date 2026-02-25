"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Users, FileWarning, Fingerprint, CalendarCheck, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { sileo } from "sileo";
import { Badge } from "@/components/ui/badge";

export default function HRAdminDashboard() {
    const allUsers = useQuery(api.users.getAllUsers) || [];
    const pendingLeaves = useQuery(api.hr.getPendingLeaveRequests) || [];

    // Asumiremos que el admin logueado es el primero en este MVP Simulador
    const currentAdminId = allUsers[0]?._id;

    const resolveLeaveMutation = useMutation(api.hr.resolveLeaveRequest);

    const handleResolveLeave = async (requestId: any, status: "aprobado" | "rechazado") => {
        try {
            await resolveLeaveMutation({ requestId, status, managerId: currentAdminId });
            sileo.success({ title: `Solicitud ${status === 'aprobado' ? 'aprobada' : 'rechazada'}` });
        } catch (error) {
            sileo.error({ title: "Error al procesar la solicitud" });
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
                    <Users className="w-8 h-8 text-emerald-600" />
                    Core Recursos Humanos (HRIS)
                </h1>
                <p className="text-zinc-500 mt-2 text-lg">Panel Operativo para Gestión de Talento, Asistencias y Planillas.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Panel Centralizado: Solicitudes de Descanso / Vacaciones (En cola) */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                                <FileWarning className="w-5 h-5 text-orange-500" />
                                Solicitudes Pendientes ({pendingLeaves.length})
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {pendingLeaves.length === 0 ? (
                                <div className="text-center py-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                                    <CalendarCheck className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                                    <p className="text-zinc-500 font-medium">No hay tickets de vacaciones pendientes.</p>
                                </div>
                            ) : (
                                pendingLeaves.map(leave => {
                                    const employee = allUsers.find(u => u._id === leave.userId);
                                    return (
                                        <div key={leave._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-zinc-900">{employee?.name}</span>
                                                    <Badge variant="outline" className="bg-white text-[10px] uppercase font-bold tracking-wider">{leave.type.replace('_', ' ')}</Badge>
                                                </div>
                                                <div className="text-sm text-zinc-600 mb-2">
                                                    Desde: <span className="font-semibold text-zinc-900">{new Date(leave.startDate).toLocaleDateString('es-PE')}</span> al <span className="font-semibold text-zinc-900">{new Date(leave.endDate).toLocaleDateString('es-PE')}</span>
                                                </div>
                                                {leave.reason && <p className="text-sm text-zinc-500 italic">"{leave.reason}"</p>}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleResolveLeave(leave._id, 'aprobado')} className="p-2 sm:px-4 sm:py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-semibold rounded-lg text-sm flex items-center gap-1 transition-colors">
                                                    <CheckCircle2 className="w-4 h-4" /> Aprobar
                                                </button>
                                                <button onClick={() => handleResolveLeave(leave._id, 'rechazado')} className="p-2 sm:px-4 sm:py-2 bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded-lg text-sm flex items-center gap-1 transition-colors">
                                                    <XCircle className="w-4 h-4" /> Denegar
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Panel Lateral: Monitor Global de Asistencia y Planillas */}
                <div className="col-span-1 space-y-6">
                    <div className="bg-zinc-950 p-6 rounded-2xl shadow-lg border border-zinc-800 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Fingerprint className="w-24 h-24" />
                        </div>
                        <h2 className="text-lg font-bold mb-2">Monitor Biométrico</h2>
                        <p className="text-zinc-400 text-sm mb-6">El monitor global de asistencias en vivo será agregado en el próximo release.</p>
                        <Link href="/admin/hr/asistencia" className="w-full flex justify-center bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl font-medium transition-colors border border-zinc-700">
                            Ver Reporte de Hoy
                        </Link>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                        <h2 className="text-lg font-bold text-indigo-950 mb-2">Motor de Nóminas</h2>
                        <p className="text-indigo-700/70 text-sm mb-6">Generador de planillas de pago (Payroll) de equipo.</p>

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Ejecución Previa</h3>
                            <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm flex justify-between items-center">
                                <span className="font-semibold text-indigo-900 text-sm">Enero 2026</span>
                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">Pagada</Badge>
                            </div>

                            <Link href="/admin/hr/nominas" className="w-full flex justify-center bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-indigo-500/25 mt-4">
                                Correr Nómina Actual
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
