"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PieChart, TrendingUp, TrendingDown, Scale, ArrowUpRight, ArrowDownRight, BarChart3, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function EstadosFinancierosPage() {
    const balanceSheet = useQuery(api.financialStatements.getBalanceSheet, {});
    const incomeStatement = useQuery(api.financialStatements.getIncomeStatement, {});

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="flex justify-between items-start max-w-7xl mx-auto w-full">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                <PieChart className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Estados Financieros</h1>
                        </div>
                        <p className="text-slate-500 font-medium pl-14">Balance General y Estado de Resultados — Generados automáticamente desde el Libro Diario.</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8 space-y-8">

                    {/* ====== BALANCE GENERAL ====== */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                            <Scale className="w-5 h-5 text-amber-600" />
                            Balance General (Estado de Situación Financiera)
                        </h2>

                        {balanceSheet ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Activos */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="p-4 bg-blue-50 border-b border-blue-100">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-blue-800">Activos</h3>
                                            <span className="text-lg font-black text-blue-900">{formatCurrency(balanceSheet.activos.total)}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {balanceSheet.activos.items.length === 0 ? (
                                            <p className="text-sm text-slate-400 text-center py-4">Sin movimientos</p>
                                        ) : (
                                            balanceSheet.activos.items.map((item: any) => (
                                                <div key={item.code} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs text-slate-400">{item.code}</span>
                                                        <span className="text-slate-700">{item.name}</span>
                                                    </div>
                                                    <span className="font-bold text-slate-900">{formatCurrency(item.balance)}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Pasivos */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="p-4 bg-red-50 border-b border-red-100">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-red-800">Pasivos</h3>
                                            <span className="text-lg font-black text-red-900">{formatCurrency(balanceSheet.pasivos.total)}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {balanceSheet.pasivos.items.length === 0 ? (
                                            <p className="text-sm text-slate-400 text-center py-4">Sin movimientos</p>
                                        ) : (
                                            balanceSheet.pasivos.items.map((item: any) => (
                                                <div key={item.code} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs text-slate-400">{item.code}</span>
                                                        <span className="text-slate-700">{item.name}</span>
                                                    </div>
                                                    <span className="font-bold text-slate-900">{formatCurrency(item.balance)}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Patrimonio */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="p-4 bg-purple-50 border-b border-purple-100">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-purple-800">Patrimonio</h3>
                                            <span className="text-lg font-black text-purple-900">{formatCurrency(balanceSheet.patrimonio.total)}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {balanceSheet.patrimonio.items.length === 0 ? (
                                            <p className="text-sm text-slate-400 text-center py-4">Sin movimientos</p>
                                        ) : (
                                            balanceSheet.patrimonio.items.map((item: any) => (
                                                <div key={item.code} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs text-slate-400">{item.code}</span>
                                                        <span className="text-slate-700">{item.name}</span>
                                                    </div>
                                                    <span className="font-bold text-slate-900">{formatCurrency(item.balance)}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                                <p className="font-medium">Cargando Balance General...</p>
                            </div>
                        )}

                        {/* Ecuación contable */}
                        {balanceSheet && (
                            <div className={`p-4 rounded-xl border-2 text-center ${balanceSheet.isBalanced ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
                                <div className="flex items-center justify-center gap-4 text-lg font-bold">
                                    <span className="text-blue-700">Activos ({formatCurrency(balanceSheet.activos.total)})</span>
                                    <span className="text-slate-400">=</span>
                                    <span className="text-red-700">Pasivos ({formatCurrency(balanceSheet.pasivos.total)})</span>
                                    <span className="text-slate-400">+</span>
                                    <span className="text-purple-700">Patrimonio ({formatCurrency(balanceSheet.patrimonio.total)})</span>
                                </div>
                                <div className="mt-2">
                                    {balanceSheet.isBalanced ? (
                                        <Badge className="bg-emerald-100 text-emerald-700 text-xs gap-1"><CheckCircle2 className="w-3 h-3" /> Ecuación Contable Cuadrada</Badge>
                                    ) : (
                                        <Badge className="bg-red-100 text-red-700 text-xs">⚠ Ecuación Descuadrada — Revisar asientos</Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ====== ESTADO DE RESULTADOS ====== */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-amber-600" />
                            Estado de Resultados (Pérdidas y Ganancias)
                        </h2>

                        {incomeStatement ? (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                {/* Ingresos */}
                                <div className="p-5 border-b border-slate-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-emerald-700 flex items-center gap-2">
                                            <ArrowUpRight className="w-4 h-4" /> Ingresos
                                        </h3>
                                        <span className="text-lg font-black text-emerald-700">{formatCurrency(incomeStatement.ingresos.total)}</span>
                                    </div>
                                    {incomeStatement.ingresos.items.map((item: any) => (
                                        <div key={item.code} className="flex items-center justify-between text-sm py-1 pl-6">
                                            <span className="text-slate-600"><span className="font-mono text-xs text-slate-400 mr-2">{item.code}</span>{item.name}</span>
                                            <span className="font-bold text-slate-700">{formatCurrency(item.balance)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Costos */}
                                <div className="p-5 border-b border-slate-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-amber-700 flex items-center gap-2">
                                            <ArrowDownRight className="w-4 h-4" /> Costo de Ventas
                                        </h3>
                                        <span className="text-lg font-black text-amber-700">({formatCurrency(incomeStatement.costos.total)})</span>
                                    </div>
                                    {incomeStatement.costos.items.map((item: any) => (
                                        <div key={item.code} className="flex items-center justify-between text-sm py-1 pl-6">
                                            <span className="text-slate-600"><span className="font-mono text-xs text-slate-400 mr-2">{item.code}</span>{item.name}</span>
                                            <span className="font-bold text-slate-700">({formatCurrency(item.balance)})</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Utilidad Bruta */}
                                <div className="p-5 bg-slate-50 border-b border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-800">UTILIDAD BRUTA</span>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="text-xs">Margen: {incomeStatement.margenBruto}%</Badge>
                                            <span className={`text-lg font-black ${incomeStatement.utilidadBruta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                                {formatCurrency(incomeStatement.utilidadBruta)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Gastos Operativos */}
                                <div className="p-5 border-b border-slate-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-red-700 flex items-center gap-2">
                                            <ArrowDownRight className="w-4 h-4" /> Gastos Operativos
                                        </h3>
                                        <span className="text-lg font-black text-red-700">({formatCurrency(incomeStatement.gastos.total)})</span>
                                    </div>
                                    {incomeStatement.gastos.items.map((item: any) => (
                                        <div key={item.code} className="flex items-center justify-between text-sm py-1 pl-6">
                                            <span className="text-slate-600"><span className="font-mono text-xs text-slate-400 mr-2">{item.code}</span>{item.name}</span>
                                            <span className="font-bold text-slate-700">({formatCurrency(item.balance)})</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Resultado Final */}
                                <div className="p-5 bg-slate-900 text-white relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                    <div className="relative z-10 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-300">Utilidad Operativa</span>
                                            <span className="font-black text-white">{formatCurrency(incomeStatement.utilidadOperativa)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400">Impuesto a la Renta (29.5%)</span>
                                            <span className="text-red-400">({formatCurrency(incomeStatement.impuestoRenta)})</span>
                                        </div>
                                        <div className="border-t border-slate-700 pt-3 flex items-center justify-between">
                                            <span className="font-extrabold text-lg text-amber-400">UTILIDAD NETA</span>
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-amber-500/20 text-amber-300 text-xs">Margen Neto: {incomeStatement.margenNeto}%</Badge>
                                                <span className={`text-2xl font-black ${incomeStatement.utilidadNeta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {formatCurrency(incomeStatement.utilidadNeta)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                                <p className="font-medium">Cargando Estado de Resultados...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
