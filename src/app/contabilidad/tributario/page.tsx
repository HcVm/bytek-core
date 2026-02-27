"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Scale, Calendar, Receipt, AlertCircle, CheckCircle2, CircleDashed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export default function TributarioPage() {
    const [year] = useState(currentYear);
    const igv = useQuery(api.taxManagement.calculateMonthlyIGV, { year, month: currentMonth });
    const ir = useQuery(api.taxManagement.calculateMonthlyIncomeTax, { year, month: currentMonth });
    const calendar = useQuery(api.taxManagement.getTaxCalendar, { year });

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 overflow-hidden">
            <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                            <Scale className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Obligaciones Tributarias</h1>
                    </div>
                    <p className="text-slate-500 font-medium dark:text-zinc-400 pl-14">IGV, Impuesto a la Renta, Declaraciones — Período {year}.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8 space-y-8">

                    {/* IGV Mensual */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-indigo-600" /> IGV Mensual ({igv?.period || "..."})
                        </h2>
                        {igv ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                                    <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">Débito Fiscal (IGV Ventas)</p>
                                    <h3 className="text-xl font-black text-red-700 dark:text-red-500">{formatCurrency(igv.debitoFiscal)}</h3>
                                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">Base: {formatCurrency(igv.sales.base)} · {igv.sales.invoiceCount} facturas</p>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                                    <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">Crédito Fiscal (IGV Compras)</p>
                                    <h3 className="text-xl font-black text-emerald-700 dark:text-emerald-500">({formatCurrency(igv.creditoFiscal)})</h3>
                                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">Base: {formatCurrency(igv.purchases.base)} · {igv.purchases.expenseCount} gastos</p>
                                </div>
                                <div className={`p-6 rounded-2xl border-2 shadow-sm ${igv.netPayable > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/30'}`}>
                                    <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">
                                        {igv.netPayable > 0 ? 'IGV por Pagar' : 'Crédito a Favor'}
                                    </p>
                                    <h3 className={`text-2xl font-black ${igv.netPayable > 0 ? 'text-red-700 dark:text-red-500' : 'text-emerald-700 dark:text-emerald-500'}`}>
                                        {formatCurrency(igv.netPayable > 0 ? igv.netPayable : igv.creditBalance)}
                                    </h3>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 text-center text-slate-400">Cargando...</div>
                        )}
                    </div>

                    {/* IR Mensual */}
                    {ir && (
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Pago a Cuenta IR ({ir.period})</h2>
                            <div className="flex items-center gap-8">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">Ingresos Netos</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(ir.incomeBase)}</p>
                                </div>
                                <div className="text-2xl text-slate-300">×</div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">Tasa</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white">1.5%</p>
                                </div>
                                <div className="text-2xl text-slate-300">=</div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 px-6 py-3 rounded-xl border border-indigo-200 dark:border-indigo-900/30">
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">Pago a Cuenta</p>
                                    <p className="text-xl font-black text-indigo-700 dark:text-indigo-300">{formatCurrency(ir.monthlyPayment)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Calendario */}
                    {calendar && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-600" /> Calendario Tributario {year}
                            </h2>
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-5 text-center text-slate-400 dark:text-zinc-500">
                                <p className="text-sm">Total pendiente de pago: <span className="font-black text-red-700 dark:text-red-500">{formatCurrency(calendar.totalPendingAmount)}</span></p>
                                <p className="text-xs mt-1">{calendar.periods.length} períodos registrados</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
