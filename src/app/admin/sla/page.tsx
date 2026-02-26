"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function SLAsPage() {
    const dashboard = useQuery(api.contracts.getSLADashboard);

    const unitLabels: Record<string, string> = {
        horas: "hrs", porcentaje: "%", minutos: "min",
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center text-white shadow-md">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">SLAs de Contratos</h1>
                    </div>
                    <p className="text-slate-500 font-medium pl-14">Monitoreo de cumplimiento de Acuerdos de Nivel de Servicio.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8 space-y-8">

                    {dashboard && (
                        <>
                            {/* Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 relative z-10">Cumplimiento Global</p>
                                    <h3 className="text-3xl font-black text-white relative z-10">{dashboard.summary.complianceRate}%</h3>
                                </div>
                                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 shadow-sm">
                                    <p className="text-xs font-bold text-emerald-600 uppercase mb-1 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Cumplidos
                                    </p>
                                    <h3 className="text-2xl font-black text-emerald-700">{dashboard.summary.compliant}</h3>
                                </div>
                                <div className="bg-red-50 p-6 rounded-2xl border border-red-200 shadow-sm">
                                    <p className="text-xs font-bold text-red-600 uppercase mb-1 flex items-center gap-1">
                                        <XCircle className="w-3 h-3" /> Incumplidos
                                    </p>
                                    <h3 className="text-2xl font-black text-red-700">{dashboard.summary.nonCompliant}</h3>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Sin Medir
                                    </p>
                                    <h3 className="text-2xl font-black text-slate-900">{dashboard.summary.pending}</h3>
                                </div>
                            </div>

                            {/* SLA List */}
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Detalle de SLAs</h2>
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    {dashboard.slas.length === 0 ? (
                                        <div className="p-16 text-center text-slate-400">
                                            <ShieldCheck className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                                            <p className="font-medium">Sin SLAs configurados.</p>
                                            <p className="text-sm">Crea SLAs desde la gestión de contratos.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-50">
                                            {dashboard.slas.map((sla: any) => (
                                                <div key={sla._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 transition-colors">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${sla.isCompliant === undefined ? 'bg-slate-100 text-slate-500' :
                                                            sla.isCompliant ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                                        }`}>
                                                        {sla.isCompliant === undefined ? <Clock className="w-4 h-4" /> :
                                                            sla.isCompliant ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-900">{sla.metricName}</p>
                                                        <p className="text-[10px] text-slate-400">Contrato: {sla.contractTitle} · Período: {sla.measurementPeriod}</p>
                                                        {sla.penaltyClause && <p className="text-[10px] text-red-400 mt-0.5">⚠ {sla.penaltyClause}</p>}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-500">Objetivo</p>
                                                        <p className="text-sm font-black text-slate-900">{sla.targetValue}{unitLabels[sla.unit]}</p>
                                                    </div>
                                                    <div className="text-right min-w-[80px]">
                                                        <p className="text-xs text-slate-500">Actual</p>
                                                        <p className={`text-sm font-black ${sla.currentValue === undefined ? 'text-slate-400' :
                                                                sla.isCompliant ? 'text-emerald-600' : 'text-red-600'
                                                            }`}>
                                                            {sla.currentValue !== undefined ? `${sla.currentValue}${unitLabels[sla.unit]}` : "—"}
                                                        </p>
                                                    </div>
                                                    <Badge className={`text-[10px] ${sla.isCompliant === undefined ? 'bg-slate-100 text-slate-600' :
                                                            sla.isCompliant ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {sla.isCompliant === undefined ? "Pendiente" : sla.isCompliant ? "Cumple" : "Incumple"}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
