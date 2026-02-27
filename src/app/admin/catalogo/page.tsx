"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Plus, Settings2, Pencil, Trash2, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { sileo } from "sileo";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function CatalogPage() {
    const packages = useQuery(api.packages.getPackages);
    const createPackage = useMutation(api.packages.createPackage);
    const updatePackage = useMutation(api.packages.updatePackage);
    const deletePackage = useMutation(api.packages.deletePackage);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<any>(null);

    // Form states
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [unit, setUnit] = useState<"digital" | "solutions" | "infra">("digital");
    const [type, setType] = useState<"service" | "subscription" | "hardware">("service");
    const [basePrice, setBasePrice] = useState("");
    const [isActive, setIsActive] = useState(true);

    const openEditDialog = (pkg: any) => {
        setEditingPackage(pkg);
        setName(pkg.name);
        setDescription(pkg.description);
        setUnit(pkg.unit);
        setType(pkg.type);
        setBasePrice(pkg.basePrice.toString());
        setIsActive(pkg.active);
        setIsDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingPackage(null);
        setName("");
        setDescription("");
        setUnit("digital");
        setType("service");
        setBasePrice("");
        setIsActive(true);
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const priceNum = parseFloat(basePrice);
        if (isNaN(priceNum) || priceNum < 0) {
            sileo.error({ title: "Coloca un precio base válido." });
            return;
        }

        const payload = {
            name,
            description,
            unit,
            type,
            basePrice: priceNum,
            active: isActive
        };

        try {
            if (editingPackage) {
                await updatePackage({ id: editingPackage._id, ...payload });
                sileo.success({ title: "Servicio actualizado con éxito." });
            } else {
                await createPackage(payload);
                sileo.success({ title: "Nuevo producto/servicio añadido al catálogo." });
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
            sileo.error({ title: "Ocurrió un error al procesar la solicitud." });
        }
    };

    const handleDelete = async (id: Id<"packages">) => {
        if (!process.env.NEXT_PUBLIC_CONVEX_URL) return; // Prevent arbitrary execution without user intent
        const confirmDelete = window.confirm("¿Seguro que deseas eliminar este ítem del catálogo?");
        if (!confirmDelete) return;

        try {
            await deletePackage({ id });
            sileo.success({ title: "Servicio eliminado del catálogo." });
        } catch (error) {
            console.error(error);
            sileo.error({ title: "Error al intentar eliminar." });
        }
    };

    const getUnitLabel = (u: string) => {
        const labels: Record<string, string> = { "digital": "U1 - Digital", "solutions": "U2 - Solutions", "infra": "U3 - Infra" };
        return labels[u] || u;
    };

    const getTypeColor = (t: string) => {
        switch (t) {
            case 'service': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400';
            case 'subscription': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400';
            case 'hardware': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400';
            default: return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400';
        }
    };

    return (
        <div className="p-8 h-full flex flex-col overflow-y-auto w-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Catálogo de Servicios</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">Gestiona el inventario de software, horas operativas y equipamiento (hardware) ofertados por BYTEK.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={openCreateDialog}>
                            <Plus className="w-4 h-4 mr-2" /> Añadir al Catálogo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingPackage ? 'Editar Ítem' : 'Nuevo Producto / Servicio'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Nombre del Producto/Servicio</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Implementación CRM Básico" />
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción y Alcance (Opcional)</Label>
                                <Textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Detalles sobre lo que incluye este paquete..."
                                    className="resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Unidad de Negocio</Label>
                                    <Select value={unit} onValueChange={(v: "digital" | "solutions" | "infra") => setUnit(v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="digital">U1 - Digital (Marketing/Ads)</SelectItem>
                                            <SelectItem value="solutions">U2 - Solutions (SaaS/Dev)</SelectItem>
                                            <SelectItem value="infra">U3 - Infra (Redes/Seguridad)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipo de Venta</Label>
                                    <Select value={type} onValueChange={(v: "service" | "subscription" | "hardware") => setType(v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="service">Desarrollo a Medida</SelectItem>
                                            <SelectItem value="subscription">Suscripción Recursiva</SelectItem>
                                            <SelectItem value="hardware">Producto Físico / Licencia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label>Precio Base (S/ Ref)</Label>
                                    <Input type="number" step="0.01" min="0" value={basePrice} onChange={e => setBasePrice(e.target.value)} required placeholder="0.00" />
                                </div>
                                <div className="flex items-center space-x-2 h-10">
                                    <Switch id="active-switch" checked={isActive} onCheckedChange={setIsActive} />
                                    <Label htmlFor="active-switch" className="cursor-pointer">{isActive ? 'Item Activo' : 'Item Inactivo'}</Label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">Guardar Cambios</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {!packages ? (
                <div className="flex flex-col items-center justify-center p-20 text-zinc-400">
                    <PackageSearch className="w-10 h-10 mb-4 animate-pulse" />
                    <p className="dark:text-zinc-500">Sincronizando catálogo con el servidor principal...</p>
                </div>
            ) : packages.length === 0 ? (
                <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
                    <Settings2 className="w-12 h-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Catálogo Vacío</h3>
                    <p className="mt-1 dark:text-zinc-400">Registra los primeros servicios y hardware de BYTEK para nutrir las Oportunidades y Cotizaciones.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {packages.map(pkg => (
                        <div key={pkg._id} className={`bg-white dark:bg-zinc-900 border rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md flex flex-col ${!pkg.active ? 'opacity-60 grayscale' : 'border-zinc-200 dark:border-zinc-800'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <Badge className={`${getTypeColor(pkg.type)} capitalize font-semibold shadow-none text-[10px]`}>
                                    {pkg.type === 'service' ? 'Servicio' : pkg.type === 'subscription' ? 'Suscripción' : 'Hardware'}
                                </Badge>
                                {!pkg.active && <span className="text-xs text-red-500 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/20 px-2 rounded-full">INACTIVO</span>}
                            </div>

                            <h3 className="font-bold text-zinc-900 dark:text-white text-lg leading-tight mb-1">{pkg.name}</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3">{getUnitLabel(pkg.unit)}</p>

                            <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-3 mb-4 flex-1">
                                {pkg.description || "Sin descripción proporcionada."}
                            </p>

                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Desde</p>
                                    <p className="font-bold text-lg text-emerald-600 dark:text-emerald-500">{formatCurrency(pkg.basePrice)}</p>
                                </div>
                                <div className="flex gap-1 justify-end">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" onClick={() => openEditDialog(pkg)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDelete(pkg._id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
