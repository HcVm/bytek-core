"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Receipt, Route, FileCheck2, Cpu, Compass, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ClientDashboardPage() {
    const params = useParams();
    const clientId = params.clientId as Id<"clients">;

    const data = useQuery(api.clientPortal.getClientDashboardData, { clientId });

    if (data === undefined) {
        return (
            <div className="flex h-[80vh] items-center justify-center text-zinc-400 dark:text-zinc-600">
                <Activity className="w-6 h-6 animate-pulse mr-2" />
                <span>Cifrando conexión y recuperando expediente...</span>
            </div>
        );
    }

    if (data === null) {
        return notFound();
    }

    const { client, projects, invoices, installedHardware, upcomingMeetings } = data;

    // Calcular deuda total (Vencida + Pendiente)
    const totalDebt = invoices
        .filter(i => i.status === "pending" || i.status === "overdue")
        .reduce((sum, i) => sum + i.amount, 0);

    const hasDebt = totalDebt > 0;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
            {/* Cabecera / Saludo */}
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between md:items-center gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Hola, equipo de {client.name}</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 mb-4">Este es su panel de control corporativo. Aquí puede hacer seguimiento a sus servicios.</p>
                    <Link href={`/client-portal/${clientId}/communication`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Centro de Comunicación
                        </Button>
                    </Link>
                </div>
                {hasDebt ? (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-400 px-4 py-3 rounded-xl flex items-center gap-3">
                        <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-500">Saldo Pendiente</p>
                            <p className="font-bold text-lg leading-none">S/ {totalDebt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3">
                        <FileCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-500">Estado de Cuenta</p>
                            <p className="font-bold text-sm leading-tight">Al Día (Sin Deuda)</p>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Fila Dividida: Proyectos y Facturas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Columna Izquierda: Mis Proyectos y Trazabilidad (Ocupa 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Route className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Servicios Activos
                    </h2>

                    {projects.length > 0 ? (
                        <div className="space-y-4">
                            {projects.map((p, idx) => {
                                const totalMilestones = p.milestoneCount || 0;
                                const completedMilestones = p.completedMilestones || 0;
                                const progressPercentage = totalMilestones === 0 ? 0 : (completedMilestones / totalMilestones) * 100;

                                return (
                                    <motion.div
                                        key={p._id}
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * idx }}
                                    >
                                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all">
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-md font-bold text-indigo-950 dark:text-indigo-400">{p.title}</CardTitle>
                                                    </div>
                                                    <Badge variant={p.status === "completed" ? "default" : "secondary"} className={p.status === "completed" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"}>
                                                        {p.status === "in_progress" ? "En Desarrollo" : (p.status === "planning" ? "Planificación" : "Entregado")}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="flex justify-between text-xs font-medium mb-2 text-zinc-600 dark:text-zinc-400">
                                                            <span>Progreso Operativo</span>
                                                            <span className="text-zinc-900 dark:text-zinc-100">{Math.round(progressPercentage)}%</span>
                                                        </div>
                                                        <Progress value={progressPercentage} className="h-2 bg-zinc-100 dark:bg-zinc-800" />
                                                    </div>


                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
                            <Compass className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium">No tiene proyectos tecnológicos activos en este momento.</p>
                        </div>
                    )}

                    {/* Nueva sub-sección: Reuniones */}
                    <div className="pt-6">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Próximas Reuniones
                        </h2>
                        {upcomingMeetings && upcomingMeetings.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingMeetings.map((meeting: any) => (
                                    <Card key={meeting._id} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors shadow-sm">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-zinc-900 dark:text-white">{meeting.title || "Reunión de seguimiento"}</h3>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                    {meeting.date ? new Date(meeting.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' }) : "Fecha por confirmar"}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge variant="outline" className={
                                                    meeting.status === "confirmed" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" :
                                                        meeting.status === "pending" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" : ""
                                                }>
                                                    {meeting.status === "confirmed" ? "Confirmada" : "Pendiente"}
                                                </Badge>
                                                {meeting.status === "confirmed" && meeting.link && (
                                                    <Link href={`/client-portal/${clientId}/communication/meeting/${meeting._id}`}>
                                                        <Button size="sm" variant="secondary" className="h-7 text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border-indigo-100 dark:border-indigo-400/20">
                                                            Unirse a Llamada Nativa
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm">No hay reuniones agendadas próximas.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna Derecha: Facturación & Field Service */}
                <div className="space-y-6">

                    {/* Caja de Facturación Visible */}
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
                            <Receipt className="w-5 h-5 text-amber-500 dark:text-amber-400" /> Mis Cuentas
                        </h2>
                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                            <CardContent className="p-0">
                                {invoices.length > 0 ? (
                                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                        {invoices.map((inv) => (
                                            <div key={inv._id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <div>
                                                    <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Comprobante #{inv._id.substring(0, 6)}</p>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(inv.dueDate).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">S/ {inv.amount.toLocaleString()}</span>
                                                    <Badge variant="outline" className={`text-[10px] mt-1 ${inv.status === 'paid' ? 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : (inv.status === 'overdue' ? 'border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10' : 'text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800')}`}>
                                                        {inv.status === 'paid' ? 'Pagado' : (inv.status === 'overdue' ? 'Vencido' : 'Pendiente')}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-sm text-zinc-500">
                                        No hay comprobantes emitidos.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Caja B2B de Infraestructura Instalada */}
                    {installedHardware.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
                                <Cpu className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> Mi Hardware
                            </h2>
                            <Card className="border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                                        Equipos con Actas de Cierre Conformadas en sus Locales. Identificados para Garantía.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {installedHardware.map((serial, idx) => (
                                            <div key={idx} className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 text-emerald-800 dark:text-emerald-400 text-xs px-2 py-1 flex items-center rounded shadow-sm font-mono">
                                                S/N: {serial}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
