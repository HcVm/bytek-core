"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
    MessageCircle, Send, Paperclip, Video, Phone, Activity, Search,
    FileText, User, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";

export default function AdminCommunicationsPage() {
    // Left sidebar state
    const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Queries
    const activeConversations = useQuery(api.adminCommunications.getActiveConversations);

    const filteredConversations = activeConversations?.filter(conv =>
        conv.client.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-white">
            {/* Left Sidebar: Inbox */}
            <div className="w-80 border-r border-zinc-200 flex flex-col bg-zinc-50/50">
                <div className="p-4 border-b border-zinc-200">
                    <h1 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-indigo-600" />
                        Comunicaciones
                    </h1>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <Input
                            placeholder="Buscar cliente..."
                            className="pl-9 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    {activeConversations === undefined ? (
                        <div className="p-8 flex justify-center text-zinc-400">
                            <Activity className="w-5 h-5 animate-pulse" />
                        </div>
                    ) : filteredConversations?.length === 0 ? (
                        <div className="p-6 text-center text-zinc-500 text-sm">
                            No se encontraron conversaciones activas.
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-100">
                            {filteredConversations?.map((conv) => (
                                <button
                                    key={conv.client._id}
                                    onClick={() => setSelectedClientId(conv.client._id)}
                                    className={`w-full p-4 text-left transition-colors hover:bg-zinc-100 flex gap-3 items-start ${selectedClientId === conv.client._id ? 'bg-indigo-50 hover:bg-indigo-50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'
                                        }`}
                                >
                                    <Avatar className="w-10 h-10 border border-zinc-200">
                                        <AvatarFallback className="bg-zinc-100 text-zinc-600">
                                            {conv.client.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-semibold text-zinc-900 truncate pr-2 text-sm">{conv.client.name}</h3>
                                            <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                                                {new Date(conv.latestMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-500 truncate h-4">
                                            {conv.latestMessage.type === "text" ? conv.latestMessage.content :
                                                conv.latestMessage.type === "meeting" ? "🗓️ Solicitud de reunión" : "📎 Archivo adjunto"}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Right Side: Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedClientId ? (
                    <ChatView clientId={selectedClientId} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                        <MessageCircle className="w-16 h-16 text-zinc-200 mb-4" />
                        <h2 className="text-xl font-semibold text-zinc-600">Selecciona una conversación</h2>
                        <p className="text-sm mt-2">Elige un cliente del panel lateral para ver sus mensajes.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-component for the chat area
function ChatView({ clientId }: { clientId: Id<"clients"> }) {
    const messages = useQuery(api.adminCommunications.getClientMessages, { clientId });
    const replyMut = useMutation(api.adminCommunications.replyToClientMessage);
    const updateMeetingStatus = useMutation(api.clientPortal.updateMeetingStatus);
    const approveAndCreateRoom = useAction(api.daily.approveAndCreateRoom);

    // Auth info directly from Convex is preferred, but for now we might send without explicit ID 
    // or rely on server-side auth if configured. Currently schema allows optional senderId.

    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            await replyMut({
                clientId,
                content: newMessage.trim(),
                type: "text"
            });
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleConfirmMeeting = async (messageId: Id<"clientMessages">) => {
        setIsSending(true);
        try {
            await approveAndCreateRoom({ messageId });
        } catch (e) {
            console.error("Failed to confirm via Daily", e);
        } finally {
            setIsSending(false);
        }
    };

    // Obtenemos el cliente del primer mensaje solo para el título (o hacer una query del cliente)
    // Para no hacer demasiadas peticiones, podemos inferirlo o buscarlo en otra query.
    // Usaremos un placeholder seguro por ahora.

    if (messages === undefined) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Activity className="w-6 h-6 text-zinc-400 animate-pulse" />
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="h-16 px-6 border-b border-zinc-200 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-indigo-600" />
                    <div>
                        {/* Como no pasamos el nombe directamente, usamos Client ID de momento, O se podria pasar via prop */}
                        <h2 className="font-semibold text-zinc-900 leading-tight">Canal del Cliente</h2>
                        <p className="text-xs text-zinc-500">ID: {clientId.substring(0, 8)}...</p>
                    </div>
                </div>
            </div>

            {/* Message List */}
            <ScrollArea className="flex-1 p-6 bg-zinc-50/30">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 ? (
                        <div className="text-center text-zinc-400 py-10 text-sm">
                            Este cliente aún no ha enviado mensajes.
                        </div>
                    ) : (
                        messages.map((msg: any) => {
                            const isStaff = !msg.isFromClient;

                            return (
                                <div key={msg._id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${isStaff
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-white border border-zinc-200 text-zinc-900 rounded-tl-none'
                                        }`}>

                                        {/* TEXT MESSAGE */}
                                        {msg.type === "text" && (
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        )}

                                        {/* DOCUMENT MESSAGE */}
                                        {msg.type === "document" && (
                                            <div className="flex items-center gap-3 border border-current/20 p-3 rounded-xl bg-black/5">
                                                <FileText className="w-8 h-8 opacity-70" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{msg.fileName || "Documento"}</p>
                                                </div>
                                                {msg.fileUrl && (
                                                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                                                        <Button size="sm" variant={isStaff ? "secondary" : "default"} className="h-7 text-xs">
                                                            Descargar
                                                        </Button>
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {/* MEETING REQUEST */}
                                        {msg.type === "meeting" && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 font-semibold">
                                                    <Calendar className="w-5 h-5 opacity-80" />
                                                    <span>Solicitud de Reunión</span>
                                                </div>
                                                <div className="bg-black/5 rounded-xl p-3 text-sm space-y-1">
                                                    <p><strong>Asunto:</strong> {msg.meetingTitle || "Revisión"}</p>
                                                    <p><strong>Fecha preferida:</strong> {msg.meetingDate ? new Date(msg.meetingDate).toLocaleString() : "Sin fecha"}</p>
                                                    <p className="pt-2 italic opacity-80">{msg.content}</p>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-current/20">
                                                    <Badge variant="outline" className={`
                                                        ${msg.meetingStatus === "confirmed" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : ""}
                                                        ${msg.meetingStatus === "pending" ? "border-amber-500 bg-amber-50 text-amber-700" : ""}
                                                    `}>
                                                        {msg.meetingStatus === "confirmed" ? "Confirmada" : "Pendiente"}
                                                    </Badge>

                                                    {msg.meetingStatus === "confirmed" && msg.meetingLink ? (
                                                        <Link href={`/crm/comunicaciones/meeting/${msg._id}`}>
                                                            <Button size="sm" variant={isStaff ? "secondary" : "default"} className="h-7 text-xs flex items-center gap-1">
                                                                <Video className="w-3 h-3" /> Entrar a Sala Nativa
                                                            </Button>
                                                        </Link>
                                                    ) : msg.meetingStatus === "pending" && !isStaff ? (
                                                        // It's pending and we are staff -> We can confirm it
                                                        // Wait, isStaff variable here indicates if the message was sent by Staff.
                                                        // Meeting requests are usually sent by clients, so meaning msg.isFromClient === true (isStaff=false).
                                                        // In either case, the staff user is the one viewing this page, so they can always confirm.
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                                                            onClick={() => handleConfirmMeeting(msg._id)}
                                                            disabled={isSending}
                                                        >
                                                            Aprobar y Crear Sala Nativa
                                                        </Button>
                                                    ) : msg.meetingStatus === "pending" && isStaff ? (
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            className="h-7 text-xs"
                                                            onClick={() => handleConfirmMeeting(msg._id)}
                                                            disabled={isSending}
                                                        >
                                                            Aprobar Reunión
                                                        </Button>
                                                    ) : null}
                                                </div>
                                            </div>
                                        )}

                                        <div className={`mt-2 text-[10px] ${isStaff ? 'text-indigo-200 text-right' : 'text-zinc-500'}`}>
                                            {isStaff ? "Tú" : msg.senderName || "Cliente"} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-zinc-200">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-end gap-2">
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 text-zinc-500 hover:text-indigo-600">
                        <Paperclip className="w-5 h-5" />
                    </Button>
                    <div className="flex-1 relative">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="w-full bg-zinc-50 border-zinc-200 pr-12 h-auto py-3"
                            disabled={isSending}
                        />
                    </div>
                    <Button
                        type="submit"
                        size="icon"
                        className="shrink-0 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white w-10 h-10 shadow-sm"
                        disabled={!newMessage.trim() || isSending}
                    >
                        <Send className="w-4 h-4 ml-1" />
                    </Button>
                </form>
            </div>
        </>
    );
}

