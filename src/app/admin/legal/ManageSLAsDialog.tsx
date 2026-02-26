"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyPlus, Clock, Save, Trash2, CheckCircle2 } from "lucide-react";

export function ManageSLAsDialog({ documentId, title }: { documentId: any; title: string }) {
    const [open, setOpen] = useState(false);
    const slas = useQuery(api.contracts.getContractSLAs, open ? { contractDocumentId: documentId } : "skip");

    const createSLA = useMutation(api.contracts.createContractSLA);
    const deleteSLA = useMutation(api.contracts.deleteContractSLA);
    const updateSLA = useMutation(api.contracts.updateSLACompliance);

    // Form state
    const [metricName, setMetricName] = useState("");
    const [targetValue, setTargetValue] = useState("");
    const [unit, setUnit] = useState<"horas" | "porcentaje" | "minutos">("horas");
    const [measurementPeriod, setMeasurementPeriod] = useState<"mensual" | "trimestral" | "anual">("mensual");
    const [penaltyClause, setPenaltyClause] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update state
    const [updateValues, setUpdateValues] = useState<Record<string, string>>({});

    const handleCreate = async () => {
        if (!metricName || !targetValue) return;
        setIsSubmitting(true);
        try {
            await createSLA({
                contractDocumentId: documentId,
                metricName,
                targetValue: Number(targetValue),
                unit,
                measurementPeriod,
                penaltyClause: penaltyClause || undefined,
            });
            setMetricName("");
            setTargetValue("");
            setPenaltyClause("");
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (slaId: any) => {
        const val = updateValues[slaId];
        if (!val) return;
        try {
            await updateSLA({
                slaId,
                currentValue: Number(val),
            });
            setUpdateValues(prev => ({ ...prev, [slaId]: "" }));
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button title="Gestionar SLAs" className="p-2 bg-cyan-50 text-cyan-600 hover:bg-cyan-100 hover:text-cyan-800 rounded-lg transition-colors flex items-center justify-center">
                    <CopyPlus className="w-4 h-4" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-slate-50 border-slate-200">
                <div className="p-6 border-b border-slate-200 bg-white shadow-sm shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900">
                            Gestión de SLAs
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium pt-1">
                            Acuerdos de Nivel de Servicio para: <span className="text-slate-900 italic font-bold">{title}</span>
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
                    {/* Panel Izquierdo: Formulario de Creación */}
                    <div className="w-full md:w-1/3 space-y-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Agregar Nuevo SLA</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-500">Métrica (Ej. Tiempo Respuesta)</Label>
                                    <Input value={metricName} onChange={e => setMetricName(e.target.value)} placeholder="¿Qué se medirá?" className="h-9 text-sm" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-slate-500">Objetivo</Label>
                                        <Input type="number" step="0.01" value={targetValue} onChange={e => setTargetValue(e.target.value)} placeholder="Ej. 24" className="h-9 text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-slate-500">Unidad</Label>
                                        <select
                                            value={unit}
                                            onChange={e => setUnit(e.target.value as any)}
                                            className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                                        >
                                            <option value="horas">Horas</option>
                                            <option value="minutos">Minutos</option>
                                            <option value="porcentaje">%</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-500">Frecuencia de Medición</Label>
                                    <select
                                        value={measurementPeriod}
                                        onChange={e => setMeasurementPeriod(e.target.value as any)}
                                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                                    >
                                        <option value="mensual">Mensual</option>
                                        <option value="trimestral">Trimestral</option>
                                        <option value="anual">Anual</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-500">Cláusula de Penalidad (Opcional)</Label>
                                    <Input value={penaltyClause} onChange={e => setPenaltyClause(e.target.value)} placeholder="Ej. 5% de dscto" className="h-9 text-sm" />
                                </div>

                                <Button
                                    onClick={handleCreate}
                                    disabled={!metricName || !targetValue || isSubmitting}
                                    className="w-full mt-2 bg-slate-900 text-white hover:bg-slate-800"
                                >
                                    <CopyPlus className="w-4 h-4 mr-2" /> Guardar SLA
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Panel Derecho: Lista de SLAs actuales */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">SLAs Registrados</span>
                                <span className="text-xs font-bold text-slate-900">{slas?.length || 0}</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-0">
                                {slas && slas.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
                                        <Clock className="w-10 h-10 mb-3 opacity-20" />
                                        <p className="text-sm font-medium">Este contrato no tiene SLAs registrados aún.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {slas?.map(sla => (
                                            <div key={sla._id} className="p-4 hover:bg-slate-50 transition-colors group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                                            {sla.metricName}
                                                            {sla.isCompliant !== undefined && (
                                                                sla.isCompliant ?
                                                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> CUMPLE</span> :
                                                                    <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-black">INCUMPLE</span>
                                                            )}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 mt-0.5">Medición {sla.measurementPeriod}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Objetivo</p>
                                                        <p className="text-lg font-black text-slate-900">{sla.targetValue} <span className="text-sm border-b-2 border-slate-300 pb-0.5">{sla.unit === 'porcentaje' ? '%' : sla.unit}</span></p>
                                                    </div>
                                                </div>

                                                {sla.penaltyClause && (
                                                    <div className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-md mb-3 border border-amber-100 inline-block font-medium">
                                                        ⚠ Penalidad: {sla.penaltyClause}
                                                    </div>
                                                )}

                                                <div className="mt-3 flex items-center gap-2 bg-slate-100 p-2 rounded-lg">
                                                    <div className="flex-1">
                                                        <Label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Registrar Medición Actual</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type="number"
                                                                placeholder={sla.currentValue !== undefined ? String(sla.currentValue) : "Valor..."}
                                                                value={updateValues[sla._id] || ""}
                                                                onChange={e => setUpdateValues(prev => ({ ...prev, [sla._id]: e.target.value }))}
                                                                className="h-8 text-sm"
                                                            />
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleUpdate(sla._id)}
                                                                disabled={!updateValues[sla._id]}
                                                                className="h-8 shrink-0 border-slate-300 text-slate-700 hover:bg-slate-200"
                                                            >
                                                                <Save className="w-3 h-3 mr-1" /> Grabar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => deleteSLA({ slaId: sla._id })}
                                                        className="h-10 w-10 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 mt-4 self-end shrink-0"
                                                        title="Eliminar SLA"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
