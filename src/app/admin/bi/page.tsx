"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Server, Briefcase } from "lucide-react";

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdvancedBIPage() {
    const profitability = useQuery(api.analytics.getDetailedProjectProfitability) || [];
    const hrAnalytics = useQuery(api.analytics.getHrAnalytics);
    const cloudAnalysis = useQuery(api.analytics.getCloudCostAnalysis, {}) || { historical: [], predictedNextMonth: 0 };

    // Prepare data for Recharts
    const projectData = profitability.map((p: any) => ({
        name: p.title.substring(0, 15) + (p.title.length > 15 ? '...' : ''),
        Ingresos: p.totalRevenue,
        Gastos: p.totalExpenses,
        Margen: p.grossMargin
    })).slice(0, 10); // Top 10 for chart readability

    const cloudData = [
        ...cloudAnalysis.historical.map((h: any) => ({ name: h.period, CostoReal: h.amount, Prediccion: null })),
        {
            name: "Siguiente Mes",
            CostoReal: null,
            Prediccion: cloudAnalysis.predictedNextMonth
        }
    ];

    const hrDeptData = hrAnalytics?.departmentDistribution?.map((d: any) => ({
        name: d.name,
        value: d.count
    })) || [];

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50">
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <Activity className="w-8 h-8 text-emerald-500" />
                            Business Intelligence (BI) Avanzado
                        </h1>
                        <p className="text-slate-500 mt-2">Métricas, márgenes, analítica predictiva y reporting gerencial.</p>
                    </div>
                </div>

                {/* Top KPIs Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/50 border border-slate-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-lg">
                                <DollarSign className="w-5 h-5 text-emerald-400" />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                                <ArrowUpRight className="w-3 h-3" /> 12%
                            </span>
                        </div>
                        <h3 className="text-slate-500 font-medium text-sm">Margen Bruto Global</h3>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                            {profitability.length > 0
                                ? (profitability.reduce((sum: number, p: any) => sum + p.grossMargin, 0) / profitability.reduce((sum: number, p: any) => sum + p.totalRevenue, 0) * 100).toFixed(1) + "%"
                                : "0%"}
                        </p>
                    </div>

                    <div className="bg-white/50 border border-slate-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-red-500/10 rounded-lg">
                                <Users className="w-5 h-5 text-red-400" />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
                                <ArrowDownRight className="w-3 h-3" /> 2.1%
                            </span>
                        </div>
                        <h3 className="text-slate-500 font-medium text-sm">Rotación HR (Churn)</h3>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                            {hrAnalytics ? hrAnalytics.turnoverRate.toFixed(1) : 0}%
                        </p>
                    </div>

                    <div className="bg-white/50 border border-slate-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-500/10 rounded-lg">
                                <Server className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
                                Proyectado
                            </span>
                        </div>
                        <h3 className="text-slate-500 font-medium text-sm">Costo Cloud Next Month</h3>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                            ${cloudAnalysis.predictedNextMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                    </div>

                    <div className="bg-white/50 border border-slate-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-amber-500/10 rounded-lg">
                                <Briefcase className="w-5 h-5 text-amber-400" />
                            </div>
                        </div>
                        <h3 className="text-slate-500 font-medium text-sm">Tiempo Medio Contratación</h3>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                            {hrAnalytics ? hrAnalytics.avgTimeToHireDays : 0} Días
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Chart 1: Project Profitability */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 col-span-1 lg:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Rentabilidad por Proyecto (Ingresos vs Gastos)</h2>
                        </div>
                        <div className="h-80 w-full">
                            {projectData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={projectData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                                        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                                            itemStyle={{ color: '#e4e4e7' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 border border-dashed border-slate-200 rounded-lg bg-white/50">
                                    <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                                    <p>No hay suficientes datos financieros para graficar.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chart 2: Cloud Cost Trend & Prediction */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Análisis y Predicción Costos Cloud</h2>
                        </div>
                        <div className="h-64 w-full">
                            {cloudData.filter(d => d.CostoReal !== null || d.Prediccion !== null).length > 1 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={cloudData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                                        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="CostoReal" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="Prediccion" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 border border-dashed border-slate-200 rounded-lg bg-white/50">
                                    <Server className="w-8 h-8 mb-2 opacity-50" />
                                    <p>Registre al menos 2 meses de costos cloud para predecir.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chart 3: HR Department Distribution */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Distribución de Empleados</h2>
                        </div>
                        <div className="h-64 w-full">
                            {hrDeptData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={hrDeptData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {hrDeptData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#e4e4e7' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 border border-dashed border-slate-200 rounded-lg bg-white/50">
                                    <Users className="w-8 h-8 mb-2 opacity-50" />
                                    <p>No hay empleados asignados a departamentos.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
