"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingDown, Calendar, Hash, CheckCircle2, CircleDashed, Building2, HardDrive, Car, Home } from "lucide-react";
import { sileo } from "sileo";
import { Badge } from "@/components/ui/badge";

export function AddExpenseDialog() {
    const [open, setOpen] = useState(false);

    const addExpense = useMutation(api.finance.addExpense);
    const allUsers = useQuery(api.users.getAllUsers) || [];
    const allProjects = useQuery(api.projects.getProjects) || [];

    // MVP Simulador: Tomamos el primer Admin
    const currentAdminId = allUsers[0]?._id;

    const [formData, setFormData] = useState({
        title: "",
        category: "servicios",
        amount: "",
        currency: "PEN",
        expenseDate: new Date().toISOString().split('T')[0],
        status: "pendiente",
        projectId: "none",
        providerName: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentAdminId) return;

        try {
            await addExpense({
                title: formData.title,
                category: formData.category as any,
                amount: parseFloat(formData.amount),
                currency: formData.currency as any,
                expenseDate: new Date(formData.expenseDate).getTime(),
                status: formData.status as any,
                projectId: formData.projectId !== "none" ? formData.projectId as Id<"projects"> : undefined,
                providerName: formData.providerName || undefined,
                registeredBy: currentAdminId
            });

            sileo.success({ title: "Egreso OPEX registrado con éxito" });
            setOpen(false);
            // Reset form
            setFormData({
                title: "", category: "servicios", amount: "", currency: "PEN",
                expenseDate: new Date().toISOString().split('T')[0], status: "pendiente",
                projectId: "none", providerName: ""
            });
        } catch (error) {
            sileo.error({ title: "Error al registrar el OPEX" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-2 shadow-sm rounded-xl">
                    <Plus className="w-4 h-4" />
                    Registrar Nuevo Egreso
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white border-zinc-200">
                <DialogHeader className="border-b border-zinc-100 pb-4">
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-zinc-900">
                        <TrendingDown className="w-5 h-5 text-red-500" />
                        Declaración de Gastos Operativos
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Concepto de Gasto</label>
                            <Input required placeholder="Ej: Pago Renovación Dominio AWS" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="h-11 bg-zinc-50" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Monto</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <span className="text-zinc-500 font-bold">{formData.currency === "PEN" ? "S/" : "$"}</span>
                                </div>
                                <Input required type="number" step="0.01" className="h-11 pl-9 bg-zinc-50 font-mono font-bold text-red-600" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Categoría Contable</label>
                            <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                                <SelectTrigger className="h-11 bg-zinc-50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nube"><div className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-purple-500" /> Infraestructura Nube</div></SelectItem>
                                    <SelectItem value="hardware"><div className="flex items-center gap-2"><Hash className="w-4 h-4 text-blue-500" /> Equipos Hardware</div></SelectItem>
                                    <SelectItem value="viaticos"><div className="flex items-center gap-2"><Car className="w-4 h-4 text-emerald-500" /> Transportes / Viáticos</div></SelectItem>
                                    <SelectItem value="alquiler"><div className="flex items-center gap-2"><Home className="w-4 h-4 text-orange-500" /> Alquileres Locales</div></SelectItem>
                                    <SelectItem value="servicios"><div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-zinc-500" /> Servicios Terceros</div></SelectItem>
                                    <SelectItem value="planilla"><div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-indigo-500" /> Cargas Laborales</div></SelectItem>
                                    <SelectItem value="caja_chica">Corte Caja Chica</SelectItem>
                                    <SelectItem value="marketing">Publicidad/Marketing</SelectItem>
                                    <SelectItem value="otro">Otro Egreso</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1"><Calendar className="w-3 h-3" /> Fecha Incurrida</label>
                            <Input required type="date" value={formData.expenseDate} onChange={e => setFormData({ ...formData, expenseDate: e.target.value })} className="h-11 bg-zinc-50" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Estado del Gasto</label>
                            <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                                <SelectTrigger className="h-11 bg-zinc-50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pendiente" className="font-bold text-amber-600">Por Pagar (Deuda)</SelectItem>
                                    <SelectItem value="pagado" className="font-bold text-emerald-600">Pagado / Ejecutado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 col-span-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Imputación a Proyecto (OPEX Directo)</label>
                            <Select value={formData.projectId} onValueChange={v => setFormData({ ...formData, projectId: v })}>
                                <SelectTrigger className="h-11 bg-zinc-50"><SelectValue placeholder="Gasto Global Administrativo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none" className="text-zinc-500 italic">No asociar - Gasto Global Administrativo</SelectItem>
                                    {allProjects?.map(p => <SelectItem key={p._id} value={p._id}>[PROY] {p.title}</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="text-zinc-600">Descartar</Button>
                        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-8">Confirmar Egreso</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
