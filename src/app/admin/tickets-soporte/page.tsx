"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { LifeBuoy, Plus, MessageSquare, X, UserCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function TicketsSoportePage() {
    const [statusFilter, setStatusFilter] = useState<string>("");
    const tickets = useQuery(api.supportTickets.getAllTickets, statusFilter ? { status: statusFilter } : {}) || [];
    const clients = useQuery(api.clients.getClients) || [];
    const users = useQuery(api.users.getAllUsers) || [];
    const createTicket = useMutation(api.supportTickets.createTicket);
    const updateStatus = useMutation(api.supportTickets.updateTicketStatus);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ clientId: "", subject: "", description: "", priority: "media" as any });

    const handleCreate = async () => {
        if (!form.clientId || !form.subject || !form.description) return;
        await createTicket({ clientId: form.clientId as any, subject: form.subject, description: form.description, priority: form.priority });
        setForm({ clientId: "", subject: "", description: "", priority: "media" });
        setShowForm(false);
    };

    const statusColors: Record<string, string> = {
        abierto: "bg-blue-100 text-blue-700", en_progreso: "bg-amber-100 text-amber-700",
        resuelto: "bg-emerald-100 text-emerald-700", cerrado: "bg-slate-100 text-slate-700",
    };
    const statusLabels: Record<string, string> = {
        abierto: "Abierto", en_progreso: "En Progreso", resuelto: "Resuelto", cerrado: "Cerrado",
    };
    const priorityColors: Record<string, string> = {
        baja: "border-slate-300 text-slate-600", media: "border-blue-300 text-blue-600",
        alta: "border-amber-300 text-amber-600", critica: "border-red-300 text-red-600",
    };

    const openCount = tickets.filter(t => t.status === "abierto").length;
    const inProgressCount = tickets.filter(t => t.status === "en_progreso").length;
    const criticalCount = tickets.filter(t => t.priority === "critica" && t.status !== "cerrado").length;

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="flex justify-between items-start max-w-7xl mx-auto w-full">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                <LifeBuoy className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Tickets de Soporte</h1>
                        </div>
                        <p className="text-slate-500 font-medium pl-14">Gestión de incidencias y soporte al cliente.</p>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="bg-rose-600 hover:bg-rose-700 text-white gap-2">
                        <Plus className="w-4 h-4" /> Nuevo ticket
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8 space-y-8">

                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 relative z-10">Total Tickets</p>
                            <h3 className="text-2xl font-black text-white relative z-10">{tickets.length}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Abiertos</p>
                            <h3 className="text-2xl font-black text-blue-600">{openCount}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">En Progreso</p>
                            <h3 className="text-2xl font-black text-amber-600">{inProgressCount}</h3>
                        </div>
                        {criticalCount > 0 && (
                            <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200 shadow-sm">
                                <p className="text-xs font-bold text-red-600 uppercase mb-1">Críticos</p>
                                <h3 className="text-2xl font-black text-red-700">{criticalCount}</h3>
                            </div>
                        )}
                    </div>

                    {/* Filter */}
                    <div className="flex gap-2">
                        {["", "abierto", "en_progreso", "resuelto", "cerrado"].map(s => (
                            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm"
                                className={`text-xs ${statusFilter === s ? 'bg-rose-600 text-white' : ''}`}
                                onClick={() => setStatusFilter(s)}>
                                {s === "" ? "Todos" : statusLabels[s] || s}
                            </Button>
                        ))}
                    </div>

                    {/* Tickets List */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {tickets.length === 0 ? (
                            <div className="p-16 text-center text-slate-400">
                                <MessageSquare className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                                <p className="font-medium">Sin tickets registrados.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {tickets.map((t: any) => (
                                    <div key={t._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 transition-colors">
                                        <div className={`w-2 h-10 rounded-full ${t.priority === 'critica' ? 'bg-red-500' : t.priority === 'alta' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900">{t.subject}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{t.description}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                {t.clientName} · {new Date(t.createdAt).toLocaleDateString("es-PE")}
                                                {t.assignedToName && <> · <UserCircle2 className="w-3 h-3 inline" /> {t.assignedToName}</>}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className={`text-[10px] ${priorityColors[t.priority]}`}>{t.priority.toUpperCase()}</Badge>
                                        <Badge className={`${statusColors[t.status] || ''} text-[10px]`}>{statusLabels[t.status] || t.status}</Badge>
                                        {t.status === "abierto" && (
                                            <Button size="sm" variant="outline" className="text-xs"
                                                onClick={() => updateStatus({ ticketId: t._id, status: "en_progreso" })}>
                                                Tomar
                                            </Button>
                                        )}
                                        {t.status === "en_progreso" && (
                                            <Button size="sm" variant="outline" className="text-xs text-emerald-600 border-emerald-300"
                                                onClick={() => updateStatus({ ticketId: t._id, status: "resuelto" })}>
                                                Resolver
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Modal */}
                    {showForm && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-slate-900">Nuevo Ticket de Soporte</h3>
                                    <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">Cliente</Label>
                                        <Select value={form.clientId} onValueChange={v => setForm({ ...form, clientId: v })}>
                                            <SelectTrigger><SelectValue placeholder="Seleccionar cliente..." /></SelectTrigger>
                                            <SelectContent>
                                                {clients.map((c: any) => (
                                                    <SelectItem key={c._id} value={c._id}>{c.companyName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">Asunto</Label>
                                        <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Problema con el módulo X" />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">Descripción</Label>
                                        <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe el problema en detalle..." />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">Prioridad</Label>
                                        <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="baja">Baja</SelectItem>
                                                <SelectItem value="media">Media</SelectItem>
                                                <SelectItem value="alta">Alta</SelectItem>
                                                <SelectItem value="critica">Crítica</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                                    <Button onClick={handleCreate} className="bg-rose-600 hover:bg-rose-700 text-white">Crear ticket</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
