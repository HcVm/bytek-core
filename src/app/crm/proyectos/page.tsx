"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderKanban, CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export default function ProyectosPage() {
    const projects = useQuery(api.projects.getProjects) || [];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'planning': return <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">Planificación</Badge>;
            case 'in_progress': return <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">En Progreso</Badge>;
            case 'review': return <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">En Revisión</Badge>;
            case 'completed': return <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Completado</Badge>;
            default: return <Badge variant="secondary">Desconocido</Badge>;
        }
    };

    const calculateProgress = (milestones: any[]) => {
        if (!milestones || milestones.length === 0) return 0;
        const total = milestones.length;
        const completed = milestones.filter(m => m.completedAt).length;
        return (completed / total) * 100;
    };

    return (
        <div className="p-8 h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Proyectos y Operaciones</h1>
                    <p className="text-zinc-500 mt-2">Controla el cumplimiento y entrega de los servicios vendidos.</p>
                </div>
                <Link href="/crm/oportunidades" passHref>
                    <Button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">
                        <FolderKanban className="w-4 h-4 mr-2" />
                        Ir a Oportunidades
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Activos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">{projects.filter(p => p.status !== 'completed').length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> En Progreso
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">{projects.filter(p => p.status === 'in_progress').length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> En Revisión
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">{projects.filter(p => p.status === 'review').length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Completados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">{projects.filter(p => p.status === 'completed').length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                {projects.map((project) => {
                    const progress = calculateProgress(project.milestones);
                    return (
                        <Card key={project._id} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors flex flex-col shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                        <FolderKanban className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                    </div>
                                    {getStatusBadge(project.status as string)}
                                </div>
                                <CardTitle className="text-lg line-clamp-1 text-zinc-900 dark:text-white" title={project.title}>{project.title}</CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400 line-clamp-1">{project.clientName}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-medium mb-1.5">
                                        <span className="text-zinc-500">Progreso de Hitos</span>
                                        <span className="text-zinc-900 dark:text-zinc-100">{Math.round(progress)}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2 bg-zinc-100 dark:bg-zinc-800" />
                                </div>
                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <Link href={`/crm/proyectos/${project._id}`} passHref>
                                        <Button variant="ghost" className="w-full justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400">
                                            Ver Detalles
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {projects.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/50">
                        <FolderKanban className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No hay proyectos activos</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 mb-4 text-center max-w-sm">
                            Los proyectos se crean a partir de oportunidades ganadas o manualmente para iniciar el delivery.
                        </p>
                        <Link href="/crm/oportunidades" passHref>
                            <Button variant="outline" className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800">Ir a Oportunidades</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
