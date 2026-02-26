"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Receipt, Route, FileCheck2, Cpu, Compass } from "lucide-react";
import { motion } from "framer-motion";

export default function ClientDashboardPage() {
    const params = useParams();
    const clientId = params.clientId as Id<"clients">;

    const data = useQuery(api.clientPortal.getClientDashboardData, { clientId });

    if (data === undefined) {
        return (
            <div className="flex h-[80vh] items-center justify-center text-zinc-400">
                <Activity className="w-6 h-6 animate-pulse mr-2" />
                <span>Cifrando conexión y recuperando expediente...</span>
            </div>
        );
    }

    if (data === null) {
        return notFound();
    }

    const { client, projects, invoices, installedHardware } = data;

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
                className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col md:flex-row justify-between md:items-center gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Hola, equipo de {client.name}</h1>
                    <p className="text-zinc-500 text-sm mt-1">Este es su panel de control corporativo. Aquí puede hacer seguimiento a sus servicios.</p>
                </div>
                {hasDebt ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-3">
                        <Receipt className="w-5 h-5 text-amber-600" />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Saldo Pendiente</p>
                            <p className="font-bold text-lg leading-none">S/ {totalDebt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3">
                        <FileCheck2 className="w-5 h-5 text-emerald-600" />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Estado de Cuenta</p>
                            <p className="font-bold text-sm leading-tight">Al Día (Sin Deuda)</p>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Fila Dividida: Proyectos y Facturas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Columna Izquierda: Mis Proyectos y Trazabilidad (Ocupa 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                        <Route className="w-5 h-5 text-indigo-500" /> Servicios Activos
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
                                        <Card className="hover:border-indigo-200 hover:shadow-md transition-all">
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-md font-bold text-indigo-950">{p.title}</CardTitle>
                                                    </div>
                                                    <Badge variant={p.status === "completed" ? "default" : "secondary"} className={p.status === "completed" ? "bg-emerald-500" : ""}>
                                                        {p.status === "in_progress" ? "En Desarrollo" : (p.status === "planning" ? "Planificación" : "Entregado")}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="flex justify-between text-xs font-medium mb-2 text-zinc-600">
                                                            <span>Progreso Operativo</span>
                                                            <span>{Math.round(progressPercentage)}%</span>
                                                        </div>
                                                        <Progress value={progressPercentage} className="h-2" />
                                                    </div>


                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                            <Compass className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                            <p className="text-zinc-500 font-medium">No tiene proyectos tecnológicos activos en este momento.</p>
                        </div>
                    )}
                </div>

                {/* Columna Derecha: Facturación & Field Service */}
                <div className="space-y-6">

                    {/* Caja de Facturación Visible */}
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-4">
                            <Receipt className="w-5 h-5 text-amber-500" /> Mis Cuentas
                        </h2>
                        <Card>
                            <CardContent className="p-0">
                                {invoices.length > 0 ? (
                                    <div className="divide-y divide-zinc-100">
                                        {invoices.map((inv) => (
                                            <div key={inv._id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                                                <div>
                                                    <p className="font-semibold text-sm text-zinc-900">Comprobante #{inv._id.substring(0, 6)}</p>
                                                    <p className="text-xs text-zinc-500">{new Date(inv.dueDate).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className="font-bold text-sm">S/ {inv.amount.toLocaleString()}</span>
                                                    <Badge variant="outline" className={`text-[10px] mt-1 ${inv.status === 'paid' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : (inv.status === 'overdue' ? 'border-red-200 text-red-700 bg-red-50' : '')}`}>
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
                            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-4">
                                <Cpu className="w-5 h-5 text-emerald-500" /> Mi Hardware
                            </h2>
                            <Card className="border-emerald-100 bg-emerald-50/30">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-xs">
                                        Equipos con Actas de Cierre Conformadas en sus Locales. Identificados para Garantía.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {installedHardware.map((serial, idx) => (
                                            <div key={idx} className="bg-white border text-emerald-800 text-xs px-2 py-1 flex items-center rounded shadow-sm font-mono">
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
