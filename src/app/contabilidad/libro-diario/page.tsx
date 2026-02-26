"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { FileSpreadsheet, Plus, CheckCircle2, CircleDashed, XCircle, Eye, Filter, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    borrador: { icon: CircleDashed, color: "text-amber-600 bg-amber-100", label: "Borrador" },
    contabilizado: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-100", label: "Contabilizado" },
    anulado: { icon: XCircle, color: "text-red-600 bg-red-100", label: "Anulado" },
};

const TYPE_LABELS: Record<string, string> = {
    apertura: "Apertura",
    operacion: "Operación",
    ajuste: "Ajuste",
    cierre: "Cierre",
    reclasificacion: "Reclasificación",
};

export default function LibroDiarioPage() {
    const entries = useQuery(api.journal.getJournalEntries, {}) || [];
    const periods = useQuery(api.accounting.getAccountingPeriods) || [];
    const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

    const entryDetail = useQuery(
        api.journal.getJournalEntryDetail,
        selectedEntry ? { entryId: selectedEntry as any } : "skip"
    );

    const totalRegistered = entries.filter(e => e.status === "contabilizado").length;
    const totalDraft = entries.filter(e => e.status === "borrador").length;
    const totalAmount = entries.filter(e => e.status === "contabilizado").reduce((sum, e) => sum + e.totalDebit, 0);

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="flex justify-between items-start max-w-7xl mx-auto w-full">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Libro Diario</h1>
                        </div>
                        <p className="text-slate-500 font-medium pl-14">Registro cronológico de asientos contables — Partida Doble.</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8 flex flex-col h-full">

                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Contabilizados</p>
                                <h3 className="text-2xl font-black text-slate-900">{totalRegistered}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                                <CircleDashed className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">En Borrador</p>
                                <h3 className="text-2xl font-black text-amber-700">{totalDraft}</h3>
                            </div>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex items-center gap-4 relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 shrink-0 z-10">
                                <FileSpreadsheet className="w-6 h-6" />
                            </div>
                            <div className="z-10">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Movido (Debe)</p>
                                <h3 className="text-2xl font-black text-white">{formatCurrency(totalAmount)}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Split View: List + Detail */}
                    <div className="flex-1 flex gap-6 min-h-0">
                        {/* Entries list */}
                        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800">Asientos Registrados</h3>
                                <span className="text-xs text-slate-400 font-medium">{entries.length} asientos</span>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {entries.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400">
                                        <FileSpreadsheet className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                                        <p className="font-medium">Sin asientos contables.</p>
                                        <p className="text-sm">Los asientos se generan automáticamente al registrar facturas, gastos o pagos.</p>
                                    </div>
                                ) : (
                                    entries.map((entry: any) => {
                                        const statusCfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.borrador;
                                        const StatusIcon = statusCfg.icon;

                                        return (
                                            <div
                                                key={entry._id}
                                                onClick={() => setSelectedEntry(entry._id)}
                                                className={`flex items-center gap-4 px-5 py-4 border-b border-slate-50 cursor-pointer transition-all ${selectedEntry === entry._id
                                                        ? 'bg-amber-50/50 border-l-2 border-l-amber-500'
                                                        : 'hover:bg-slate-50/80'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${statusCfg.color}`}>
                                                    <StatusIcon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-xs font-mono font-bold text-amber-700">{entry.entryNumber}</span>
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{TYPE_LABELS[entry.type] || entry.type}</Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-700 truncate">{entry.description}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] text-slate-400">{entry.date}</span>
                                                        <span className="text-[10px] text-slate-400">por {entry.createdByName}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-sm font-black text-slate-900">{formatCurrency(entry.totalDebit)}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Detail panel */}
                        {selectedEntry && entryDetail && (
                            <div className="w-[400px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col shrink-0">
                                <div className="p-4 border-b border-slate-100 bg-amber-50">
                                    <h3 className="font-bold text-amber-800 text-sm">{entryDetail.entryNumber}</h3>
                                    <p className="text-xs text-amber-600 mt-0.5">{entryDetail.description}</p>
                                </div>
                                <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                                    <div className="text-xs text-slate-500 space-y-1">
                                        <p><span className="font-bold">Fecha:</span> {entryDetail.date}</p>
                                        <p><span className="font-bold">Tipo:</span> {TYPE_LABELS[entryDetail.type]}</p>
                                        <p><span className="font-bold">Período:</span> {entryDetail.period}</p>
                                        <p><span className="font-bold">Registrado por:</span> {entryDetail.createdByName}</p>
                                    </div>

                                    <div className="border-t border-slate-100 pt-3">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Líneas del Asiento</h4>
                                        <div className="space-y-1">
                                            {entryDetail.lines?.map((line: any, idx: number) => (
                                                <div key={idx} className={`flex items-center gap-2 text-xs py-1.5 px-2 rounded ${line.debit > 0 ? 'bg-blue-50/50' : 'bg-red-50/50 pl-6'}`}>
                                                    <span className="font-mono text-slate-500 w-12">{line.accountCode}</span>
                                                    <span className="flex-1 text-slate-700 truncate">{line.accountName}</span>
                                                    {line.debit > 0 && <span className="font-bold text-blue-700">{formatCurrency(line.debit)}</span>}
                                                    {line.credit > 0 && <span className="font-bold text-red-600">{formatCurrency(line.credit)}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-200 pt-3">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-blue-700">Total Debe: {formatCurrency(entryDetail.totalDebit)}</span>
                                            <span className="text-red-600">Total Haber: {formatCurrency(entryDetail.totalCredit)}</span>
                                        </div>
                                        <div className="mt-1 text-center">
                                            {Math.abs(entryDetail.totalDebit - entryDetail.totalCredit) < 0.01 ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">✓ Cuadrado</Badge>
                                            ) : (
                                                <Badge className="bg-red-100 text-red-700 text-[10px]">✗ Descuadrado</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
