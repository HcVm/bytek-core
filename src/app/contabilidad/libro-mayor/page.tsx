"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

export default function LibroMayorPage() {
    const accounts = useQuery(api.accounting.getMovementAccounts) || [];
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

    const ledgerData = useQuery(
        api.journal.getGeneralLedger,
        selectedAccount ? { accountId: selectedAccount as any } : "skip"
    );

    const filtered = searchTerm
        ? accounts.filter(a => a.code.includes(searchTerm) || a.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : accounts;

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-md">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Libro Mayor</h1>
                    </div>
                    <p className="text-slate-500 font-medium pl-14">Consulta individual de movimientos por cuenta contable.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8 space-y-6">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input placeholder="Buscar cuenta..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-10 bg-white border-slate-200" />
                    </div>

                    <div className="flex-1 flex gap-6 min-h-0">
                        {/* Panel izquierdo: Lista de cuentas */}
                        <div className={`flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all ${selectedAccount ? 'w-1/3' : 'w-full'}`}>
                            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Cuentas
                                </span>
                                <span className="text-xs text-slate-400 font-medium">{filtered.length} disponibles</span>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {filtered.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400">
                                        <p className="font-medium">No hay cuentas de detalle disponibles.</p>
                                        <p className="text-sm">Carga el Plan de Cuentas primero.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {filtered.map((account: any) => (
                                            <div
                                                key={account._id}
                                                onClick={() => setSelectedAccount(account._id)}
                                                className={`flex items-center gap-4 px-5 py-3 transition-colors cursor-pointer ${selectedAccount === account._id ? 'bg-amber-50/80 border-l-2 border-l-amber-500' : 'hover:bg-slate-50'}`}
                                            >
                                                <span className="font-mono text-sm font-bold text-amber-700 min-w-[50px]">{account.code}</span>
                                                <span className="flex-1 text-sm text-slate-700 truncate">{account.name}</span>
                                                {!selectedAccount && <span className="text-xs text-slate-400 shrink-0">{account.nature === "deudora" ? "DEBE" : "HABER"}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Panel derecho: Detalle del Libro Mayor */}
                        {selectedAccount && ledgerData && (
                            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                {/* Encabezado de la cuenta */}
                                <div className="p-6 border-b border-slate-100 bg-amber-50 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                                    <h2 className="text-2xl font-black text-amber-900 mb-1 flex items-center gap-3">
                                        <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-lg font-mono text-xl">{ledgerData.account.code}</span>
                                        {ledgerData.account.name}
                                    </h2>
                                    <div className="flex items-center gap-4 text-sm font-medium text-amber-700 mt-3">
                                        <span className="capitalize px-3 py-1 bg-white/50 rounded-full shadow-sm border border-amber-200/50">Cuenta de {ledgerData.account.type}</span>
                                        <span className="capitalize px-3 py-1 bg-white/50 rounded-full shadow-sm border border-amber-200/50">Naturaleza {ledgerData.account.nature}</span>
                                    </div>
                                </div>

                                {/* Resumen Saldo */}
                                <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/50">
                                    <div className="p-4 text-center">
                                        <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Total Debe</p>
                                        <p className="text-lg font-black text-blue-700">{formatCurrency(ledgerData.totalDebit)}</p>
                                    </div>
                                    <div className="p-4 text-center">
                                        <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Total Haber</p>
                                        <p className="text-lg font-black text-red-600">{formatCurrency(ledgerData.totalCredit)}</p>
                                    </div>
                                    <div className="p-4 text-center bg-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                                        <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Saldo Final</p>
                                        <p className={`text-xl font-black ${ledgerData.balance >= 0 ? 'text-emerald-600' : 'text-slate-900'}`}>{formatCurrency(ledgerData.balance)}</p>
                                    </div>
                                </div>

                                {/* Movimientos */}
                                <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
                                            <tr>
                                                <th className="px-6 py-3 font-bold">Fecha</th>
                                                <th className="px-6 py-3 font-bold">Asiento</th>
                                                <th className="px-6 py-3 font-bold">Glosa</th>
                                                <th className="px-6 py-3 font-bold text-right">Debe</th>
                                                <th className="px-6 py-3 font-bold text-right">Haber</th>
                                                <th className="px-6 py-3 font-bold text-right bg-slate-100">Saldo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ledgerData.movements.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                                        <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                                        <p>No hay movimientos contabilizados</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                ledgerData.movements.map((mov: any, idx: number) => (
                                                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">{mov.entryDate}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-mono text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">{mov.entryNumber}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="max-w-[200px] truncate" title={mov.description || mov.entryDescription}>
                                                                {mov.description || mov.entryDescription}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-medium text-blue-700">{mov.debit > 0 ? formatCurrency(mov.debit) : "-"}</td>
                                                        <td className="px-6 py-4 text-right font-medium text-red-600">{mov.credit > 0 ? formatCurrency(mov.credit) : "-"}</td>
                                                        <td className="px-6 py-4 text-right font-black text-slate-900 bg-slate-50/50">{formatCurrency(mov.runningBalance)}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
