"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { LayoutList, ArrowRight, User, Building, AlertCircle, Clock, CheckCircle2, MessageSquare, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RequestFormDialog } from "./RequestFormDialog";
import { TicketDetailDialog } from "./TicketDetailDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";

export default function FlujosPage() {
    const [selectedTicketId, setSelectedTicketId] = useState<Id<"internalRequests"> | null>(null);

    // Para simplificar MVP, mostraremos todos los tickets agrupados o los recientes.
    // Idealmente el usuario vería solo los enviados/recibidos por su departamento.
    const allDepartments = useQuery(api.departments.getAllDepartments);
    const allUsers = useQuery(api.users.getAllUsers);

    const currentUserId = allUsers?.[0]?._id; // Mockeando el ID del usuario actual logueado
    const primaryDeptId = allDepartments?.[0]?._id;
    const receivedRequests = useQuery(
        api.internalRequests.getRequestsReceivedByDepartment,
        primaryDeptId ? { departmentId: primaryDeptId } : "skip"
    );

    const updateRequestStatus = useMutation(api.internalRequests.updateRequestStatus);

    if (allDepartments === undefined || allUsers === undefined) {
        return (
            <div className="flex h-[80vh] items-center justify-center text-zinc-400">
                <LayoutList className="w-6 h-6 animate-pulse mr-2" />
                <span>Cargando mesa de requerimientos...</span>
            </div>
        );
    }

    const priorityColors: Record<string, string> = {
        low: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400",
        medium: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        high: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
        urgent: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 animate-pulse"
    };

    const statusLabels: Record<string, string> = {
        pending_approval: "Requiere Visto Bueno",
        open: "Abierto",
        in_progress: "En Progreso",
        resolved: "Resuelto",
        rejected: "Rechazado (Denegado)",
        closed: "Cerrado"
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Flujos y Requerimientos</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Mesa de ayuda y coordinación interdepartamental.</p>
                </div>
                <RequestFormDialog />
            </div>

            <div className="pt-4">
                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-4">
                    Bandeja Recibida {!primaryDeptId && <span className="text-sm font-normal text-zinc-500 dark:text-zinc-600">(Esperando un área...)</span>}
                </h2>

                <div className="space-y-4">
                    {receivedRequests?.map(req => {
                        const sender = allUsers.find(u => u._id === req.fromUserId);
                        const assigned = req.assignedTo ? allUsers.find(u => u._id === req.assignedTo) : null;

                        return (
                            <div key={req._id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${req.status === 'resolved' || req.status === 'closed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'}`}>
                                            {req.status === 'resolved' || req.status === 'closed' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className={`text-[10px] uppercase shadow-none ${priorityColors[req.priority]}`}>
                                                    Prioridad {req.priority}
                                                </Badge>
                                                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                                                    {statusLabels[req.status]}
                                                </span>
                                                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                                    • {format(new Date(req.createdAt), "dd MMM, HH:mm", { locale: es })}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-zinc-900 dark:text-white text-lg">{req.title}</h3>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">{req.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 text-xs">
                                        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-md border border-zinc-100 dark:border-zinc-700">
                                            <User className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                                            <span>De: <strong>{sender?.name || 'Desconocido'}</strong></span>
                                        </div>
                                        {req.status === 'pending_approval' && (
                                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500 font-semibold bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-200 dark:border-amber-800">
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                                Esperando Autorización
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                        {assigned ? (
                                            <>
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
                                                    <span className="text-[10px] uppercase">{assigned.name?.charAt(0)}</span>
                                                </div>
                                                Atendido por: {assigned.name}
                                            </>
                                        ) : (
                                            <span className="text-amber-600 dark:text-amber-500 flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-100 dark:border-amber-800 text-xs shadow-sm">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                Sin técnico asignado
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-8 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                            onClick={() => setSelectedTicketId(req._id)}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-1.5" />
                                            Abrir Hilo de Ticket
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {(!receivedRequests || receivedRequests.length === 0) && (
                        <div className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500 dark:text-zinc-600 w-full">
                            <LayoutList className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                            <p>Bandeja limpia. No hay solicitudes pendientes para esta área.</p>
                        </div>
                    )}
                </div>
            </div>

            {currentUserId && (
                <TicketDetailDialog
                    requestId={selectedTicketId}
                    open={selectedTicketId !== null}
                    onOpenChange={(isOpen) => !isOpen && setSelectedTicketId(null)}
                    currentUserId={currentUserId}
                />
            )}
        </div>
    );
}
