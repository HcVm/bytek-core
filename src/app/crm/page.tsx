"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    Wallet,
    Briefcase,
    Compass,
    TrendingUp,
    Activity,
    Cpu,
    AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
    // Al ser un Dashboard principal, obtenemos las métricas aglomeradas
    const metrics = useQuery(api.metrics.getDashboardMetrics);

    if (!metrics) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="flex flex-col items-center gap-4 text-zinc-500">
                    <Activity className="w-8 h-8 animate-pulse text-indigo-500" />
                    <p>Agregando métricas y construyendo tablero...</p>
                </div>
            </div>
        );
    }

    // Datos procesados para gráficos
    const financeData = [
        { name: 'Cobrado', value: metrics.finance.paidValue },
        { name: 'Por Cobrar', value: metrics.finance.pendingValue },
    ];

    const hasFinancialData = metrics.finance.paidValue > 0 || metrics.finance.pendingValue > 0;

    return (
        <div className="p-8 h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-y-auto custom-scrollbar">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Control Maestro BYTEK</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">Vista panorámica y consolidada del rendimiento de todas las unidades de negocio.</p>
            </div>

            {/* Fila 1: KPIs Principales (Tarjetas de Impacto) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* CRM KPI */}
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventas Cerradas (Won)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            S/ {metrics.sales.wonValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            Distribuidas en {metrics.sales.wonCount} oportunidades.
                        </p>
                    </CardContent>
                </Card>

                {/* Finanzas KPI */}
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recaudación (Cobrado)</CardTitle>
                        <Wallet className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                            S/ {metrics.finance.paidValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            Dinero líquido en cuentas de empresa.
                        </p>
                    </CardContent>
                </Card>

                {/* Proyectos KPI */}
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delivery Activo</CardTitle>
                        <Briefcase className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics.operations.activeProjects} Proyectos
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            En proceso de planificación o ejecución.
                        </p>
                    </CardContent>
                </Card>

                {/* Infraestructura KPI */}
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Almacén (En Físico)</CardTitle>
                        <Cpu className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            S/ {metrics.inventory.value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            Capital inmovilizado en hardware.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Fila 2: Gráficos y Listas de Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* Gráfico 1: Peso de Unidades de Negocio */}
                <Card className="lg:col-span-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-base">Esfuerzo Comercial por Unidad</CardTitle>
                        <CardDescription>Oportunidades distribuidas (U1, U2, U3)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.sales.distribution} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" stroke="currentColor" className="text-zinc-500 dark:text-zinc-400" fontSize={10} />
                                <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '10px' }} stroke="currentColor" className="text-zinc-500 dark:text-zinc-400" />
                                <RechartsTooltip
                                    formatter={(value: any) => [`${value} Oportunidades`, 'Volumen']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Gráfico 2: Salud Financiera */}
                <Card className="lg:col-span-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-base">Salud Financiera General</CardTitle>
                        <CardDescription>Ratio Cobrado vs Pendiente</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px] flex items-center justify-center">
                        {hasFinancialData ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={financeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#10b981" /> {/* Cobrado - Verde */}
                                        <Cell fill="#f59e0b" /> {/* Pendiente - Ambar */}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value: any) => [`S/ ${Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, 'Monto']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-sm text-zinc-400 dark:text-zinc-500">Sin datos de facturación suficientes</div>
                        )}
                    </CardContent>
                </Card>

                {/* Panel de Alertas y Acciones Rápidas */}
                <Card className="lg:col-span-1 border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20">
                    <CardHeader>
                        <CardTitle className="text-base text-indigo-900 dark:text-indigo-300">Centro de Atención Urgente</CardTitle>
                        <CardDescription className="dark:text-indigo-400/70">Elementos que requieren supervisión</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900/50 rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Stock Crítico</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Modelos agotándose</p>
                                </div>
                            </div>
                            <div className="text-lg font-bold text-red-600 dark:text-red-400">{metrics.inventory.lowStockCount}</div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900/50 rounded-lg border border-amber-100 dark:border-amber-900/30 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400">
                                    <Compass className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Despachos Abiertos</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Técnicos movilizados</p>
                                </div>
                            </div>
                            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{metrics.operations.pendingInterventions}</div>
                        </div>

                        <div className="pt-4">
                            <Link href="/crm/oportunidades">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                    Ir al Panel de Oportunidades Central
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
