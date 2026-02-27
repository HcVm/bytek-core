"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BookOpen, ChevronRight, ChevronDown, Search, Plus, Download, Layers, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const TYPE_COLORS: Record<string, string> = {
    activo: "bg-blue-100 text-blue-700 border-blue-200",
    pasivo: "bg-red-100 text-red-700 border-red-200",
    patrimonio: "bg-purple-100 text-purple-700 border-purple-200",
    ingreso: "bg-emerald-100 text-emerald-700 border-emerald-200",
    gasto: "bg-orange-100 text-orange-700 border-orange-200",
    costo: "bg-amber-100 text-amber-700 border-amber-200",
    cuentas_orden: "bg-gray-100 text-gray-700 border-gray-200",
};

const TYPE_LABELS: Record<string, string> = {
    activo: "Activo",
    pasivo: "Pasivo",
    patrimonio: "Patrimonio",
    ingreso: "Ingreso",
    gasto: "Gasto",
    costo: "Costo",
    cuentas_orden: "Ctas. de Orden",
};

export default function PlanCuentasPage() {
    const accounts = useQuery(api.accounting.getChartOfAccounts) || [];
    const seedPCGE = useMutation(api.accounting.seedChartOfAccounts);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());
    const [seeding, setSeeding] = useState(false);

    const filteredAccounts = searchTerm
        ? accounts.filter(a => a.code.includes(searchTerm) || a.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : accounts;

    // Construir árbol jerárquico
    const rootAccounts = filteredAccounts.filter(a => !a.parentCode || !filteredAccounts.find(p => p.code === a.parentCode));
    const getChildren = (parentCode: string) => filteredAccounts.filter(a => a.parentCode === parentCode);

    const toggleExpand = (code: string) => {
        setExpandedCodes(prev => {
            const next = new Set(prev);
            if (next.has(code)) next.delete(code); else next.add(code);
            return next;
        });
    };

    const expandAll = () => {
        setExpandedCodes(new Set(accounts.filter(a => !a.acceptsMovements).map(a => a.code)));
    };

    const collapseAll = () => setExpandedCodes(new Set());

    const handleSeed = async () => {
        setSeeding(true);
        try {
            const result = await seedPCGE();
            alert(`Plan de Cuentas cargado exitosamente: ${result.inserted} cuentas insertadas.`);
        } catch (err: any) {
            alert(err.message || "Error al cargar el plan de cuentas.");
        }
        setSeeding(false);
    };

    const renderAccount = (account: any, depth: number = 0) => {
        const children = getChildren(account.code);
        const hasChildren = children.length > 0;
        const isExpanded = expandedCodes.has(account.code);

        return (
            <div key={account._id}>
                <div
                    className={`flex items-center gap-3 px-4 py-2.5 border-b border-slate-50 dark:border-zinc-800 hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer ${depth === 0 ? 'bg-slate-50/50 dark:bg-zinc-800/30 font-semibold' : ''}`}
                    style={{ paddingLeft: `${16 + depth * 24}px` }}
                    onClick={() => hasChildren && toggleExpand(account.code)}
                >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {hasChildren ? (
                            isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />
                        ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        )}
                    </div>

                    <span className={`font-mono text-sm ${depth === 0 ? 'text-slate-900 dark:text-white font-bold text-base' : 'text-slate-600 dark:text-zinc-400'} min-w-[60px]`}>
                        {account.code}
                    </span>

                    <span className={`flex-1 text-sm ${depth === 0 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-zinc-300'}`}>
                        {account.name}
                    </span>

                    <Badge variant="outline" className={`text-[10px] px-2 py-0 ${TYPE_COLORS[account.type] || ''}`}>
                        {TYPE_LABELS[account.type] || account.type}
                    </Badge>

                    {account.acceptsMovements && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Acepta movimientos" />
                    )}

                    <span className="text-[10px] font-mono text-slate-400 min-w-[60px] text-right">
                        {account.nature === "deudora" ? "DEBE" : "HABER"}
                    </span>
                </div>

                {hasChildren && isExpanded && (
                    <div>
                        {children.sort((a: any, b: any) => a.code.localeCompare(b.code)).map((child: any) => renderAccount(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    // Conteo por tipo
    const countByType = accounts.reduce((acc: Record<string, number>, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 overflow-hidden">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="flex justify-between items-start max-w-7xl mx-auto w-full">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Plan de Cuentas</h1>
                        </div>
                        <p className="text-slate-500 font-medium pl-14">Plan Contable General Empresarial (PCGE) — Base normativa SUNAT.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {accounts.length === 0 && (
                            <button
                                onClick={handleSeed}
                                disabled={seeding}
                                className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-all shadow-md disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                {seeding ? "Cargando PCGE..." : "Cargar PCGE Base"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8 flex flex-col h-full">

                    {accounts.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center max-w-md">
                                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="w-10 h-10 text-amber-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Plan de Cuentas Vacío</h2>
                                <p className="text-slate-500 mb-6">No hay cuentas contables registradas. Presiona el botón para cargar el PCGE (Plan Contable General Empresarial) con las cuentas base para una empresa de tecnología.</p>
                                <button
                                    onClick={handleSeed}
                                    disabled={seeding}
                                    className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold text-base hover:bg-amber-700 transition-all shadow-lg disabled:opacity-50"
                                >
                                    <Download className="w-5 h-5 inline mr-2" />
                                    {seeding ? "Cargando..." : "Inicializar PCGE"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                                    <div key={key} className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm text-center">
                                        <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">{label}</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">{countByType[key] || 0}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Toolbar */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="relative w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Buscar por código o nombre..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="pl-9 h-10 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={expandAll} className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                        Expandir Todo
                                    </button>
                                    <button onClick={collapseAll} className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                        Colapsar Todo
                                    </button>
                                    <div className="text-xs text-slate-400 font-medium ml-2">
                                        {accounts.length} cuentas | {accounts.filter(a => a.acceptsMovements).length} de detalle
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                                <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                    <div className="col-span-1">Código</div>
                                    <div className="col-span-6">Nombre de la Cuenta</div>
                                    <div className="col-span-2">Tipo</div>
                                    <div className="col-span-1 text-center">Detalle</div>
                                    <div className="col-span-2 text-right">Naturaleza</div>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {rootAccounts
                                        .sort((a: any, b: any) => a.code.localeCompare(b.code))
                                        .map((account: any) => renderAccount(account))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
