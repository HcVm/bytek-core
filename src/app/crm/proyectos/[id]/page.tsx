"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, CheckCircle2, FileBarChart } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { sileo } from "sileo";
import { Progress } from "@/components/ui/progress";

export default function ProyectoDetallePage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as Id<"projects">;

    const project = useQuery(api.projects.getProject, { id: projectId });
    const updateMilestones = useMutation(api.projects.updateProjectMilestones);
    const updateStatus = useMutation(api.projects.updateProjectStatus);

    const [localMilestones, setLocalMilestones] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (project && localMilestones.length === 0) {
            setLocalMilestones(project.milestones);
        }
    }, [project, localMilestones.length]);

    if (!project) {
        return <div className="p-8 text-center text-zinc-500">Cargando proyecto...</div>;
    }

    const toggleMilestone = (index: number, isChecked: boolean) => {
        const updated = [...localMilestones];
        updated[index] = {
            ...updated[index],
            completedAt: isChecked ? Date.now() : undefined
        };
        setLocalMilestones(updated);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateMilestones({
                id: project._id,
                milestones: localMilestones
            });

            // Si todos están completos, ofrecer/marcar como completely done
            const allDone = localMilestones.every(m => m.completedAt);
            if (allDone && project.status !== "completed") {
                await updateStatus({ id: project._id, status: "completed" });
                sileo.success({ title: "Proyecto marcado como completado" });
            } else if (!allDone && project.status === "completed") {
                await updateStatus({ id: project._id, status: "in_progress" });
            }

            sileo.success({ title: "Avance guardado correctamente" });
        } catch (error) {
            console.error(error);
            sileo.error({ title: "Error al guardar los hitos" });
        } finally {
            setIsSaving(false);
        }
    };

    const calculateProgress = () => {
        if (!localMilestones || localMilestones.length === 0) return 0;
        const total = localMilestones.length;
        const completed = localMilestones.filter(m => m.completedAt).length;
        return (completed / total) * 100;
    };

    const progressValue = calculateProgress();

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="mb-6">
                <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 -ml-4" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Proyectos
                </Button>
            </div>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{project.title}</h1>
                        <Badge variant="outline" className="bg-white">
                            {project.status.replace("_", " ").toUpperCase()}
                        </Badge>
                    </div>
                    <p className="text-zinc-500">Cliente: <span className="font-semibold text-zinc-700">{project.clientName}</span></p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Guardando..." : "Guardar Avances"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Control de Hitos (Milestones)</CardTitle>
                            <CardDescription>Marca los entregables como completados conforme avance el servicio.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {localMilestones.map((milestone, i) => (
                                <div key={i} className={`flex items-start space-x-4 p-4 rounded-lg border ${milestone.completedAt ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-zinc-200'}`}>
                                    <Checkbox
                                        id={`milestone-${i}`}
                                        checked={!!milestone.completedAt}
                                        onCheckedChange={(checked) => toggleMilestone(i, checked as boolean)}
                                        className="mt-1 w-5 h-5 rounded-md"
                                    />
                                    <div className="flex-1">
                                        <label
                                            htmlFor={`milestone-${i}`}
                                            className={`text-sm font-medium leading-none cursor-pointer ${milestone.completedAt ? 'text-zinc-900 line-through' : 'text-zinc-900'}`}
                                        >
                                            {milestone.name}
                                        </label>
                                        <p className="text-sm text-zinc-500 mt-1.5">
                                            Valor relativo: <span className="font-semibold text-zinc-700">{milestone.percentage}%</span> del proyecto.
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        {milestone.isPaid ? (
                                            <Badge variant="secondary" className="bg-zinc-100 text-zinc-600">Pagado</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-red-50 text-red-600">No Pagado</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {localMilestones.length === 0 && (
                                <p className="text-sm text-zinc-500">Este proyecto no tiene hitos definidos.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estado General</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-zinc-700">Progreso Total</span>
                                    <span className="text-sm font-bold text-indigo-600">{Math.round(progressValue)}%</span>
                                </div>
                                <Progress value={progressValue} className="h-2" />
                            </div>

                            {progressValue === 100 && (
                                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg flex items-start gap-3 border border-emerald-100">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold">¡Proyecto Completado!</p>
                                        <p className="text-xs mt-1 text-emerald-600/80">Todos los hitos han sido marcados como terminados.</p>
                                    </div>
                                </div>
                            )}

                            <Link href={`/dev/reportes/${projectId}`} className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                                <FileBarChart className="w-4 h-4" /> Ver Reporte Post-Mortem
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
