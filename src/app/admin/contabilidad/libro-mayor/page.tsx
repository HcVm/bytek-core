"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

export default function LibroMayorPage() {
    const accounts = useQuery(api.accounting.getMovementAccounts) || [];
    const [searchTerm, setSearchTerm] = useState("");

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

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                            Selecciona una cuenta para ver sus movimientos en el Libro Mayor
                        </div>
                        {filtered.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <p className="font-medium">No hay cuentas de detalle disponibles.</p>
                                <p className="text-sm">Carga el Plan de Cuentas primero.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {filtered.map((account: any) => (
                                    <div key={account._id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer">
                                        <span className="font-mono text-sm font-bold text-amber-700 min-w-[60px]">{account.code}</span>
                                        <span className="flex-1 text-sm text-slate-700">{account.name}</span>
                                        <span className="text-xs text-slate-400">{account.nature === "deudora" ? "DEBE" : "HABER"}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
