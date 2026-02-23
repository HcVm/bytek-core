"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, User, CheckCircle2, XCircle, Share, Bot, ArrowRightLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TicketDetailDialog({
    requestId,
    open,
    onOpenChange,
    currentUserId
}: {
    requestId: Id<"internalRequests"> | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUserId: Id<"users">;
}) {
    const [newMessage, setNewMessage] = useState("");

    // Asumiremos que tenemos el Query para traer 1 Request, pero lo buscaremos del listado total por MVP
    const departments = useQuery(api.departments.getAllDepartments);
    const users = useQuery(api.users.getAllUsers);

    // Idealmente tendríamos getRequestById
    const allRequests = useQuery(api.internalRequests.getRequestsReceivedByDepartment,
        // Hack: Pasamos undefined si no hay request para no crashear, pero al tener la tabla de requests podemos filtrar cliente. 
        // Para simplificar, obtenemos los que mandó el usuario y los cruzamos (en prod usaríamos una query dedicada)
        { departmentId: departments?.[0]?._id as any } // Mock de dept primario
    );

    const request = allRequests?.find(r => r._id === requestId);
    const comments = useQuery(api.internalRequests.getCommentsForRequest, requestId ? { requestId } : "skip");

    const createComment = useMutation(api.internalRequests.createComment);
    const updateRequestStatus = useMutation(api.internalRequests.updateRequestStatus);
    const transferRequest = useMutation(api.internalRequests.transferRequest);

    const [transferDeptId, setTransferDeptId] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [comments]);

    if (!request || !users || !departments) return null;

    const sender = users.find(u => u._id === request.fromUserId);
    const assigned = request.assignedTo ? users.find(u => u._id === request.assignedTo) : null;
    const targetDept = departments.find(d => d._id === request.toDepartmentId);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !requestId) return;

        try {
            await createComment({
                requestId,
                authorId: currentUserId,
                content: newMessage.trim(),
            });
            setNewMessage("");
        } catch (error) {
            console.error(error);
        }
    };

    const handleApprovalDecision = async (decision: "open" | "rejected") => {
        if (!requestId) return;
        try {
            await updateRequestStatus({
                requestId,
                status: decision,
                approverId: currentUserId
            });
            await createComment({
                requestId,
                authorId: currentUserId,
                content: `El requerimiento ha sido ${decision === 'open' ? 'APROBADO' : 'RECHAZADO'} por Gerencia.`,
                isSystemMessage: true
            });
        } catch (error) { }
    };

    const handleTransfer = async () => {
        if (!requestId || !transferDeptId) return;
        try {
            await transferRequest({
                requestId,
                newDepartmentId: transferDeptId as any,
                transferredBy: currentUserId
            });
            const newDept = departments.find(d => d._id === transferDeptId);
            await createComment({
                requestId,
                authorId: currentUserId,
                content: `Ticket derivado y transferido al área de ${newDept?.name}.`,
                isSystemMessage: true
            });
            setTransferDeptId("");
            onOpenChange(false);
        } catch (error) { }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 h-[85vh] flex flex-col gap-0 overflow-hidden bg-zinc-50">

                {/* Cabecera del Ticket */}
                <div className="bg-white px-6 py-4 border-b border-zinc-200 flex flex-col gap-3 shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold text-zinc-500 mb-1 block uppercase tracking-wider">
                                TICKET #{requestId?.slice(-6)} • DIRIGIDO A: {targetDept?.name}
                            </span>
                            <DialogTitle className="text-2xl font-bold text-zinc-900 leading-tight">
                                {request.title}
                            </DialogTitle>
                        </div>
                        {request.status === "pending_approval" && (
                            <div className="flex gap-2">
                                <Button size="sm" variant="destructive" onClick={() => handleApprovalDecision("rejected")}>
                                    <XCircle className="w-4 h-4 mr-2" /> Denegar
                                </Button>
                                <Button size="sm" onClick={() => handleApprovalDecision("open")} className="bg-emerald-600 hover:bg-emerald-700">
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Aprobar Ticket
                                </Button>
                            </div>
                        )}
                        {(request.status === "open" || request.status === "in_progress") && (
                            <div className="flex items-center gap-2">
                                <div className="w-40">
                                    <Select value={transferDeptId} onValueChange={setTransferDeptId}>
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Derivar a..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.filter(d => d._id !== targetDept?._id).map(dept => (
                                                <SelectItem key={dept._id} value={dept._id} className="text-xs">{dept.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {transferDeptId && (
                                    <Button size="sm" variant="outline" className="h-8" onClick={handleTransfer}>
                                        <ArrowRightLeft className="w-3.5 h-3.5" />
                                    </Button>
                                )}

                                {request.status === "open" && (
                                    <Button size="sm" variant="outline" onClick={() => updateRequestStatus({ requestId: requestId as Id<"internalRequests">, status: "in_progress", assignedTo: currentUserId })}>
                                        <Share className="w-4 h-4 mr-2" /> Atender Caso
                                    </Button>
                                )}
                            </div>
                        )}
                        {request.status === "in_progress" && (
                            <Button size="sm" onClick={() => updateRequestStatus({ requestId: requestId as Id<"internalRequests">, status: "resolved" })} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Resolver
                            </Button>
                        )}
                    </div>
                    <div className="text-sm text-zinc-600 bg-zinc-50 p-3 rounded-md border border-zinc-100 italic">
                        "{request.description}"
                    </div>
                </div>

                {/* Hilo de Conversación */}
                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6 max-w-3xl mx-auto pb-4">
                        {/* Mensaje Base Inicial */}
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-zinc-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-sm text-zinc-900">{sender?.name}</span>
                                    <span className="text-xs text-zinc-500">{format(request.createdAt, "dd MMM HH:mm")}</span>
                                </div>
                                <div className="mt-1 text-sm text-zinc-700 bg-white p-3 rounded-tr-xl rounded-b-xl border border-zinc-200 shadow-sm inline-block">
                                    Ticket generado e ingresado al sistema.
                                </div>
                            </div>
                        </div>

                        {comments?.map((msg) => {
                            const isMe = msg.authorId === currentUserId;
                            const author = users.find(u => u._id === msg.authorId);

                            if (msg.isSystemMessage) {
                                return (
                                    <div key={msg._id} className="flex justify-center my-4">
                                        <div className="bg-zinc-100 text-zinc-500 text-xs px-4 py-1.5 rounded-full border border-zinc-200 flex items-center gap-2">
                                            <Bot className="w-3.5 h-3.5" />
                                            {msg.content} • {format(msg.createdAt, "HH:mm")}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={msg._id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-indigo-100 text-indigo-700' : 'bg-zinc-200 text-zinc-500'}`}>
                                        <span className="text-xs font-bold">{author?.name?.charAt(0) || <User className="w-4 h-4" />}</span>
                                    </div>
                                    <div className={`flex-1 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-sm text-zinc-900">{isMe ? 'Tú' : author?.name}</span>
                                            <span className="text-xs text-zinc-500">{format(msg.createdAt, "HH:mm")}</span>
                                        </div>
                                        <div className={`mt-1 text-sm p-3 shadow-sm inline-block max-w-[85%]
                                            ${isMe
                                                ? 'bg-indigo-600 text-white rounded-tl-xl rounded-b-xl'
                                                : 'bg-white text-zinc-700 rounded-tr-xl rounded-b-xl border border-zinc-200'
                                            }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                {/* Caja de Respuesta */}
                <div className="bg-white p-4 border-t border-zinc-200 shrink-0">
                    <form onSubmit={handleSendMessage} className="flex gap-3 max-w-3xl mx-auto">
                        <Input
                            placeholder="Escribe una respuesta o actualización..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 bg-zinc-50"
                            disabled={request.status === 'closed'}
                        />
                        <Button type="submit" className="bg-zinc-900 hover:bg-zinc-800 text-white shrink-0" disabled={!newMessage.trim() || request.status === 'closed'}>
                            <Send className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Enviar</span>
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
