"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { ShieldAlert, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sileo } from "sileo";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const PROB_LEVELS = ["low", "medium", "high", "critical"] as const;
const IMPACT_LEVELS = ["low", "medium", "high", "critical"] as const;
const STATUS_LEVELS = ["identified", "mitigating", "resolved", "accepted"] as const;

const LEVEL_LABELS: Record<string, string> = { low: "Bajo", medium: "Medio", high: "Alto", critical: "Crítico" };
const STATUS_LABELS: Record<string, string> = { identified: "Identificado", mitigating: "Mitigando", resolved: "Resuelto", accepted: "Aceptado" };

const MATRIX_COLORS: Record<string, string> = {
    "low-low": "bg-green-100", "low-medium": "bg-green-200", "low-high": "bg-yellow-100", "low-critical": "bg-yellow-200",
    "medium-low": "bg-green-200", "medium-medium": "bg-yellow-200", "medium-high": "bg-orange-200", "medium-critical": "bg-orange-300",
    "high-low": "bg-yellow-100", "high-medium": "bg-orange-200", "high-high": "bg-red-200", "high-critical": "bg-red-300",
    "critical-low": "bg-yellow-200", "critical-medium": "bg-orange-300", "critical-high": "bg-red-300", "critical-critical": "bg-red-400",
};

