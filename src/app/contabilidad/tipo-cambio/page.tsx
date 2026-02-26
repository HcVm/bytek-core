"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ArrowRightLeft, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function TipoCambioPage() {
    const rates = useQuery(api.exchangeRates.getExchangeRates, {}) || [];
    const latestUSDtoPEN = useQuery(api.exchangeRates.getLatestRate, { fromCurrency: "USD", toCurrency: "PEN" });
    const createRate = useMutation(api.exchangeRates.createExchangeRate);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ buyRate: "", sellRate: "", date: new Date().toISOString().split("T")[0], source: "manual" as any });

    const handleCreate = async () => {
        if (!form.buyRate || !form.sellRate) return;
        await createRate({
            fromCurrency: "USD", toCurrency: "PEN",
            buyRate: parseFloat(form.buyRate), sellRate: parseFloat(form.sellRate),
            date: form.date, source: form.source,
        });
        setForm({ buyRate: "", sellRate: "", date: new Date().toISOString().split("T")[0], source: "manual" });
        setShowForm(false);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="flex justify-between items-start max-w-7xl mx-auto w-full">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                <ArrowRightLeft className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Tipo de Cambio</h1>
                        </div>
                        <p className="text-slate-500 font-medium pl-14">Registro de tipo de cambio USD/PEN para operaciones multi-moneda.</p>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <Plus className="w-4 h-4" /> Registrar TC
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8 space-y-8">

                    {/* TC Actual */}
                    {latestUSDtoPEN && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 relative z-10">TC Compra</p>
                                <h3 className="text-3xl font-black text-white relative z-10">S/ {latestUSDtoPEN.buyRate.toFixed(4)}</h3>
                                <p className="text-[10px] text-slate-500 mt-1 relative z-10">{latestUSDtoPEN.date}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">TC Venta</p>
                                <h3 className="text-3xl font-black text-slate-900">S/ {latestUSDtoPEN.sellRate.toFixed(4)}</h3>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Spread</p>
                                <h3 className="text-3xl font-black text-blue-600">
                                    {(latestUSDtoPEN.sellRate - latestUSDtoPEN.buyRate).toFixed(4)}
                                </h3>
                            </div>
                        </div>
                    )}

                    {/* Historial */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Historial de Tipos de Cambio</h2>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            {rates.length === 0 ? (
                                <div className="p-16 text-center text-slate-400">
                                    <ArrowRightLeft className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                                    <p className="font-medium">Sin registros de tipo de cambio.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                                            <th className="text-left px-3 py-3 text-xs font-bold text-slate-500 uppercase">Par</th>
                                            <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 uppercase">Compra</th>
                                            <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 uppercase">Venta</th>
                                            <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase">Fuente</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {rates.map((r: any) => (
                                            <tr key={r._id} className="hover:bg-slate-50/80">
                                                <td className="px-5 py-3 font-medium text-slate-900">{r.date}</td>
                                                <td className="px-3 py-3 text-slate-600">{r.fromCurrency}/{r.toCurrency}</td>
                                                <td className="text-right px-3 py-3 font-mono text-slate-900">{r.buyRate.toFixed(4)}</td>
                                                <td className="text-right px-3 py-3 font-mono text-slate-900">{r.sellRate.toFixed(4)}</td>
                                                <td className="text-right px-5 py-3">
                                                    <Badge variant="outline" className="text-[10px]">{r.source.toUpperCase()}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Modal */}
                    {showForm && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-slate-900">Registrar Tipo de Cambio</h3>
                                    <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">TC Compra</Label>
                                        <Input type="number" step="0.0001" value={form.buyRate} onChange={e => setForm({ ...form, buyRate: e.target.value })} placeholder="3.7500" />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">TC Venta</Label>
                                        <Input type="number" step="0.0001" value={form.sellRate} onChange={e => setForm({ ...form, sellRate: e.target.value })} placeholder="3.8000" />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">Fecha</Label>
                                        <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">Fuente</Label>
                                        <Select value={form.source} onValueChange={v => setForm({ ...form, source: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="manual">Manual</SelectItem>
                                                <SelectItem value="sunat">SUNAT</SelectItem>
                                                <SelectItem value="sbs">SBS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                                    <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">Guardar</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
