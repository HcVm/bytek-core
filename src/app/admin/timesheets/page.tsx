"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Clock, Plus, CheckCircle2, Timer, FileBarChart, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

export default function TimesheetsPage() {
    const [statusFilter, setStatusFilter] = useState<string>("");
    const entries = useQuery(api.timeEntries.getTimeEntries, statusFilter ? { status: statusFilter } : {}) || [];
    const logTime = useMutation(api.timeEntries.logTime);
    const approveEntries = useMutation(api.timeEntries.approveTimeEntries);
    const [showForm, setShowForm] = useState(false);

    // Get projects for the dropdown
    const projects = useQuery(api.projects.getProjects) || [];
    const users = useQuery(api.users.getAllUsers) || [];

    const [form, setForm] = useState({
        userId: "", projectId: "", date: new Date().toISOString().split("T")[0],
        hours: "", description: "", billable: true, hourlyRate: "",
    });

    const handleLog = async () => {
        if (!form.userId || !form.projectId || !form.hours || !form.description) return;
        await logTime({
            userId: form.userId as any, projectId: form.projectId as any,
            date: form.date, hours: parseFloat(form.hours),
            description: form.description, billable: form.billable,
            hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined,
        });
        setShowForm(false);
    };

    const handleApproveAll = async () => {
        const draftIds = entries.filter(e => e.status === "draft").map(e => e._id);
        if (draftIds.length === 0) return;
        await approveEntries({ entryIds: draftIds, approvedBy: entries[0]?.userId || ("" as any) });
    };

    const totalHours = entries.reduce((s, e) => s + e.hours, 0);
    const billableHours = entries.filter(e => e.billable).reduce((s, e) => s + e.hours, 0);
    const billableAmount = entries.filter(e => e.billable).reduce((s, e) => s + (e.hours * (e.hourlyRate || 0)), 0);

    const statusColors: Record<string, string> = {
        draft: "bg-slate-100 text-slate-700", approved: "bg-emerald-100 text-emerald-700",
        invoiced: "bg-blue-100 text-blue-700",
    };
    const statusLabels: Record<string, string> = {
        draft: "Borrador", approved: "Aprobado", invoiced: "Facturado",
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="flex justify-between items-start max-w-7xl mx-auto w-full">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Registro de Horas</h1>
                        </div>
                        <p className="text-slate-500 font-medium pl-14">Timesheets para facturación T&M y control de dedicación.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleApproveAll} className="gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4" /> Aprobar todos
                        </Button>
                        <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                            <Plus className="w-4 h-4" /> Registrar horas
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8 space-y-8">

                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 relative z-10">Horas Totales</p>
                            <h3 className="text-2xl font-black text-white relative z-10">{totalHours.toFixed(1)}h</h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Horas Facturables</p>
                            <h3 className="text-2xl font-black text-teal-600">{billableHours.toFixed(1)}h</h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Valor Facturable</p>
                            <h3 className="text-2xl font-black text-slate-900">{formatCurrency(billableAmount)}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Registros</p>
                            <h3 className="text-2xl font-black text-slate-900">{entries.length}</h3>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="flex gap-2">
                        {["", "draft", "approved", "invoiced"].map(s => (
                            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm"
                                className={`text-xs ${statusFilter === s ? 'bg-teal-600 text-white' : ''}`}
                                onClick={() => setStatusFilter(s)}>
                                {s === "" ? "Todos" : statusLabels[s] || s}
                            </Button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {entries.length === 0 ? (
                            <div className="p-16 text-center text-slate-400">
                                <Timer className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                                <p className="font-medium">Sin registros de horas.</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Colaborador</th>
                                        <th className="text-left px-3 py-3 text-xs font-bold text-slate-500 uppercase">Proyecto</th>
                                        <th className="text-left px-3 py-3 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                                        <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 uppercase">Horas</th>
                                        <th className="text-left px-3 py-3 text-xs font-bold text-slate-500 uppercase">Descripción</th>
                                        <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {entries.map((e: any) => (
                                        <tr key={e._id} className="hover:bg-slate-50/80">
                                            <td className="px-5 py-3 font-medium text-slate-900">{e.userName}</td>
                                            <td className="px-3 py-3 text-slate-600">{e.projectName}</td>
                                            <td className="px-3 py-3 text-slate-600">{e.date}</td>
                                            <td className="text-right px-3 py-3 font-mono font-bold text-slate-900">
                                                {e.hours.toFixed(1)}h
                                                {e.billable && <FileBarChart className="w-3 h-3 text-teal-500 inline ml-1" />}
                                            </td>
                                            <td className="px-3 py-3 text-slate-500 text-xs truncate max-w-[200px]">{e.description}</td>
                                            <td className="text-right px-5 py-3">
                                                <Badge className={`${statusColors[e.status] || ''} text-[10px]`}>{statusLabels[e.status] || e.status}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Modal */}
                    {showForm && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-slate-900">Registrar Horas</h3>
                                    <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">Colaborador</Label>
                                        <Select value={form.userId} onValueChange={v => setForm({ ...form, userId: v })}>
                                            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                            <SelectContent>
                                                {users.map((u: any) => (
                                                    <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">Proyecto</Label>
                                        <Select value={form.projectId} onValueChange={v => setForm({ ...form, projectId: v })}>
                                            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                            <SelectContent>
                                                {projects.map((p: any) => (
                                                    <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">Fecha</Label>
                                        <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">Horas</Label>
                                        <Input type="number" step="0.5" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="4.5" />
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-xs font-bold text-slate-600">Descripción</Label>
                                        <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Desarrollo del módulo X..." />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600">Tarifa/hora (S/)</Label>
                                        <Input type="number" value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} placeholder="120" />
                                    </div>
                                    <div className="flex items-end">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input type="checkbox" checked={form.billable} onChange={e => setForm({ ...form, billable: e.target.checked })} className="rounded" />
                                            <span className="font-medium text-slate-700">Facturable</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                                    <Button onClick={handleLog} className="bg-teal-600 hover:bg-teal-700 text-white">Registrar</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
