"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { ArrowLeft, Send, Users, MoreHorizontal, Bot, Bug, Zap, Bookmark, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskFormDialog } from "./TaskFormDialog";
import { TaskDetailDialog } from "./TaskDetailDialog";

export default function KanbanBoardPage() {
    const params = useParams();
    const router = useRouter();
    const boardId = params.boardId as Id<"boards">;

    const allUsers = useQuery(api.users.getAllUsers);
    const userId = allUsers?.[0]?._id; // Mock usuario logueado

    const board = useQuery(api.agile.getBoardById, { boardId });
    const tasks = useQuery(api.agile.getTasksByBoard, { boardId });
    const messages = useQuery(api.agile.getBoardMessages, { boardId });

    const updateTaskStatus = useMutation(api.agile.updateTaskStatus);
    const sendMessage = useMutation(api.agile.sendBoardMessage);

    const [chatInput, setChatInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!board || !tasks || !allUsers || !messages) return <div className="p-8">Cargando Tablero...</div>;

    const boardMembers = allUsers.filter(u => board.memberIds.includes(u._id));

    const columns = [
        { id: "todo", title: "Por Hacer (To Do)" },
        { id: "in_progress", title: "En Progreso (WIP)" },
        { id: "review", title: "Revisión (QA)" },
        { id: "done", title: "Completado (Done)" }
    ];

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'urgent': return "bg-red-100 text-red-700 border-red-200";
            case 'high': return "bg-orange-100 text-orange-700 border-orange-200";
            case 'medium': return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-zinc-100 text-zinc-700 border-zinc-200";
        }
    };

    const getTypeIcon = (t: string) => {
        switch (t) {
            case 'bug': return <Bug className="w-3.5 h-3.5 text-red-500" />;
            case 'feature': return <Bookmark className="w-3.5 h-3.5 text-emerald-500" />;
            case 'epic': return <Zap className="w-3.5 h-3.5 text-purple-500" />;
            default: return <CheckSquare className="w-3.5 h-3.5 text-blue-500" />;
        }
    };

    const handleSendMsg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !userId) return;
        try {
            await sendMessage({
                boardId,
                authorId: userId,
                content: chatInput.trim(),
            });
            setChatInput("");
        } catch (error) { }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            {/* Cabecera del Tablero */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dev/pizarras')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">{board.title}</h1>
                        <p className="text-xs text-zinc-500 line-clamp-1">{board.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {boardMembers.slice(0, 5).map(member => (
                            <div key={member._id} title={member.name} className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-white dark:border-zinc-950 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                {member.name?.charAt(0) || 'U'}
                            </div>
                        ))}
                        {boardMembers.length > 5 && (
                            <div className="w-8 h-8 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-xs font-bold text-zinc-500">
                                +{boardMembers.length - 5}
                            </div>
                        )}
                    </div>
                    <TaskFormDialog boardId={board._id} boardMembers={boardMembers} />
                </div>
            </div>

            {/* Main Workspace: Split Kanban & Chat */}
            <div className="flex flex-1 overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/50">

                {/* KANBAN BOARD (Lado Izquierdo) */}
                <div className="flex-1 overflow-x-auto p-6">
                    <div className="flex gap-6 h-full items-start min-w-[1000px]">
                        {columns.map(col => {
                            const colTasks = tasks.filter(t => t.status === col.id);
                            return (
                                <div key={col.id} className="w-80 bg-zinc-100/80 dark:bg-zinc-900/80 rounded-xl flex flex-col max-h-full border border-zinc-200 dark:border-zinc-800 shadow-sm shrink-0">
                                    <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between font-semibold text-zinc-700 dark:text-zinc-300 text-sm">
                                        <span>{col.title}</span>
                                        <span className="bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full text-xs">
                                            {colTasks.length}
                                        </span>
                                    </div>
                                    <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                                        {colTasks.map(task => {
                                            const assignee = allUsers.find(u => u._id === task.assigneeId);
                                            return (
                                                <TaskDetailDialog key={task._id} task={task} boardMembers={boardMembers}>
                                                    <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-indigo-300 transition-colors group cursor-pointer text-left">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div title={`Type: ${task.type}`}>
                                                                    {getTypeIcon(task.type || "task")}
                                                                </div>
                                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border dark:border-zinc-800 ${getPriorityColor(task.priority)}`}>
                                                                    {task.priority}
                                                                </span>
                                                            </div>
                                                            <button className="text-zinc-400 hover:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight mb-2">{task.title}</h4>

                                                        <div className="flex items-center justify-between mt-3 text-xs">
                                                            <div className="flex items-center gap-2">
                                                                {task.storyPoints && (
                                                                    <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-700 dark:text-zinc-300" title={`${task.storyPoints} Story Points`}>
                                                                        {task.storyPoints}
                                                                    </div>
                                                                )}
                                                                {assignee ? (
                                                                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400" title={assignee.name}>
                                                                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-[9px]">
                                                                            {assignee.name?.charAt(0) || 'U'}
                                                                        </div>
                                                                        <span className="truncate max-w-[100px]">{assignee.name?.split(" ")[0] || 'Unk'}</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-zinc-400 italic">No asignado</span>
                                                                )}

                                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                                    {col.id !== 'todo' && (
                                                                        <button onClick={() => updateTaskStatus({ taskId: task._id, status: columns[columns.findIndex(c => c.id === col.id) - 1].id as any })} className="w-6 h-6 rounded bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500">
                                                                            {"<"}
                                                                        </button>
                                                                    )}
                                                                    {col.id !== 'done' && (
                                                                        <button onClick={() => updateTaskStatus({ taskId: task._id, status: columns[columns.findIndex(c => c.id === col.id) + 1].id as any })} className="w-6 h-6 rounded bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500">
                                                                            {">"}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TaskDetailDialog>
                                            );
                                        })}
                                        {colTasks.length === 0 && (
                                            <div className="text-center py-6 text-xs text-zinc-400 dark:text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                                                Columna Vacía
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* TEAM CHAT SIDEBAR (Lado Derecho) */}
                <div className="w-80 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 drop-shadow-sm z-10">
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 bg-slate-50/50 dark:bg-zinc-900/50">
                        <Users className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                        Team Slack
                    </div>

                    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                        <div className="space-y-4">
                            {messages.map(msg => {
                                const isMe = msg.authorId === userId;
                                const author = allUsers.find(u => u._id === msg.authorId);

                                return (
                                    <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-2.5 rounded-2xl max-w-[85%] text-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-sm'}`}>
                                            {!isMe && <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">{author?.name || 'Sistema'}</span>}
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {messages.length === 0 && (
                                <p className="text-xs text-center text-zinc-400 mt-10">
                                    No hay mensajes. ¡Di hola al equipo!
                                </p>
                            )}
                        </div>
                    </ScrollArea>

                    <form onSubmit={handleSendMsg} className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Discutir con el Team..."
                                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 dark:text-white text-sm h-9 shadow-inner"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                            />
                            <Button type="submit" size="icon" className="h-9 w-9 shrink-0 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20">
                                <Send className="w-4 h-4 text-white" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #e4e4e7;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
}
