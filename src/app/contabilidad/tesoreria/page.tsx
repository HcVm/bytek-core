"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Landmark, Plus, ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { BankAccountFormDialog } from "./BankAccountFormDialog";

export default function TesoreriaPage() {
    const bankAccounts = useQuery(api.treasury.getBankAccounts) || [];
    const transactions = useQuery(api.treasury.getBankTransactions, {}) || [];

    const totalPEN = bankAccounts.filter(a => a.currency === "PEN").reduce((s, a) => s + a.currentBalance, 0);
    const totalUSD = bankAccounts.filter(a => a.currency === "USD").reduce((s, a) => s + a.currentBalance, 0);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 overflow-hidden">
            <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="flex justify-between items-start max-w-7xl mx-auto w-full">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                <Landmark className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Tesorería y Bancos</h1>
                        </div>
                        <p className="text-slate-500 dark:text-zinc-400 font-medium pl-14">Gestión de cuentas bancarias, caja chica y flujo de efectivo.</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8 space-y-8">

                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 relative z-10">Posición Total PEN</p>
                            <h3 className="text-2xl font-black text-white relative z-10">{formatCurrency(totalPEN)}</h3>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                            <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Posición Total USD</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">$ {totalUSD.toFixed(2)}</h3>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                            <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Cuentas Activas</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{bankAccounts.filter(a => a.isActive).length}</h3>
                        </div>
                    </div>

                    {/* Bank Accounts Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cuentas Bancarias</h2>
                            <BankAccountFormDialog />
                        </div>
                        {bankAccounts.length === 0 ? (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-12 text-center text-slate-400">
                                <Landmark className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                                <p className="font-medium">Sin cuentas bancarias registradas.</p>
                                <p className="text-sm">Registra tus cuentas bancarias para gestionar tesorería.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {bankAccounts.map((account: any) => (
                                    <div key={account._id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-5 h-5 text-amber-600" />
                                                <span className="font-bold text-slate-900 dark:text-white">{account.bankName}</span>
                                            </div>
                                            <Badge variant="outline" className="text-[10px]">{account.accountType}</Badge>
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-zinc-500 font-mono mb-3">{account.accountNumber}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{account.currency}</span>
                                            <span className="text-xl font-black text-slate-900 dark:text-white">
                                                {account.currency === "PEN" ? "S/" : "$"} {account.currentBalance.toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2">Cuenta contable: {account.accountingAccountCode}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent transactions */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Últimos Movimientos</h2>
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                            {transactions.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <p className="font-medium">Sin movimientos bancarios.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50 dark:divide-zinc-800">
                                    {transactions.slice(0, 20).map((tx: any) => (
                                        <div key={tx._id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'ingreso' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400'}`}>
                                                {tx.type === "ingreso" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-700 dark:text-zinc-300 truncate">{tx.description}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-zinc-500">{tx.date} · {tx.bankName} · {tx.reference || "Sin ref."}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {tx.reconciled && <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px]">Conciliado</Badge>}
                                                <span className={`text-sm font-black ${tx.type === 'ingreso' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                                                    {tx.type === 'ingreso' ? '+' : '-'} S/ {tx.amount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
