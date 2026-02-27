"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { HandCoins, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function CuentasCobrarPage() {
    const receivables = useQuery(api.receivables.getReceivables, {}) || [];
    const aging = useQuery(api.receivables.getAgingReport);

    const pendientes = receivables.filter(r => r.status === "pendiente");
    const parciales = receivables.filter(r => r.status === "parcial");
    const totalPendiente = receivables.reduce((s, r) => s + r.pendingAmount, 0);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 overflow-hidden">
            <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md">
                            <HandCoins className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Cuentas por Cobrar</h1>
                    </div>
                    <p className="text-slate-500 font-medium pl-14">Gestión de facturación y cobranza. Reporte de antigüedad de saldos.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8 space-y-8">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 relative z-10">Total por Cobrar</p>
                            <h3 className="text-2xl font-black text-white relative z-10">{formatCurrency(totalPendiente)}</h3>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                            <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">Pendientes</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{pendientes.length}</h3>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                            <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">Pagos Parciales</p>
                            <h3 className="text-2xl font-black text-amber-700 dark:text-amber-500">{parciales.length}</h3>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                            <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">Total Documentos</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{receivables.length}</h3>
                        </div>
                    </div>

                    {/* Aging Report */}
                    {aging && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" /> Antigüedad de Saldos
                            </h2>
                            <div className="grid grid-cols-5 gap-3">
                                {[
                                    { label: "Al Día", data: aging.current, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                                    { label: "1-30 días", data: aging.days30, color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
                                    { label: "31-60 días", data: aging.days60, color: "bg-orange-50 border-orange-200 text-orange-700" },
                                    { label: "61-90 días", data: aging.days90, color: "bg-red-50 border-red-200 text-red-700" },
                                    { label: "+90 días", data: aging.over90, color: "bg-red-100 border-red-300 text-red-800" },
                                ].map(bucket => (
                                    <div key={bucket.label} className={`p-4 rounded-xl border ${bucket.color}`}>
                                        <p className="text-xs font-bold uppercase mb-1">{bucket.label}</p>
                                        <p className="text-lg font-black">{formatCurrency(bucket.data.total)}</p>
                                        <p className="text-[10px] mt-1">{bucket.data.items.length} docs</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* List */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
                            <h3 className="font-bold text-slate-800 dark:text-zinc-200">Documentos por Cobrar</h3>
                        </div>

                        {receivables.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <HandCoins className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                                <p className="font-medium">Sin cuentas por cobrar.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {receivables.map((r: any) => (
                                    <div key={r._id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">{r.clientName}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-zinc-500">{r.documentType.toUpperCase()} {r.documentNumber} · Vence: {r.dueDate}</p>
                                        </div>
                                        <Badge variant="outline" className={`text-[10px] ${r.status === 'pendiente' ? 'text-amber-600 border-amber-200' : r.status === 'parcial' ? 'text-blue-600 border-blue-200' : 'text-emerald-600 border-emerald-200'}`}>
                                            {r.status}
                                        </Badge>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(r.pendingAmount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
