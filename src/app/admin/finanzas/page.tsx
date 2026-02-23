"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ArrowDownRight, ArrowUpRight, BarChart3, Building2, Car, HardDrive, Hash, CheckCircle2, CircleDashed, Home, PiggyBank, Search, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { formatCurrency } from "@/lib/utils";

export default function FinanzasDashboard() {
    const expenses = useQuery(api.finance.getExpenses) || [];
    const updateStatus = useMutation(api.finance.updateExpenseStatus);

    // Cálculos Rápidos
    const totalEgresosSoles = expenses.filter(e => e.currency === "PEN").reduce((acc, curr) => acc + curr.amount, 0);
    const egresosPagados = expenses.filter(e => e.status === "pagado").reduce((acc, curr) => acc + curr.amount, 0);
    const egresosPendientes = expenses.filter(e => e.status === "pendiente" && e.currency === "PEN").reduce((acc, curr) => acc + curr.amount, 0);

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case "nube": return <HardDrive className="w-4 h-4 text-purple-500" />;
            case "hardware": return <Hash className="w-4 h-4 text-blue-500" />;
            case "viaticos": return <Car className="w-4 h-4 text-emerald-500" />;
            case "alquiler": return <Home className="w-4 h-4 text-orange-500" />;
            case "planilla": return <Building2 className="w-4 h-4 text-indigo-500" />;
            default: return <Wallet className="w-4 h-4 text-zinc-500" />;
        }
    };

    const handleToggleStatus = async (id: any, currentStatus: string) => {
        await updateStatus({
            expenseId: id,
            status: currentStatus === "pagado" ? "pendiente" : "pagado"
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            {/* Cabecera Financiera */}
            <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="flex justify-between items-start max-w-7xl mx-auto w-full">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Tesorería Corporativa</h1>
                        </div>
                        <p className="text-slate-500 font-medium pl-14">Panel de Gastos Operativos (OPEX), flujo de caja y rentabilidad de proyectos.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <AddExpenseDialog />
                    </div>
                </div>
            </div>

            {/* Contenido Dinámico */}
            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8 h-full flex flex-col">

                    {/* Tarjetas de Resumen Financiero */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0">
                                <ArrowDownRight className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Salidas / OPEX</p>
                                <h3 className="text-2xl font-black text-slate-900">{formatCurrency(totalEgresosSoles)}</h3>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                                <PiggyBank className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Cuentas por Pagar (Deuda)</p>
                                <h3 className="text-2xl font-black text-amber-700">{formatCurrency(egresosPendientes)}</h3>
                            </div>
                        </div>

                        {/* Tarjeta de Margen Brillante (Mock) */}
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex items-center gap-4 relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 shrink-0 z-10">
                                <ArrowUpRight className="w-6 h-6" />
                            </div>
                            <div className="z-10">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Margen Neto Estimado</p>
                                <h3 className="text-2xl font-black text-white">+ S/ 254,300.00</h3>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Egresos Main */}
                    <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">Historial de Salidas de Capital (Accounts Payable)</h3>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input placeholder="Buscar concepto..." className="pl-9 h-9 bg-white border-slate-200 text-sm" />
                            </div>
                        </div>

                        {/* Header de Tabla */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <div className="col-span-1">Estado</div>
                            <div className="col-span-4">Concepto e Imputación</div>
                            <div className="col-span-2">Categoría</div>
                            <div className="col-span-2">Fecha Gasto</div>
                            <div className="col-span-2 text-right">Monto</div>
                            <div className="col-span-1 text-center">Acción</div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {expenses.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                                    <PiggyBank className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="font-medium">Libro Contable vacío.</p>
                                    <p className="text-sm">Registra tu primer gasto para ver tus balances.</p>
                                </div>
                            ) : (
                                expenses.map((exp: any) => (
                                    <div key={exp._id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-50 items-center hover:bg-slate-50/80 transition-colors">
                                        <div className="col-span-1">
                                            {exp.status === 'pagado' ?
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center" title="Pagado / Liquidado"><CheckCircle2 className="w-5 h-5" /></div> :
                                                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center animate-pulse" title="Pendiente de Pago"><CircleDashed className="w-5 h-5" /></div>
                                            }
                                        </div>

                                        <div className="col-span-4">
                                            <h4 className="text-sm font-bold text-slate-900">{exp.title}</h4>
                                            {exp.projectName ? (
                                                <p className="text-[11px] font-semibold text-indigo-600 mt-0.5">OpEx atado al Proy: {exp.projectName}</p>
                                            ) : (
                                                <p className="text-[11px] text-slate-400 mt-0.5">Gasto global administrativo</p>
                                            )}
                                        </div>

                                        <div className="col-span-2 flex items-center gap-2">
                                            <div className="p-1.5 bg-slate-100 rounded-md">{getCategoryIcon(exp.category)}</div>
                                            <span className="text-xs font-semibold text-slate-600 uppercase">{exp.category}</span>
                                        </div>

                                        <div className="col-span-2 text-sm text-slate-600 font-medium">
                                            {new Date(exp.expenseDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>

                                        <div className="col-span-2 text-right">
                                            <div className="text-sm font-black text-slate-900 border border-slate-200 bg-white px-3 py-1.5 rounded-lg inline-block shadow-sm">
                                                {exp.currency === 'PEN' ? 'S/' : '$'} {exp.amount.toFixed(2)}
                                            </div>
                                        </div>

                                        <div className="col-span-1 flex justify-center">
                                            <button
                                                onClick={() => handleToggleStatus(exp._id, exp.status)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${exp.status === 'pagado' ? 'text-slate-500 border-slate-200 hover:bg-slate-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'}`}
                                            >
                                                {exp.status === 'pagado' ? 'Revertir' : 'Pagar'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