export default function RiskRegistry() {
    const risks = useQuery(api.risks.getAllRisks);
    const projects = useQuery(api.projects.getProjects);
    const allUsers = useQuery(api.users.getAllUsers);
    const createRisk = useMutation(api.risks.createRisk);
    const updateRisk = useMutation(api.risks.updateRisk);
    const deleteRisk = useMutation(api.risks.deleteRisk);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<Id<"projectRisks"> | null>(null);

    // Form
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [projectId, setProjectId] = useState("");
    const [probability, setProbability] = useState<typeof PROB_LEVELS[number]>("medium");
    const [impact, setImpact] = useState<typeof IMPACT_LEVELS[number]>("medium");
    const [status, setStatus] = useState<typeof STATUS_LEVELS[number]>("identified");
    const [mitigation, setMitigation] = useState("");
    const [ownerId, setOwnerId] = useState("");

    const openCreate = () => {
        setEditingId(null); setTitle(""); setDescription(""); setProjectId(""); setProbability("medium"); setImpact("medium"); setStatus("identified"); setMitigation(""); setOwnerId("");
        setIsDialogOpen(true);
    };

    const openEdit = (risk: any) => {
        setEditingId(risk._id); setTitle(risk.title); setDescription(risk.description || ""); setProjectId(risk.projectId); setProbability(risk.probability); setImpact(risk.impact); setStatus(risk.status); setMitigation(risk.mitigation || ""); setOwnerId(risk.ownerId);
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !ownerId) { sileo.error({ title: "Selecciona proyecto y responsable." }); return; }
        try {
            if (editingId) {
                await updateRisk({ id: editingId, title, description, probability, impact, status, mitigation, ownerId: ownerId as Id<"users"> });
                sileo.success({ title: "Riesgo actualizado." });
            } else {
                await createRisk({ projectId: projectId as Id<"projects">, title, description, probability, impact, status, mitigation, ownerId: ownerId as Id<"users"> });
                sileo.success({ title: "Riesgo registrado." });
            }
            setIsDialogOpen(false);
        } catch (e) { sileo.error({ title: "Error al guardar." }); }
    };

    const handleDelete = async (id: Id<"projectRisks">) => {
        if (!confirm("¿Eliminar este riesgo?")) return;
        await deleteRisk({ id });
        sileo.success({ title: "Riesgo eliminado." });
    };

    if (risks === undefined) return <div className="p-10 flex items-center justify-center h-full"><span className="animate-pulse text-slate-400 font-semibold tracking-widest text-sm uppercase">Cargando Riesgos...</span></div>;

    // Agrupar para la Matriz
    const matrixData: Record<string, any[]> = {};
    risks.forEach(r => {
        const key = `${r.probability}-${r.impact}`;
        if (!matrixData[key]) matrixData[key] = [];
        matrixData[key].push(r);
    });

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'resolved': return 'bg-emerald-100 text-emerald-700';
            case 'mitigating': return 'bg-amber-100 text-amber-700';
            case 'accepted': return 'bg-blue-100 text-blue-700';
            default: return 'bg-red-100 text-red-700';
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Registro de Riesgos</h1>
                    <p className="text-slate-500 dark:text-zinc-400 mt-1">Matriz de Probabilidad × Impacto (PMI) para gestión proactiva de amenazas.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Registrar Riesgo</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[520px]">
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Editar Riesgo' : 'Nuevo Riesgo'}</DialogTitle>
                            <DialogDescription>Documenta la amenaza y su plan de mitigación.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4 pt-2">
                            <div className="space-y-2"><Label>Título</Label><Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ej: Dependencia crítica de proveedor cloud" /></div>
                            <div className="space-y-2"><Label>Contexto / Descripción</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} className="resize-none" placeholder="Describe el escenario de riesgo..." /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="dark:text-zinc-300">Proyecto</Label>
                                    <Select value={projectId} onValueChange={setProjectId}>
                                        <SelectTrigger className="dark:bg-zinc-950 dark:border-zinc-800"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                        <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">{projects?.map(p => <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="dark:text-zinc-300">Responsable</Label>
                                    <Select value={ownerId} onValueChange={setOwnerId}>
                                        <SelectTrigger className="dark:bg-zinc-950 dark:border-zinc-800"><SelectValue placeholder="Asignar..." /></SelectTrigger>
                                        <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">{allUsers?.map(u => <SelectItem key={u._id} value={u._id}>{u.name || u.email || "Usuario"}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="dark:text-zinc-300">Probabilidad</Label>
                                    <Select value={probability} onValueChange={(v: any) => setProbability(v)}>
                                        <SelectTrigger className="dark:bg-zinc-950 dark:border-zinc-800"><SelectValue /></SelectTrigger>
                                        <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">{PROB_LEVELS.map(l => <SelectItem key={l} value={l}>{LEVEL_LABELS[l]}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="dark:text-zinc-300">Impacto</Label>
                                    <Select value={impact} onValueChange={(v: any) => setImpact(v)}>
                                        <SelectTrigger className="dark:bg-zinc-950 dark:border-zinc-800"><SelectValue /></SelectTrigger>
                                        <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">{IMPACT_LEVELS.map(l => <SelectItem key={l} value={l}>{LEVEL_LABELS[l]}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="dark:text-zinc-300">Estado</Label>
                                    <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                                        <SelectTrigger className="dark:bg-zinc-950 dark:border-zinc-800"><SelectValue /></SelectTrigger>
                                        <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">{STATUS_LEVELS.map(l => <SelectItem key={l} value={l}>{STATUS_LABELS[l]}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2"><Label>Plan de Mitigación</Label><Textarea value={mitigation} onChange={e => setMitigation(e.target.value)} className="resize-none" placeholder="Acciones preventivas para reducir la probabilidad o impacto..." /></div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">Guardar</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>

            {/* MATRIZ VISUAL 4x4 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
                    <h3 className="font-bold text-sm text-slate-700 dark:text-zinc-300">Matriz de Riesgos (Probabilidad × Impacto)</h3>
                </div>
                <div className="p-6 overflow-x-auto">
                    <div className="flex">
                        {/* Y-axis label */}
                        <div className="flex flex-col justify-between pr-3 py-1 items-end" style={{ width: 100 }}>
                            <span className="text-[10px] font-bold text-red-600 uppercase">Crítica</span>
                            <span className="text-[10px] font-bold text-orange-600 uppercase">Alta</span>
                            <span className="text-[10px] font-bold text-yellow-600 uppercase">Media</span>
                            <span className="text-[10px] font-bold text-green-600 uppercase">Baja</span>
                        </div>
                        <div className="flex-1">
                            <div className="grid grid-cols-4 gap-1.5">
                                {[...PROB_LEVELS].reverse().map(prob => (
                                    IMPACT_LEVELS.map(imp => {
                                        const key = `${prob}-${imp}`;
                                        const cellRisks = matrixData[key] || [];
                                        return (
                                            <div key={key} className={`${MATRIX_COLORS[key]} dark:opacity-80 rounded-lg p-2 min-h-[70px] flex flex-col gap-1`}>
                                                {cellRisks.map((r: any) => (
                                                    <div key={r._id} className="bg-white/80 dark:bg-zinc-900/80 rounded px-2 py-1 text-[10px] font-medium text-slate-800 dark:text-zinc-200 flex items-center justify-between gap-1 hover:bg-white dark:hover:bg-zinc-800 transition cursor-pointer" onClick={() => openEdit(r)}>
                                                        <span className="truncate">{r.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })
                                ))}
                            </div>
                            {/* X-axis labels */}
                            <div className="grid grid-cols-4 gap-1.5 mt-2">
                                {IMPACT_LEVELS.map(imp => (
                                    <div key={imp} className="text-center text-[10px] font-bold uppercase text-slate-500">{LEVEL_LABELS[imp]}</div>
                                ))}
                            </div>
                            <p className="text-center text-[10px] text-slate-400 mt-1 uppercase tracking-wider">→ Impacto →</p>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2" style={{ marginLeft: 100 }}>↑ Probabilidad ↑</p>
                </div>
            </div>

            {/* LISTADO TABULAR */}
            {risks.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
                        <h3 className="font-bold text-sm text-slate-700 dark:text-zinc-300">Todos los Riesgos ({risks.length})</h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {risks.map(risk => (
                            <div key={risk._id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-slate-900 dark:text-white">{risk.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">{risk.projectTitle} · {risk.ownerName}</p>
                                </div>
                                <Badge className={`${getStatusColor(risk.status)} dark:opacity-80 text-[10px] uppercase font-bold shadow-none`}>{STATUS_LABELS[risk.status]}</Badge>
                                <Badge variant="outline" className="text-[10px] uppercase shadow-none border-slate-200 dark:border-zinc-800 dark:text-zinc-400">{LEVEL_LABELS[risk.probability]} / {LEVEL_LABELS[risk.impact]}</Badge>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-indigo-600" onClick={() => openEdit(risk)}><Pencil className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => handleDelete(risk._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
