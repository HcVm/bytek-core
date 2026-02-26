"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BadgeDollarSign, Plus, TrendingUp, TrendingDown, CircleDollarSign, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

const currentYear = new Date().getFullYear();

export default function PresupuestosPage() {
    const budgets = useQuery(api.budgets.getBudgets, { year: currentYear });
    const comparison = useQuery(api.budgets.getBudgetComparison, { year: currentYear });
    const accountingAccounts = useQuery(api.accounting.getChartOfAccounts) || [];
    const [showForm, setShowForm] = useState(false);
    const createBudget = useMutation(api.budgets.createBudget);

    const [form, setForm] = useState({
        name: "", type: "operativo" as any, accountId: "", budgetedAmount: "",
    });

    const handleCreate = async () => {
        if (!form.name || !form.accountId || !form.budgetedAmount) return;
        await createBudget({
            name: form.name,
            year: currentYear,
            type: form.type,
            accountId: form.accountId as any,
            budgetedAmount: parseFloat(form.budgetedAmount),
        });
        setForm({ name: "", type: "operativo", accountId: "", budgetedAmount: "" });
        setShowForm(false);
    };

    const typeLabels: Record<string, string> = {
        operativo: "Operativo", capital: "Capital", proyecto: "Proyecto",
        personal: "Personal", forecast: "Forecast",
    };
    const typeColors: Record<string, string> = {
        operativo: "bg-blue-100 text-blue-700", capital: "bg-purple-100 text-purple-700",
        proyecto: "bg-amber-100 text-amber-700", personal: "bg-emerald-100 text-emerald-700",
        forecast: "bg-slate-100 text-slate-700",
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="flex justify-between items-start max-w-7xl mx-auto w-full">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                <BadgeDollarSign className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Presupuestos</h1>
                        </div>
                        <p className="text-slate-500 font-medium pl-14">Control presupuestal por tipo, centro de costos y cuenta contable — {currentYear}</p>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                        <Plus className="w-4 h-4" /> Nuevo presupuesto
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8 space-y-8">

                    {/* Comparativa general */}
                    {comparison && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 relative z-10">Presupuestado Total</p>
                                <h3 className="text-2xl font-black text-white relative z-10">{formatCurrency(comparison.totals.budgeted)}</h3>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Ejecutado</p>
                                <h3 className="text-2xl font-black text-slate-900">{formatCurrency(comparison.totals.actual)}</h3>
                            </div>
                            <div className={`p-6 rounded-2xl border-2 shadow-sm ${comparison.totals.variance >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Varianza</p>
                                <h3 className={`text-2xl font-black ${comparison.totals.variance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                    {formatCurrency(comparison.totals.variance)}
                                </h3>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">% Ejecución</p>
                                <h3 className="text-2xl font-black text-slate-900">{comparison.totals.executionPercent}%</h3>
                                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                    <div className="bg-amber-600 h-2 rounded-full transition-all" style={{ width: `${Math.min(comparison.totals.executionPercent, 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Por tipo */}
                    {comparison && comparison.byType.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Ejecución por Tipo</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {comparison.byType.map((bt: any) => (
                                    <div key={bt.type} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                        <Badge className={`${typeColors[bt.type] || 'bg-slate-100 text-slate-700'} text-[10px] mb-3`}>
                                            {typeLabels[bt.type] || bt.type}
                                        </Badge>
                                        <p className="text-lg font-black text-slate-900">{bt.executionPercent}%</p>
                                        <p className="text-[10px] text-slate-400">{formatCurrency(bt.actual)} / {formatCurrency(bt.budgeted)}</p>
                                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                                            <div className={`h-1.5 rounded-full ${bt.executionPercent > 100 ? 'bg-red-500' : 'bg-amber-500'}`}
                                                style={{ width: `${Math.min(bt.executionPercent, 100)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Lista de presupuestos */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Detalle de Presupuestos</h2>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            {!budgets || budgets.length === 0 ? (
                                <div className="p-16 text-center text-slate-400">
                                    <CircleDollarSign className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                                    <p className="font-medium">Sin presupuestos para {currentYear}.</p>
                                    <p className="text-sm">Crea un presupuesto para empezar el control.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {budgets.map((b: any) => (
                                        <div key={b._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 transition-colors">
                                            <div className={`w-2 h-10 rounded-full ${b.executionPercent > 100 ? 'bg-red-500' : b.executionPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900">{b.name}</p>
                                                <p className="text-[10px] text-slate-400">
                                                    {b.accountCode} · {b.accountName} · {b.costCenterName}
                                                </p>
                                            </div>
                                            <Badge className={`${typeColors[b.type] || ''} text-[10px]`}>{typeLabels[b.type] || b.type}</Badge>
                                            <div className="text-right min-w-[120px]">
                                                <p className="text-sm font-black text-slate-900">{formatCurrency(b.actualAmount)}</p>
                                                <p className="text-[10px] text-slate-400">de {formatCurrency(b.budgetedAmount)}</p>
                                            </div>
                                            <div className="w-24">
                                                <div className="flex items-center gap-1 justify-end">
                                                    {b.variance >= 0 ? (
                                                        <TrendingDown className="w-3 h-3 text-emerald-500" />
                                                    ) : (
                                                        <TrendingUp className="w-3 h-3 text-red-500" />
                                                    )}
                                                    <span className={`text-xs font-bold ${b.variance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                                        {b.executionPercent}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal de creación */}
                    {showForm && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-slate-900">Nuevo Presupuesto</h3>
                                    <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">Nombre</Label>
                                        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Presupuesto Operativo Q1" />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">Tipo</Label>
                                        <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="operativo">Operativo</SelectItem>
                                                <SelectItem value="capital">Capital</SelectItem>
                                                <SelectItem value="proyecto">Proyecto</SelectItem>
                                                <SelectItem value="personal">Personal</SelectItem>
                                                <SelectItem value="forecast">Forecast</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">Cuenta Contable</Label>
                                        <Select value={form.accountId} onValueChange={v => setForm({ ...form, accountId: v })}>
                                            <SelectTrigger><SelectValue placeholder="Seleccionar cuenta..." /></SelectTrigger>
                                            <SelectContent>
                                                {accountingAccounts.filter((a: any) => a.acceptsMovements).map((a: any) => (
                                                    <SelectItem key={a._id} value={a._id}>{a.code} — {a.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">Monto Presupuestado (S/)</Label>
                                        <Input type="number" value={form.budgetedAmount} onChange={e => setForm({ ...form, budgetedAmount: e.target.value })} placeholder="50000" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                                    <Button onClick={handleCreate} className="bg-amber-600 hover:bg-amber-700 text-white">Crear presupuesto</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
