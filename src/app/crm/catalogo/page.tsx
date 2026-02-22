"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { PackageFormDialog } from "./PackageFormDialog";

export default function CatalogoPage() {
    const packages = useQuery(api.packages.getPackages);
    const deletePackage = useMutation(api.packages.deletePackage);

    const handleDelete = async (id: Id<"packages">) => {
        if (confirm("¿Estás seguro de eliminar este paquete?")) {
            try {
                await deletePackage({ id });
                toast.success("Paquete eliminado");
            } catch (error) {
                toast.error("Error al eliminar el paquete");
            }
        }
    };

    const getUnitBadge = (unit: string) => {
        switch (unit) {
            case "digital": return <Badge className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20">Digital (U1)</Badge>;
            case "solutions": return <Badge className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">Solutions (U2)</Badge>;
            case "infra": return <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">Infra (U3)</Badge>;
            default: return null;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "service": return <Badge variant="outline">Servicio</Badge>;
            case "subscription": return <Badge variant="outline" className="border-blue-500/30 text-blue-400">Suscripción</Badge>;
            case "hardware": return <Badge variant="outline" className="border-orange-500/30 text-orange-400">Hardware</Badge>;
            default: return null;
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Catálogo de Servicios</h1>
                    <p className="text-zinc-500 mt-2">Gestiona los paquetes, servicios y productos de las 3 unidades.</p>
                </div>
                <PackageFormDialog />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                            <TableHead>Nombre del Paquete</TableHead>
                            <TableHead>Unidad</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Precio Base</TableHead>
                            <TableHead className="text-right">Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {packages === undefined ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">Cargando catálogo...</TableCell>
                            </TableRow>
                        ) : packages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">No hay paquetes registrados.</TableCell>
                            </TableRow>
                        ) : (
                            packages.map((pkg) => {
                                return (
                                    <TableRow key={pkg._id}>
                                        <TableCell className="font-medium">{pkg.name}</TableCell>
                                        <TableCell>{getUnitBadge(pkg.unit)}</TableCell>
                                        <TableCell>{getTypeBadge(pkg.type)}</TableCell>
                                        <TableCell className="text-right">S/ {pkg.basePrice.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            {pkg.active ? (
                                                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Activo</Badge>
                                            ) : (
                                                <Badge className="bg-zinc-100 text-zinc-500 hover:bg-zinc-200">Inactivo</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <PackageFormDialog
                                                    initialData={pkg}
                                                    trigger={
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50">
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                    }
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(pkg._id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
