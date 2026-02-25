"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { GitMerge, Plus, Play, Square, CheckCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sileo } from "sileo";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SprintManager() {
    const allUsers = useQuery(api.users.getAllUsers);
    const userId = allUsers?.[0]?._id;
    const boards = useQuery(api.agile.getBoardsForUser, userId ? { userId } : "skip");

    const [selectedBoardId, setSelectedBoardId] = useState<Id<"boards"> | null>(null);

    const activeBoardId = selectedBoardId || boards?.[0]?._id || null;
    const sprints = useQuery(api.agile.getSprintsByBoard, activeBoardId ? { boardId: activeBoardId } : "skip");
    const tasks = useQuery(api.agile.getTasksByBoard, activeBoardId ? { boardId: activeBoardId } : "skip");

    const createSprint = useMutation(api.agile.createSprint);
    const updateSprintStatus = useMutation(api.agile.updateSprintStatus);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sprintName, setSprintName] = useState("");
    const [sprintGoal, setSprintGoal] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleCreateSprint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeBoardId) return;
        try {
            await createSprint({
                boardId: activeBoardId,
                name: sprintName,
                goal: sprintGoal || undefined,
                startDate: new Date(startDate).getTime(),
                endDate: new Date(endDate).getTime(),
            });
            sileo.success({ title: "Sprint creado exitosamente." });
            setIsDialogOpen(false);
            setSprintName(""); setSprintGoal(""); setStartDate(""); setEndDate("");
        } catch (e) { sileo.error({ title: "Error al crear sprint." }); }
    };

    const handleStatusChange = async (sprintId: Id<"sprints">, newStatus: "planned" | "active" | "closed") => {
        try {
            await updateSprintStatus({ sprintId, status: newStatus });
            sileo.success({ title: `Sprint ${newStatus === 'active' ? 'activado' : newStatus === 'closed' ? 'cerrado' : 'planificado'}.` });
        } catch (e) { sileo.error({ title: "Error al actualizar sprint." }); }
    };

    const getStatusIcon = (s: string) => {
        switch (s) {
            case 'active': return <Play className="w-4 h-4 text-emerald-500" />;
            case 'closed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
            default: return <Target className="w-4 h-4 text-amber-500" />;
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'closed': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    if (boards === undefined) return <div className="p-10 flex items-center justify-center h-full"><span className="animate-pulse text-slate-400 font-semibold tracking-widest text-sm uppercase">Cargando Sprints...</span></div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Sprint Manager</h1>
                    <p className="text-slate-500 mt-1">Planifica, activa y cierra iteraciones para tu equipo.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-800"
                        value={activeBoardId || ""}
                        onChange={e => setSelectedBoardId(e.target.value as Id<"boards">)}
                    >
                        {boards?.map(b => (
                            <option key={b._id} value={b._id}>{b.title}</option>
                        ))}
                    </select>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white"><Plus className="w-4 h-4 mr-2" /> Nuevo Sprint</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[450px]">
                            <DialogHeader>
                                <DialogTitle>Crear Sprint</DialogTitle>
                                <DialogDescription>Define las fechas y objetivos de la nueva iteración.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateSprint} className="space-y-4 pt-2">
                                <div className="space-y-2"><Label>Nombre del Sprint</Label><Input value={sprintName} onChange={e => setSprintName(e.target.value)} required placeholder="Sprint 4 - Integraciones" /></div>
                                <div className="space-y-2"><Label>Meta / Goal (opcional)</Label><Textarea value={sprintGoal} onChange={e => setSprintGoal(e.target.value)} placeholder="Completar el módulo de pagos..." className="resize-none" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Fecha Inicio</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required /></div>
                                    <div className="space-y-2"><Label>Fecha Fin</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required /></div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                    <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800">Crear Sprint</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {!sprints || sprints.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-16 text-center">
                    <GitMerge className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-bold text-slate-800">Sin Sprints</h3>
                    <p className="text-slate-500 mt-1">Crea el primer sprint para comenzar a asignar tareas a iteraciones temporales.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {sprints.map(sprint => {
                        const sprintTasks = tasks?.filter(t => t.sprintId === sprint._id) || [];
                        const totalSP = sprintTasks.reduce((a, t) => a + (t.storyPoints || 0), 0);
                        const doneTasks = sprintTasks.filter(t => t.status === "done");
                        const doneSP = doneTasks.reduce((a, t) => a + (t.storyPoints || 0), 0);
                        const progress = totalSP > 0 ? (doneSP / totalSP) * 100 : 0;

                        return (
                            <div key={sprint._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(sprint.status)}
                                        <div>
                                            <h3 className="font-bold text-slate-900">{sprint.name}</h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {new Date(sprint.startDate).toLocaleDateString('es-PE')} — {new Date(sprint.endDate).toLocaleDateString('es-PE')}
                                                {sprint.goal && <span className="text-slate-400 ml-2">· {sprint.goal}</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge className={`${getStatusColor(sprint.status)} text-[10px] uppercase font-bold border shadow-none`}>
                                            {sprint.status === 'planned' ? 'Planificado' : sprint.status === 'active' ? 'Activo' : 'Cerrado'}
                                        </Badge>
                                        {sprint.status === "planned" && (
                                            <Button size="sm" variant="outline" className="text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={() => handleStatusChange(sprint._id, "active")}>
                                                <Play className="w-3 h-3 mr-1" /> Activar
                                            </Button>
                                        )}
                                        {sprint.status === "active" && (
                                            <Button size="sm" variant="outline" className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => handleStatusChange(sprint._id, "closed")}>
                                                <Square className="w-3 h-3 mr-1" /> Cerrar
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="px-6 py-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                                            <div className="bg-indigo-500 rounded-full h-2 transition-all" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{Math.round(progress)}%</span>
                                        <span className="text-xs text-slate-500">{doneSP}/{totalSP} SP</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        {["todo", "in_progress", "review", "done"].map(status => {
                                            const count = sprintTasks.filter(t => t.status === status).length;
                                            const labels: Record<string, string> = { todo: "To Do", in_progress: "In Progress", review: "Review", done: "Done" };
                                            return (
                                                <div key={status} className="bg-slate-50 rounded-lg p-3 text-center">
                                                    <p className="text-2xl font-black text-slate-900">{count}</p>
                                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{labels[status]}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
