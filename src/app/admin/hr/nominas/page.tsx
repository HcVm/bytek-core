"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Receipt, Play, CheckCircle2, Users2, DollarSign, Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export default function NominasPage() {
    const runs = useQuery(api.hr.getPayrollRuns) || [];
    const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
    const detail = useQuery(api.hr.getPayrollDetail, selectedRunId ? { payrollRunId: selectedRunId as any } : "skip");
    const runPayroll = useMutation(api.hr.runPayroll);
    const markAsPaid = useMutation(api.hr.markPayrollAsPaid);
    const [running, setRunning] = useState(false);

    const handleRun = async () => {
        setRunning(true);
        try {
            // Use a dummy user ID — in production you'd get this from auth
            const users = await fetch("/api/auth/me").catch(() => null);
            await runPayroll({
                periodMonth: currentMonth,
                periodYear: currentYear,
                executedBy: runs[0]?.executedBy || ("" as any), // fallback
            });
        } catch (e: any) {
            alert(e.message || "Error al ejecutar nómina.");
        }
        setRunning(false);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="flex justify-between items-start max-w-7xl mx-auto w-full">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                <Receipt className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Generador de Nóminas</h1>
                        </div>
                        <p className="text-slate-500 font-medium pl-14">Motor de cálculo: EsSalud 9%, ONP/AFP, IR 5ta Categoría — Perú</p>
                    </div>
                    <Button onClick={handleRun} disabled={running} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                        <Play className="w-4 h-4" /> {running ? "Procesando..." : `Ejecutar ${currentMonth}/${currentYear}`}
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8 space-y-8">

                    {/* Historial de planillas */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Historial de Planillas</h2>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            {runs.length === 0 ? (
                                <div className="p-16 text-center text-slate-400">
                                    <Calculator className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                                    <p className="font-medium">Sin planillas generadas.</p>
                                    <p className="text-sm">Ejecuta la primera nómina con el botón de arriba.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {runs.map((run: any) => (
                                        <div key={run._id}
                                            onClick={() => setSelectedRunId(run._id)}
                                            className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors
                                                ${selectedRunId === run._id ? 'bg-violet-50 border-l-4 border-violet-600' : 'hover:bg-slate-50/80'}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${run.status === 'pagado' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {run.status === 'pagado' ? <CheckCircle2 className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900">Planilla {run.period}</p>
                                                <p className="text-[10px] text-slate-400">
                                                    {run.employeeCount} empleados · Ejecutada por {run.executedByName}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className={`text-[10px] ${run.status === 'pagado' ? 'border-emerald-300 text-emerald-700' : 'border-amber-300 text-amber-700'}`}>
                                                {run.status === "pagado" ? "Pagado" : "Borrador"}
                                            </Badge>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900">{formatCurrency(run.totalNet)}</p>
                                                <p className="text-[10px] text-slate-400">Neto a pagar</p>
                                            </div>
                                            {run.status === "borrador" && (
                                                <Button size="sm" variant="outline" className="text-xs"
                                                    onClick={(e) => { e.stopPropagation(); markAsPaid({ payrollRunId: run._id }); }}>
                                                    Marcar pagado
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detalle de planilla seleccionada */}
                    {detail && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Users2 className="w-5 h-5 text-violet-600" />
                                Detalle: Planilla {detail.run.period}
                            </h2>

                            {/* Resumen */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Bruto Total</p>
                                    <p className="text-xl font-black text-slate-900">{formatCurrency(detail.run.totalGross)}</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Deducciones</p>
                                    <p className="text-xl font-black text-red-700">{formatCurrency(detail.run.totalDeductions)}</p>
                                </div>
                                <div className="bg-violet-50 p-5 rounded-2xl border-2 border-violet-200 shadow-sm">
                                    <p className="text-xs font-bold text-violet-600 uppercase mb-1">Neto a Pagar</p>
                                    <p className="text-xl font-black text-violet-700">{formatCurrency(detail.run.totalNet)}</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Empleados</p>
                                    <p className="text-xl font-black text-slate-900">{detail.run.employeeCount}</p>
                                </div>
                            </div>

                            {/* Tabla de boletas */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Empleado</th>
                                            <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 uppercase">Bruto</th>
                                            <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 uppercase">EsSalud</th>
                                            <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 uppercase">Pensión</th>
                                            <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 uppercase">IR 5ta</th>
                                            <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase">Neto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {detail.details.map((d: any) => (
                                            <tr key={d._id} className="hover:bg-slate-50/80">
                                                <td className="px-5 py-3 font-medium text-slate-900">
                                                    {d.employeeName}
                                                    <Badge variant="outline" className="ml-2 text-[9px]">{d.pensionType.toUpperCase()}</Badge>
                                                </td>
                                                <td className="text-right px-3 py-3 text-slate-700">{formatCurrency(d.grossSalary)}</td>
                                                <td className="text-right px-3 py-3 text-blue-600 text-xs">{formatCurrency(d.essaludAmount)}</td>
                                                <td className="text-right px-3 py-3 text-amber-600 text-xs">{formatCurrency(d.pensionAmount)}</td>
                                                <td className="text-right px-3 py-3 text-red-600 text-xs">{formatCurrency(d.incomeTaxAmount)}</td>
                                                <td className="text-right px-5 py-3 font-black text-slate-900">{formatCurrency(d.netPay)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
