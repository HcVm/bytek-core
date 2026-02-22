import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
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
                    toast.warning("Se recomienda adjuntar evidencia antes de cerrar el acta.");
                }

                payload.evidencePhotosUrl = hasEvidence ? ["https://placeholder.com/evidence1.jpg"] : [];
            }

            await updateStatus(payload);
            toast.success("Estado de Orden Actualizado");

            if (newStatus === "completed") {
                setExpanded(false);
            }
        } catch (error: any) {
            toast.error(error.message || "Error al actualizar");
        }
    }

    const typeLabel = intervention.type === 'installation' ? "Instalación"
        : (intervention.type === 'support' ? "Soporte" : "Mantenimiento");

    return (
        <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden mb-4 transition-all">
            {/* Cabecera / Resumen */}
            <div
                className="p-4 cursor-pointer flex justify-between items-start"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${isCompleted ? "bg-emerald-100 text-emerald-700" :
                                (isWorking ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700")
                            }`}>
                            {isCompleted ? "Completado" : typeLabel}
                        </span>
                        {isEnRoute && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-blue-100 text-blue-700">En Ruta</span>}
                    </div>
                    <h3 className="font-semibold text-zinc-900 leading-tight">
                        {intervention.clientName}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                        Ref: {intervention.projectTitle}
                    </p>
                </div>

                <div className="text-zinc-400">
                    {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </div>

            {/* Expansión (Detalles y Acciones) */}
            {expanded && (
                <div className="px-4 pb-4 border-t border-zinc-50 pt-3 bg-zinc-50/50">
                    <div className="flex items-start gap-2 text-zinc-600 mb-4">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
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
                                <div className="p-3 bg-white border border-zinc-200 rounded-lg shadow-sm space-y-4">
                                    <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                                        <FileSignature className="w-4 h-4 text-indigo-600" />
                                        Acta de Cierre Operativo
                                    </h4>

                                    <div className="space-y-2">
                                        <Label className="text-xs text-zinc-500">Números de Serie Físicos Instalados (Separados por coma)</Label>
                                        <Input
                                            placeholder="Ej: HK12345, HK98765"
                                            value={serialInput}
                                            onChange={(e) => setSerialInput(e.target.value)}
                                            className="text-sm"
                                        />
                                        <p className="text-[10px] text-zinc-400">Estos códigos se descontarán del Almacén Central automáticamente.</p>
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            variant={hasEvidence ? "secondary" : "outline"}
                                            className="w-full h-8 text-xs border-dashed"
                                            onClick={() => {
                                                setHasEvidence(!hasEvidence);
                                                toast("Simulación: Cámara Abierta / Evidencia Guardada");
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
                                        className="w-full text-xs text-zinc-500"
                                        onClick={() => handleStatusChange("scheduled")}
                                    >
                                        Abortar / Reprogramar
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-md text-xs border border-emerald-100">
                            <strong>Intervención Cerrada.</strong>
                            {intervention.hardwareSerials?.length > 0 && (
                                <div className="mt-2 font-mono text-[10px] space-x-1">
                                    <span className="font-semibold text-emerald-900">S/N Instalados:</span>
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
