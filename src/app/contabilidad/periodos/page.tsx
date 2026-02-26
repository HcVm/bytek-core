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
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="flex justify-between items-start max-w-7xl mx-auto w-full">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Periodos Contables</h1>
                        </div>
                        <p className="text-slate-500 font-medium pl-14">Apertura y cierre de meses contables para prevenir modificaciones al pasado.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-amber-600 text-white hover:bg-amber-700 shadow-md h-10 px-4 rounded-xl">
                                    <Plus className="w-4 h-4 mr-2" /> Abrir Periodo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[350px]">
                                <DialogHeader>
                                    <DialogTitle>Aperturar Periodo</DialogTitle>
                                    <DialogDescription>
                                        Inicia un nuevo mes contable para poder registrar asientos de operaciones, provisiones y comprobantes.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold">Año</label>
                                            <input
                                                type="number"
                                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                                value={year}
                                                onChange={e => setYear(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold">Mes</label>
                                            <input
                                                type="number"
                                                min="1" max="12"
                                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                                value={month}
                                                onChange={e => setMonth(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <Button onClick={handleCreate} className="w-full bg-amber-600 hover:bg-amber-700">
                                        Confirmar Apertura
                                    </Button>
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
                                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="w-10 h-10 text-amber-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-3">Sin Periodos Abiertos</h2>
                                <p className="text-slate-500 mb-6">Para que las operativas como facturación o compras generen asientos automáticos, necesitas abrir al menos el mes actual.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {periods.map(p => (
                                <div key={p._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden flex flex-col">
                                    {p.status === "abierto" && <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />}
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${p.status === "abierto" ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {p.status === "abierto" ? <PlayCircle className="w-5 h-5" /> : <StopCircle className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 leading-tight">{p.month.toString().padStart(2, '0')} / {p.year}</h3>
                                            </div>
                                        </div>
                                        <Badge variant={p.status === "abierto" ? "default" : "secondary"} className={p.status === "abierto" ? "bg-emerald-500 text-white" : ""}>
                                            {p.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex-1"></div>
                                    {p.status === "abierto" ? (
                                        <Button
                                            variant="outline"
                                            className="w-full text-red-600 border-red-200 hover:bg-red-50 relative z-10"
                                            onClick={() => handleClose(p._id)}
                                        >
                                            <StopCircle className="w-4 h-4 mr-2" /> Cerrar Periodo
                                        </Button>
                                    ) : (
                                        <div className="text-xs text-slate-500 text-center font-medium bg-slate-50 py-2 rounded-lg">
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
