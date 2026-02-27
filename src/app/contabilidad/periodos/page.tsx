"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Briefcase, Plus, AlertCircle, PlayCircle, StopCircle, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { sileo } from "sileo";

export default function PeriodosPage() {
    const periods = useQuery(api.accounting.getAccountingPeriods) || [];
    const createPeriod = useMutation(api.accounting.createAccountingPeriod);
    const closePeriod = useMutation(api.accounting.closeAccountingPeriod);

    // Suponemos que el primer usuario es el admin que cierra (por simplicidad, o tomamos de sesión si tuviéramos id)
    const users = useQuery(api.users.getAllUsers) || [];
    const currentUserId = users[0]?._id;

    const [open, setOpen] = useState(false);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

    const handleCreate = async () => {
        try {
            await createPeriod({ year, month });
            sileo.success({ title: "Periodo abierto exitosamente" });
            setOpen(false);
        } catch (error: any) {
            sileo.error({ title: error.message || "Error al crear periodo" });
        }
    };

    const handleClose = async (periodId: any) => {
        if (!currentUserId) return;
        if (!confirm("¿Está seguro de cerrar este periodo? Se generarán los asientos automáticos de cierre.")) return;

        try {
            await closePeriod({ periodId, closedBy: currentUserId });
            sileo.success({ title: "Periodo cerrado exitosamente" });
        } catch (error: any) {
            sileo.error({ title: error.message || "Error al cerrar periodo" });
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 overflow-hidden">
            <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="flex justify-between items-start max-w-7xl mx-auto w-full">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Periodos Contables</h1>
                        </div>
                        <p className="text-slate-500 dark:text-zinc-400 font-medium pl-14">Apertura y cierre de meses contables para prevenir modificaciones al pasado.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-amber-600 text-white hover:bg-amber-700 shadow-md h-10 px-4 rounded-xl">
                                    <Plus className="w-4 h-4 mr-2" /> Abrir Periodo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[400px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
                                <DialogHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-500">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <DialogTitle className="text-xl font-bold dark:text-white">Aperturar Periodo</DialogTitle>
                                    </div>
                                    <DialogDescription className="dark:text-zinc-400">
                                        Inicia un nuevo mes contable para poder registrar asientos de operaciones, provisiones y comprobantes.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-2">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider pl-1 font-semibold">Año</label>
                                            <input
                                                type="number"
                                                className="flex h-11 w-full rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                                                value={year}
                                                onChange={e => setYear(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider pl-1 font-semibold">Mes</label>
                                            <input
                                                type="number"
                                                min="1" max="12"
                                                className="flex h-11 w-full rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                                                value={month}
                                                onChange={e => setMonth(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 h-11 rounded-xl dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancelar</Button>
                                        <Button onClick={handleCreate} className="flex-1 h-11 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg transition-all active:scale-95">
                                            Confirmar Apertura
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8 flex flex-col h-full">
                    {periods.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center max-w-md">
                                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="w-10 h-10 text-amber-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Sin Periodos Abiertos</h2>
                                <p className="text-slate-500 dark:text-zinc-400 mb-6">Para que las operativas como facturación o compras generen asientos automáticos, necesitas abrir al menos el mes actual.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {periods.map(p => (
                                <div key={p._id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-8 relative overflow-hidden flex flex-col group transition-all hover:shadow-xl hover:-translate-y-1">
                                    {p.status === "abierto" && <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />}
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${p.status === "abierto" ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500'}`}>
                                                {p.status === "abierto" ? <PlayCircle className="w-6 h-6" /> : <StopCircle className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{p.month.toString().padStart(2, '0')} / {p.year}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">Periodo Fiscal</p>
                                            </div>
                                        </div>
                                        <Badge variant={p.status === "abierto" ? "default" : "secondary"} className={`px-3 py-1 rounded-lg text-[10px] border-none ${p.status === "abierto" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"}`}>
                                            {p.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex-1 mb-8">
                                        <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-zinc-800">
                                            <span className="text-slate-500 dark:text-zinc-500">Movimientos</span>
                                            <span className="font-bold text-slate-900 dark:text-zinc-300">-</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-zinc-800">
                                            <span className="text-slate-500 dark:text-zinc-500">Última Accion</span>
                                            <span className="font-bold text-slate-900 dark:text-zinc-300">{p.status === 'abierto' ? 'Aperturado' : 'Cerrado'}</span>
                                        </div>
                                    </div>
                                    {p.status === "abierto" ? (
                                        <Button
                                            variant="outline"
                                            className="w-full h-11 rounded-xl text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all font-bold relative z-10"
                                            onClick={() => handleClose(p._id)}
                                        >
                                            <StopCircle className="w-4 h-4 mr-2" /> Cerrar Periodo
                                        </Button>
                                    ) : (
                                        <div className="text-xs text-slate-500 dark:text-zinc-500 text-center font-bold bg-slate-50 dark:bg-zinc-950/50 py-3 rounded-xl border border-slate-100 dark:border-zinc-800/50">
                                            Cerrado definitivamente
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
