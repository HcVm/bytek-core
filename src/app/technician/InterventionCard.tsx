import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { sileo } from "sileo";
import { MapPin, Navigation, Clock, CheckCircle, ChevronDown, ChevronUp, FileSignature, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InterventionCard({ intervention }: { intervention: any }) {
    const [expanded, setExpanded] = useState(false);
    const [serialInput, setSerialInput] = useState("");

    // Simular firma/foto
    const [hasEvidence, setHasEvidence] = useState(false);

    const updateStatus = useMutation(api.fieldService.updateInterventionStatus);

    const isPending = intervention.status === "scheduled";
    const isEnRoute = intervention.status === "en_route";
    const isWorking = intervention.status === "working";
    const isCompleted = intervention.status === "completed";

    async function handleStatusChange(newStatus: "scheduled" | "en_route" | "working" | "completed") {
        try {
            const payload: any = { id: intervention._id, status: newStatus };

            if (newStatus === "completed") {
                // Procesar seriales si ingresó alguno (separados por coma)
                if (serialInput.trim()) {
                    payload.hardwareSerials = serialInput.split(",").map(s => s.trim()).filter(Boolean);
                }

                if (!hasEvidence) {
                    sileo.warning({ title: "Se recomienda adjuntar evidencia antes de cerrar el acta." });
                }

                payload.evidencePhotosUrl = hasEvidence ? ["https://placeholder.com/evidence1.jpg"] : [];
            }

            await updateStatus(payload);
            sileo.success({ title: "Estado de Orden Actualizado" });

            if (newStatus === "completed") {
                setExpanded(false);
            }
        } catch (error: any) {
            sileo.error({ title: error.message || "Error al actualizar" });
        }
    }

    const typeLabel = intervention.type === 'installation' ? "Instalación"
        : (intervention.type === 'support' ? "Soporte" : "Mantenimiento");

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden mb-4 transition-all">
            {/* Cabecera / Resumen */}
            <div
                className="p-4 cursor-pointer flex justify-between items-start"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${isCompleted ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" :
                            (isWorking ? "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400" : "bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400")
                            }`}>
                            {isCompleted ? "Completado" : typeLabel}
                        </span>
                        {isEnRoute && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">En Ruta</span>}
                    </div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white leading-tight">
                        {intervention.clientName}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                        Ref: {intervention.projectTitle}
                    </p>
                </div>

                <div className="text-zinc-400">
                    {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </div>

            {/* Expansión (Detalles y Acciones) */}
            {expanded && (
                <div className="px-4 pb-4 border-t border-zinc-50 dark:border-zinc-800 pt-3 bg-zinc-50/50 dark:bg-zinc-950/50">
                    <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400 mb-4">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                        <span className="text-sm">{intervention.siteLocation}</span>
                    </div>

                    {!isCompleted ? (
                        <div className="space-y-3">
                            {/* Workflow Botones */}
                            {isPending && (
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => handleStatusChange("en_route")}
                                >
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Iniciar Viaje (En Ruta)
                                </Button>
                            )}

                            {isEnRoute && (
                                <Button
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                                    onClick={() => handleStatusChange("working")}
                                >
                                    <Clock className="w-4 h-4 mr-2" />
                                    Llegué al Sitio (Iniciar Trabajo)
                                </Button>
                            )}

                            {isWorking && (
                                <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm space-y-4">
                                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        <FileSignature className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        Acta de Cierre Operativo
                                    </h4>

                                    <div className="space-y-2">
                                        <Label className="text-xs text-zinc-500 dark:text-zinc-400">Números de Serie Físicos Instalados (Separados por coma)</Label>
                                        <Input
                                            placeholder="Ej: HK12345, HK98765"
                                            value={serialInput}
                                            onChange={(e) => setSerialInput(e.target.value)}
                                            className="text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                                        />
                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-600">Estos códigos se descontarán del Almacén Central automáticamente.</p>
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            variant={hasEvidence ? "secondary" : "outline"}
                                            className="w-full h-8 text-xs border-dashed"
                                            onClick={() => {
                                                setHasEvidence(!hasEvidence);
                                                sileo.info({ title: "Simulación: Cámara Abierta / Evidencia Guardada" });
                                            }}
                                        >
                                            <UploadCloud className="w-3 h-3 mr-2" />
                                            {hasEvidence ? "Evidencias Adjuntadas (✓)" : "Tomar Foto de Evidencia"}
                                        </Button>
                                    </div>

                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4"
                                        onClick={() => handleStatusChange("completed")}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Finalizar Orden
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                        onClick={() => handleStatusChange("scheduled")}
                                    >
                                        Abortar / Reprogramar
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 p-3 rounded-md text-xs border border-emerald-100 dark:border-emerald-800">
                            <strong>Intervención Cerrada.</strong>
                            {intervention.hardwareSerials?.length > 0 && (
                                <div className="mt-2 font-mono text-[10px] space-x-1">
                                    <span className="font-semibold text-emerald-900 dark:text-emerald-100">S/N Instalados:</span>
                                    {intervention.hardwareSerials.join(", ")}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
