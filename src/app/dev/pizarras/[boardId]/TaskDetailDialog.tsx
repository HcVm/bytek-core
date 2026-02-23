"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bookmark, Bug, CheckSquare, Github, Link as LinkIcon, Save, Zap } from "lucide-react";

export function TaskDetailDialog({
    task,
    boardMembers,
    children
}: {
    task: any;
    boardMembers: any[];
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    // Estados Locales para la edición (no usamos hook-form por simplicidad de un Modal "Save Changes")
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [priority, setPriority] = useState(task.priority);
    const [type, setType] = useState(task.type);
    const [assigneeId, setAssigneeId] = useState(task.assigneeId || "");
    const [storyPoints, setStoryPoints] = useState(task.storyPoints?.toString() || "");
    const [githubPrLink, setGithubPrLink] = useState(task.githubPrLink || "");
    const [status, setStatus] = useState(task.status);

    const updateTaskFields = useMutation(api.agile.updateTaskFields);

    const getTypeIcon = (t: string) => {
        switch (t) {
            case 'bug': return <Bug className="w-4 h-4 text-red-500" />;
            case 'feature': return <Bookmark className="w-4 h-4 text-emerald-500" />;
            case 'epic': return <Zap className="w-4 h-4 text-purple-500" />;
            default: return <CheckSquare className="w-4 h-4 text-blue-500" />;
        }
    };

    const handleSave = async () => {
        try {
            await updateTaskFields({
                taskId: task._id,
                status,
                priority,
                assigneeId: assigneeId ? (assigneeId as Id<"users">) : undefined,
                githubPrLink,
                storyPoints: storyPoints ? parseInt(storyPoints) : undefined,
            });
            toast.success("Detalles de la tarea actualizados");
            setOpen(false);
        } catch (error) {
            toast.error("Error guardando tarea");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[85vh] flex flex-col p-0 overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-200 bg-zinc-50/80">
                    {getTypeIcon(task.type)}
                    <span className="text-sm font-semibold text-zinc-600 uppercase tracking-wider">{task.boardId.substring(task.boardId.length - 4)}-{task._id.substring(task._id.length - 4)}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="text-xl font-bold border-transparent hover:border-zinc-200 focus:border-indigo-500 px-2 -ml-2 h-auto py-2 shadow-none"
                            disabled // El título normalmente se edita aparte, lo bloqueamos por simplicidad
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-900">Descripción (Contexto / Criterios)</label>
                                <Textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="min-h-[150px] resize-y"
                                    disabled // Blocked in MVP to prevent losing focus context in rapid edits
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                                    <Github className="w-4 h-4" /> Pull Request Link (Dev)
                                </label>
                                <Input
                                    placeholder="https://github.com/org/repo/pull/123"
                                    value={githubPrLink}
                                    onChange={e => setGithubPrLink(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-span-1 border-l border-zinc-100 pl-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Estado</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">To Do</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="review">In Review</SelectItem>
                                        <SelectItem value="done">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Responsable</label>
                                <Select value={assigneeId} onValueChange={setAssigneeId}>
                                    <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Sin asignar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Ninguno</SelectItem>
                                        {boardMembers.map(m => (
                                            <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Prioridad</label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger className="h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Baja</SelectItem>
                                        <SelectItem value="medium">Media</SelectItem>
                                        <SelectItem value="high">Alta</SelectItem>
                                        <SelectItem value="urgent">Urgente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Story Points</label>
                                <Input
                                    type="number"
                                    className="h-8 w-20"
                                    value={storyPoints}
                                    onChange={e => setStoryPoints(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 shrink-0">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                        <Save className="w-4 h-4 mr-2" /> Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
