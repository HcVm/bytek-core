"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AlertTriangle, BookMarked, Briefcase, CalendarClock, Download, FileSignature, Handshake, Landmark, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadLegalDocDialog } from "./UploadLegalDocDialog";
import { ManageSLAsDialog } from "./ManageSLAsDialog";

export default function LegalDashboard() {
    const [activeTab, setActiveTab] = useState<"corporativo" | "comercial">("corporativo");

    const docs = useQuery(api.legal.getLegalDocuments, { filterType: activeTab }) || [];
    const expiringDocs = useQuery(api.legal.getExpiringLegalDocuments, { daysThreshold: 45 }) || [];

    const deleteDoc = useMutation(api.legal.deleteLegalDocument);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "vigente": return <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 uppercase tracking-widest text-[9px] font-black shadow-none"><ShieldCheck className="w-3 h-3 mr-1" /> Vigente</Badge>;
            case "tramite": return <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/60 uppercase tracking-widest text-[9px] font-black shadow-none"><CalendarClock className="w-3 h-3 mr-1" /> Trámite</Badge>;
            case "vencido": return <Badge className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/60 uppercase tracking-widest text-[9px] font-black shadow-none"><AlertTriangle className="w-3 h-3 mr-1" /> Vencido</Badge>;
            default: return null;
        }
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            marca: "Reg. Marca", copia_literal: "Copia Literal", vigencia_poder: "Vigencia Poder",
            carta_garantia: "Carta Garantía", contrato_cliente: "Contrato", nda: "NDA", otro: "Otros"
        };
        return labels[type] || type;
    };

    return (
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
            {/* Cabecera Master */}
            <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-8 py-6 shrink-0 z-10">
                <div className="flex justify-between items-start max-w-7xl mx-auto w-full">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-slate-900 dark:bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                <BookMarked className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Legal & Compliance</h1>
                        </div>
                        <p className="text-slate-500 dark:text-zinc-400 font-medium pl-14">Bóveda Documental Corporativa de Propiedad Intelectual y Acuerdos Comerciales.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Radar de Alertas */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${expiringDocs.length > 0 ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'}`}>
                            {expiringDocs.length > 0 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                            <div className="flex flex-col">
                                <span className="text-xs font-bold uppercase tracking-wider">{expiringDocs.length} Alertas</span>
                                <span className="text-[10px] opacity-80">Próx. 45 días</span>
                            </div>
                        </div>

                        <UploadLegalDocDialog currentTab={activeTab} />
                    </div>
                </div>
            </div>

            {/* Contenido Dinámico */}
            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8 h-full flex flex-col">

                    {/* Alertas Warning Block */}
                    {expiringDocs.length > 0 && (
                        <div className="mb-8 p-4 rounded-xl border-2 border-red-200 dark:border-red-800 bg-white dark:bg-zinc-900 shadow-sm flex items-start gap-4">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-red-900 dark:text-red-400 mb-1">Radar de Cumplimiento: Acción Requerida</h3>
                                <p className="text-sm text-red-700/80 dark:text-red-300/60 mb-3">Los siguientes documentos legales están próximos a su expiración o han caducado. Actualícelos en Registros Públicos a la brevedad.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {expiringDocs.map(doc => (
                                        <div key={doc._id} className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-100 dark:border-red-800/50 flex items-center justify-between transition-colors">
                                            <div className="truncate pr-4">
                                                <div className="text-sm font-bold text-red-950 dark:text-red-100 truncate">{doc.title}</div>
                                                <div className="text-xs text-red-800/80 dark:text-red-400/80 flex items-center gap-1 mt-0.5">
                                                    <CalendarClock className="w-3 h-3" />Expira: {new Date(doc.expirationDate!).toLocaleDateString('es-PE')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs Framework */}
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-6">
                            <TabsList className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 h-12 p-1 rounded-xl shadow-sm">
                                <TabsTrigger value="corporativo" className="data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg px-6 font-semibold flex items-center gap-2 transition-all">
                                    <Landmark className="w-4 h-4" /> Bóveda Corporativa (IP)
                                </TabsTrigger>
                                <TabsTrigger value="comercial" className="data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg px-6 font-semibold flex items-center gap-2 transition-all">
                                    <Handshake className="w-4 h-4" /> Acuerdos Comerciales
                                </TabsTrigger>
                            </TabsList>

                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <Input placeholder="Buscar por título..." className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm" />
                            </div>
                        </div>

                        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                            {/* Header de Tabla Pura */}
                            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                <div className="col-span-5">Documento Legal</div>
                                <div className="col-span-2">Categoría</div>
                                <div className="col-span-2">Estado Registral</div>
                                <div className="col-span-2">Vencimiento</div>
                                <div className="col-span-1 text-right">Firma</div>
                            </div>

                            {/* Listado */}
                            <div className="flex-1 overflow-y-auto">
                                {docs.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400">
                                        <FileSignature className="w-12 h-12 mb-4 text-slate-200" />
                                        <p className="text-lg font-medium text-slate-600">Bóveda Vacía</p>
                                        <p className="text-sm">No existen registros archivados en esta pestaña legal.</p>
                                    </div>
                                ) : (
                                    docs.map(doc => (
                                        <div key={doc._id} className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-100 dark:border-zinc-800/50 items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                                            <div className="col-span-5 flex items-center gap-3 overflow-hidden">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${activeTab === 'corporativo' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'}`}>
                                                    <Briefcase className="w-4 h-4" />
                                                </div>
                                                <div className="truncate">
                                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">{doc.title}</h4>
                                                    {doc.clientName ? (
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">Vínculo CRM: <span className="font-semibold">{doc.clientName}</span></p>
                                                    ) : (
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate text-[10px] opacity-60">ID: {doc._id.slice(-8)}</p> // Muestra algo si no hay cliente (Bóveda corporativa)
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-span-2">
                                                <Badge variant="outline" className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">{getTypeLabel(doc.type)}</Badge>
                                            </div>

                                            <div className="col-span-2">
                                                {getStatusBadge(doc.status)}
                                            </div>

                                            <div className="col-span-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                                {doc.expirationDate ? new Date(doc.expirationDate).toLocaleDateString('es-PE') : <span className="text-zinc-400 dark:text-zinc-600 italic">Indefinido</span>}
                                            </div>

                                            <div className="col-span-1 flex justify-end gap-2">
                                                {(doc.type === "contrato_cliente" || doc.type === "nda") && (
                                                    <ManageSLAsDialog documentId={doc._id} title={doc.title} />
                                                )}
                                                <a href={doc.url as string} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-lg transition-colors flex items-center justify-center shrink-0" title="Descargar / Ver PDF original">
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </Tabs>

                </div>
            </div >
        </div >
    );
}
