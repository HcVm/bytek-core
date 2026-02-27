"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Activity, Send, Paperclip, CalendarPlus, FileIcon, MessageCircle, ChevronLeft, Video } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ClientCommunicationPage() {
    const params = useParams();
    const clientId = params.clientId as Id<"clients">;

    const messages = useQuery(api.clientPortal.getMessages, { clientId });
    const sendMessage = useMutation(api.clientPortal.sendMessage);
    const generateUploadUrl = useMutation(api.clientPortal.generateMessageUploadUrl);
    const sendDocumentMessage = useMutation(api.clientPortal.sendDocumentMessage);

    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showMeetingProposal, setShowMeetingProposal] = useState(false);
    const [meetingTitle, setMeetingTitle] = useState("");
    const [meetingDate, setMeetingDate] = useState("");

    // Auto-scroll to bottom of messages could be added here with a ref

    if (messages === undefined) {
        return (
            <div className="flex h-[80vh] items-center justify-center text-zinc-400">
                <Activity className="w-6 h-6 animate-pulse mr-2" />
                <span>Cargando historial de comunicaciones...</span>
            </div>
        );
    }

    if (messages === null) {
        return notFound();
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && !showMeetingProposal) return;

        setIsSending(true);
        try {
            if (showMeetingProposal && meetingTitle && meetingDate) {
                await sendMessage({
                    clientId,
                    isFromClient: true,
                    content: newMessage || "Quisiera agendar una reunión.",
                    type: "meeting",
                    meetingTitle,
                    meetingDate: new Date(meetingDate).getTime()
                });
                setShowMeetingProposal(false);
                setMeetingTitle("");
                setMeetingDate("");
            } else {
                await sendMessage({
                    clientId,
                    isFromClient: true,
                    content: newMessage,
                    type: "text",
                });
            }
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSending(true);
        try {
            // 1. Get upload URL
            const postUrl = await generateUploadUrl();

            // 2. Upload file to Convex
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();

            // 3. Save message with file reference
            await sendDocumentMessage({
                clientId,
                isFromClient: true,
                content: "Adjunto documento.",
                fileId: storageId,
                fileName: file.name
            });

        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setIsSending(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex flex-col md:flex-row gap-4 justify-between md:items-center"
            >
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-indigo-600" /> Centro de Comunicación
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">Converse con nuestro equipo de soporte, comparta documentos o coordine reuniones.</p>
                </div>
                <Link href={`/client-portal/${clientId}`}>
                    <Button variant="outline" className="text-zinc-600 hover:text-indigo-600">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Volver al Dashboard
                    </Button>
                </Link>
            </motion.div>

            <Card className="flex-1 flex flex-col overflow-hidden border-zinc-200 shadow-sm">
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-3">
                            <MessageCircle className="w-12 h-12 text-zinc-200" />
                            <p>No hay mensajes todavía. ¡Comienza a conversar!</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <motion.div
                                key={msg._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * Math.min(idx, 10) }}
                                className={`flex ${msg.isFromClient ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] rounded-2xl p-4 ${msg.isFromClient ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border text-zinc-800 rounded-bl-none shadow-sm'}`}>

                                    {!msg.isFromClient && (
                                        <div className="text-xs font-semibold mb-1 text-zinc-500">
                                            {msg.senderName}
                                        </div>
                                    )}

                                    {msg.type === "text" && (
                                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                    )}

                                    {msg.type === "document" && (
                                        <div className="space-y-2">
                                            <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                            <a
                                                href={msg.fileUrl || "#"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${msg.isFromClient ? 'bg-indigo-700/50 border-indigo-500 hover:bg-indigo-700' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'}`}
                                            >
                                                <FileIcon className={`w-5 h-5 ${msg.isFromClient ? 'text-indigo-200' : 'text-zinc-500'}`} />
                                                <span className="text-sm font-medium truncate max-w-[200px]">{msg.fileName}</span>
                                            </a>
                                        </div>
                                    )}

                                    {msg.type === "meeting" && (
                                        <div className="space-y-3">
                                            <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                            <div className={`p-4 rounded-xl border ${msg.isFromClient ? 'bg-indigo-700/50 border-indigo-500' : 'bg-amber-50 border-amber-200'}`}>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3">
                                                        <CalendarPlus className={`w-5 h-5 mt-0.5 ${msg.isFromClient ? 'text-indigo-200' : 'text-amber-600'}`} />
                                                        <div>
                                                            <h4 className={`font-semibold text-sm ${msg.isFromClient ? 'text-white' : 'text-amber-900'}`}>Propuesta de Reunión</h4>
                                                            <p className={`font-medium ${msg.isFromClient ? 'text-indigo-100' : 'text-amber-800'}`}>{msg.meetingTitle}</p>
                                                            {msg.meetingDate && (
                                                                <p className={`text-xs mt-1 ${msg.isFromClient ? 'text-indigo-200' : 'text-amber-700'}`}>
                                                                    {new Date(msg.meetingDate).toLocaleString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {msg.meetingStatus && (
                                                        <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${msg.meetingStatus === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                                                            msg.meetingStatus === "pending" ? "bg-amber-100 text-amber-700" :
                                                                "bg-zinc-100 text-zinc-700"
                                                            }`}>
                                                            {msg.meetingStatus === "confirmed" ? "Confirmada" :
                                                                msg.meetingStatus === "completed" ? "Finalizada" :
                                                                    msg.meetingStatus === "cancelled" ? "Cancelada" : "Pendiente"}
                                                        </div>
                                                    )}
                                                </div>

                                                {msg.meetingStatus === "confirmed" && msg.meetingLink && (
                                                    <div className="mt-4 pt-4 border-t border-dashed border-amber-200">
                                                        <Link href={`/client-portal/${clientId}/communication/meeting/${msg._id}`} className="block w-full">
                                                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center justify-center gap-2">
                                                                <Video className="w-4 h-4" /> Entrar a Sala Nativa
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className={`text-[10px] mt-2 flex justify-end ${msg.isFromClient ? 'text-indigo-200' : 'text-zinc-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </CardContent>

                <CardFooter className="p-4 bg-white border-t space-y-4 flex flex-col">
                    {showMeetingProposal && (
                        <div className="w-full bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3 relative">
                            <h4 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
                                <CalendarPlus className="w-4 h-4 text-indigo-600" /> Agendar Reunión
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-600">Tema</label>
                                    <Input
                                        placeholder="Ej. Revisión de avances"
                                        value={meetingTitle}
                                        onChange={(e) => setMeetingTitle(e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-600">Fecha y Hora Propuesta</label>
                                    <Input
                                        type="datetime-local"
                                        value={meetingDate}
                                        onChange={(e) => setMeetingDate(e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 h-6 w-6 p-0 text-zinc-400 hover:text-red-500"
                                onClick={() => setShowMeetingProposal(false)}
                            >
                                &times;
                            </Button>
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="flex gap-2 w-full items-end">
                        <div className="flex flex-col gap-2">
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 shrink-0 text-zinc-500 hover:text-indigo-600"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSending}
                                title="Adjuntar documento"
                            >
                                <Paperclip className="w-4 h-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className={`h-10 w-10 shrink-0 ${showMeetingProposal ? 'border-amber-500 text-amber-600 bg-amber-50' : 'text-zinc-500 hover:text-amber-600'}`}
                                onClick={() => setShowMeetingProposal(!showMeetingProposal)}
                                disabled={isSending}
                                title="Propuesta de reunión"
                            >
                                <CalendarPlus className="w-4 h-4" />
                            </Button>
                        </div>

                        <Textarea
                            placeholder="Escribe tu mensaje aquí..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="min-h-[80px] resize-none flex-1 focus-visible:ring-indigo-500"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        />

                        <Button
                            type="submit"
                            className="h-[80px] px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white shrink-0"
                            disabled={isSending || (!newMessage.trim() && !showMeetingProposal)}
                        >
                            {isSending ? <Activity className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
