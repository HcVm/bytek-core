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
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, User, CalendarClock, Compass, Route } from "lucide-react";
import { DispatchFormDialog } from "./DispatchFormDialog";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";

export default function FieldServicePage() {
    // Para simplificar la demo, traemos todo como Admin. 
    // Si fuera el técnico logueado, usaríamos role: "technician".
    const interventions = useQuery(api.fieldService.getInterventions, {}) || [];

    const pending = interventions.filter((i: any) => i.status === 'scheduled').length;
    const working = interventions.filter((i: any) => i.status === 'en_route' || i.status === 'working').length;
    const completed = interventions.filter((i: any) => i.status === 'completed').length;

    const translateState = (status: string) => {
        switch (status) {
            case 'scheduled': return <Badge variant="secondary" className="bg-zinc-100 text-zinc-700">Programado</Badge>;
            case 'en_route': return <Badge variant="secondary" className="bg-blue-100 text-blue-700">En Ruta (Viaje)</Badge>;
            case 'working': return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Trabajando</Badge>;
            case 'completed': return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Completado</Badge>;
            default: return <Badge variant="secondary">Desconocido</Badge>;
        }
    };

    const translateType = (type: string) => {
        if (type === 'installation') return "Instalación";
        if (type === 'support') return "Soporte";
        if (type === 'maintenance') return "Mantenimiento";
        return type;
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Mesa de Despacho Técnico</h1>
                    <p className="text-zinc-500 mt-2">Control maestro de asignación y tracking satelital del equipo en calle.</p>
                </div>
                <div className="flex gap-2">
                    <DispatchFormDialog />
                    <Link href="/technician" target="_blank">
                        <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                            <Compass className="w-4 h-4 mr-2" />
                            Simular Vista Técnico
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Métricas Top */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                            <CalendarClock className="w-4 h-4" /> Despachos Pendientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-zinc-900">{pending}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
                            <Route className="w-4 h-4" /> Ejecutándose Hoy
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-zinc-900">{working}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Actas Cerradas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-zinc-900">{completed}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Listado de Intervenciones */}
            <Card className="flex-1 flex flex-col">
                <CardHeader>
                    <CardTitle>Tablero Global de Intervenciones</CardTitle>
                    <CardDescription>
                        Supervisa en tiempo real el progreso de las instalaciones del día.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                    {interventions.length > 0 ? (
                        <div className="border rounded-md">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 text-zinc-500 font-medium border-b">
                                    <tr>
                                        <th className="px-4 py-3">Referencia Operativa</th>
                                        <th className="px-4 py-3">Cliente / Sede</th>
                                        <th className="px-4 py-3">Técnico Asignado</th>
                                        <th className="px-4 py-3 text-center">Estado</th>
                                        <th className="px-4 py-3 text-right">Informes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {interventions.map((intervention: any) => (
                                        <tr key={intervention._id} className="border-b last:border-0 hover:bg-zinc-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="font-bold text-zinc-900 line-clamp-1">{intervention.projectTitle}</div>
                                                <div className="text-xs text-indigo-600 font-medium flex items-center mt-1">
                                                    {translateType(intervention.type)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-zinc-900">{intervention.clientName}</div>
                                                <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {intervention.siteLocation}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-zinc-200 rounded-full">
                                                        <User className="w-3 h-3 text-zinc-600" />
                                                    </div>
                                                    <span className="font-medium text-zinc-700">{intervention.techName}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {translateState(intervention.status)}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button variant="ghost" size="sm" className="text-zinc-500" disabled={intervention.status !== 'completed'}>
                                                    Formato Cierre
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-zinc-50">
                            <Route className="w-12 h-12 text-zinc-300 mb-4" />
                            <h3 className="text-lg font-medium text-zinc-900">No hay despachos registrados</h3>
                            <p className="text-zinc-500 text-sm mt-1 max-w-sm text-center">
                                Genera una Orden de Trabajo asignando a un técnico para que cumpla los requisitos de hardware de un proyecto vendido.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
