"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PackageSearch, AlertTriangle, Layers, TrendingUp } from "lucide-react";
import { HardwareFormDialog } from "./HardwareFormDialog";
import { SerialEntryDialog } from "./SerialEntryDialog";

export default function InventarioPage() {
    const hardware = useQuery(api.inventory.getHardwareItems) || [];

    const totalStock = hardware.reduce((acc: number, item: any) => acc + (item.currentStock || 0), 0);
    const lowStockItems = hardware.filter((h: any) => h.isLowStock).length;
    const inventoryValue = hardware.reduce((acc: number, item: any) => acc + ((item.currentStock || 0) * item.costPrice), 0);

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Almacén Central</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">Control de existencia física de hardware y alerta de reposición.</p>
                </div>
                <HardwareFormDialog />
            </div>

            {/* Métricas Top */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                            <Layers className="w-4 h-4" /> Equipos en Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-zinc-900 dark:text-white">{totalStock}</div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Unidades físicas listas para despliegue</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-500 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Alertas Mínimas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-zinc-900 dark:text-white">{lowStockItems}</div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Modelos que requieren compra</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-500 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Valorizado (Costo)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-zinc-900 dark:text-white">S/ {inventoryValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Capital inmovilizado actual</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabla Principal */}
            <Card className="flex-1 flex flex-col bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle className="dark:text-white">Catálogo de Hardware Físico</CardTitle>
                    <CardDescription className="dark:text-zinc-400">
                        Visualiza los modelos en uso. Cada ingreso debe venir con un escaneo de su Número de Serie Único.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                    {hardware.length > 0 ? (
                        <div className="border dark:border-zinc-800 rounded-md">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 font-medium border-b dark:border-zinc-800">
                                    <tr>
                                        <th className="px-4 py-3">SKU</th>
                                        <th className="px-4 py-3">Descripción / Marca</th>
                                        <th className="px-4 py-3 text-right">Costo (S/)</th>
                                        <th className="px-4 py-3 text-center">Stock Físico</th>
                                        <th className="px-4 py-3 text-center">Estado</th>
                                        <th className="px-4 py-3 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hardware.map((item: any) => (
                                        <tr key={item._id} className="border-b last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 dark:border-zinc-800 transition-colors">
                                            <td className="px-4 py-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                                                {item.sku}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-zinc-900 dark:text-white">{item.name}</div>
                                                <div className="text-xs text-zinc-500 dark:text-zinc-400">{item.brand}</div>
                                            </td>
                                            <td className="px-4 py-4 text-right text-zinc-600 dark:text-zinc-400">
                                                {item.costPrice.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                                                    {item.currentStock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {item.isLowStock ? (
                                                    <Badge variant="destructive" className="bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40">
                                                        Bajo Stock
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/40">
                                                        Óptimo
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <SerialEntryDialog hardwareId={item._id} equipmentName={item.name} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                            <PackageSearch className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Sin hardware en el sistema</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 max-w-sm text-center">
                                Registra el primer modelo físico (cámaras, servidores, switches) agregando un Modelo al catálogo de Almacén.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
