"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { ListTodo, ArrowRight, Bookmark, Bug, CheckSquare, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sileo } from "sileo";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function GlobalBacklog() {
    const allUsers = useQuery(api.users.getAllUsers);
    const userId = allUsers?.[0]?._id;

    const boards = useQuery(api.agile.getBoardsForUser, userId ? { userId } : "skip");
    const backlogTasks = useQuery(api.agile.getBacklogTasks, {});
    const assignToSprint = useMutation(api.agile.assignTaskToSprint);

    const allSprints = useQuery(api.agile.getSprintsForUser, userId ? { userId } : "skip");

    const getTypeIcon = (t: string) => {
        switch (t) {
            case 'bug': return <Bug className="w-3.5 h-3.5 text-red-500" />;
            case 'feature': return <Bookmark className="w-3.5 h-3.5 text-emerald-500" />;
            case 'epic': return <Zap className="w-3.5 h-3.5 text-purple-500" />;
            default: return <CheckSquare className="w-3.5 h-3.5 text-blue-500" />;
        }
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    if (backlogTasks === undefined) return <div className="p-10 flex items-center justify-center h-full"><span className="animate-pulse text-slate-400 font-semibold tracking-widest text-sm uppercase">Cargando Backlog...</span></div>;

    const tasksByBoard: Record<string, any[]> = {};
    backlogTasks.forEach(t => {
        const key = t.boardTitle || "Sin Board";
        if (!tasksByBoard[key]) tasksByBoard[key] = [];
        tasksByBoard[key].push(t);
    });

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Backlog Global</h1>
                    <p className="text-slate-500 dark:text-zinc-400 mt-1">Tareas sin sprint asignado. Revisa y planifica la capacidad de cada iteración.</p>
                </div>
                <Badge variant="outline" className="text-sm px-4 py-2 border-slate-300 dark:border-zinc-700 dark:text-zinc-300 gap-2 bg-white dark:bg-zinc-900 shadow-sm">
                    <ListTodo className="w-4 h-4" />
                    {backlogTasks.length} tareas pendientes
                </Badge>
            </header>

            {backlogTasks.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-16 text-center bg-white dark:bg-zinc-900/50 shadow-sm">
                    <ListTodo className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-zinc-700" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Backlog Limpio</h3>
                    <p className="text-slate-500 dark:text-zinc-400 mt-1">Todas las tareas están asignadas a sprints. ¡Excelente trabajo!</p>
                </div>
            ) : (
                Object.entries(tasksByBoard).map(([boardTitle, tasks]) => {
                    const boardId = tasks[0]?.boardId;
                    const availableSprints = allSprints?.filter(s => s.boardId === boardId) || [];

                    return (
                        <div key={boardTitle} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 dark:bg-zinc-900/50 px-5 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <span className="font-bold text-sm text-slate-800 dark:text-zinc-200">{boardTitle}</span>
                                </div>
                                <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">
                                    {tasks.reduce((a: number, t: any) => a + (t.storyPoints || 0), 0)} SP total
                                </span>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                                {tasks.map((task: any) => (
                                    <div key={task._id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        <div className="shrink-0">{getTypeIcon(task.type || "task")}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-slate-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{task.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                                                {task.assigneeName || "Sin asignar"} · {task.storyPoints || 0} SP
                                            </p>
                                        </div>
                                        <Badge className={`${getPriorityColor(task.priority)} text-[10px] font-bold uppercase border dark:border-zinc-800/50 shadow-none`}>
                                            {task.priority}
                                        </Badge>
                                        <Badge variant="outline" className="text-[10px] uppercase border-slate-200 dark:border-zinc-800 dark:text-zinc-400 shadow-none">
                                            {task.status.replace("_", " ")}
                                        </Badge>
                                        <div className="ml-4 w-48">
                                            <Select
                                                onValueChange={(val) => {
                                                    assignToSprint({ taskId: task._id, sprintId: val as Id<"sprints"> })
                                                        .then(() => sileo.success({ title: "Tarea asignada al sprint." }))
                                                        .catch(() => sileo.error({ title: "Error al asignar" }));
                                                }}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300">
                                                    <SelectValue placeholder="Asignar a Sprint" />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">
                                                    {availableSprints.length === 0 ? (
                                                        <SelectItem value="none" disabled>No hay sprints disponibles</SelectItem>
                                                    ) : (
                                                        availableSprints.map(s => (
                                                            <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
