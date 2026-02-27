"use client";

import {
  Activity, ShieldCheck, Cctv, Server, Rocket, BarChart3, Archive,
  Users, Briefcase, FileText, CheckCircle2, Clock,
  TrendingUp, AlertTriangle, Building2, CreditCard
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {

  const metrics = useQuery(api.dashboard.getOverviewMetrics);

  const stats = {
    activeProjects: metrics?.activeProjects ?? "-",
    openTickets: metrics?.openTickets ?? "-",
    pendingInvoices: metrics?.pendingInvoicesCount ?? "-",
    pendingAmount: metrics?.pendingInvoicesAmount ?? 0,
    systemUptime: "99.99%"
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500/30 overflow-y-auto">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Top Navigation Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
            BYTEK CORE
          </span>
          <span className="px-2 py-0.5 ml-2 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            System Active
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" /> All systems operational
          </div>
          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800"></div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-white">
              AD
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Dashboard Space */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">

        {/* Header Welcome Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Central de Operaciones</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Resumen general del estado del sistema y accesos rápidos a módulos.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/client-portal" className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md text-sm font-medium transition-colors flex items-center gap-2 text-zinc-700 dark:text-zinc-100 shadow-sm">
              <Cctv className="w-4 h-4 text-zinc-500 dark:text-zinc-400" /> Portal Clientes
            </Link>
            <Link href="/admin" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20">
              Entrar a Admin Central
            </Link>
          </div>
        </div>

        {/* KPI Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <CardKPI icon={<Briefcase />} title="Proyectos Activos" value={stats.activeProjects.toString()} trend="En ejecución" />
          <CardKPI icon={<AlertTriangle className="text-amber-500 dark:text-amber-400" />} title="Tickets Abiertos" value={stats.openTickets.toString()} trend="Requieren atención" />
          <CardKPI icon={<CreditCard />} title="Facturas Pendientes" value={stats.pendingInvoices.toString()} trend={`$${stats.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PEN`} />
          <CardKPI icon={<Server className="text-emerald-500 dark:text-emerald-400" />} title="Uptime Servidores" value={stats.systemUptime} trend="Últimos 30 días" />
        </div>

        {/* Main Grid Layout (Bento Box Style) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Left Column: Business Units */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-zinc-500 dark:text-zinc-400" /> Unidades de Negocio
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <BusinessUnitCard
                icon={<Rocket />}
                title="Mando Comercial"
                color="indigo"
                link="/crm"
                description="Pipeline de ventas, gestión de clientes y oportunidades."
              />
              <BusinessUnitCard
                icon={<BarChart3 />}
                title="Dev Center"
                color="purple"
                link="/dev"
                description="Sprints, tareas, control de ingeniería y factoría de software."
              />
              <BusinessUnitCard
                icon={<Server />}
                title="Unidad Infra"
                color="emerald"
                link="/admin/inventario"
                description="Despliegues Field Service, logística de almacén y bodegas."
              />
            </div>

            {/* Financial & HR Access */}
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mt-4">
              <Archive className="w-5 h-5 text-zinc-500 dark:text-zinc-400" /> Core Administrativo
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ModuleLink title="Contabilidad" desc="Libro Diario, PCGE" icon={<FileText />} href="/contabilidad" />
              <ModuleLink title="Facturación" desc="Cobros y Pagos" icon={<CreditCard />} href="/contabilidad/cuentas-cobrar" />
              <ModuleLink title="Talento HR" desc="Nóminas y Reclutamiento" icon={<Users />} href="/admin/hr" />
              <ModuleLink title="Business Intel" desc="Reportes Gerenciales" icon={<TrendingUp />} href="/admin/bi" />
            </div>
          </div>

          {/* Right Column: Quick Status & Activity */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800/80 shadow-sm rounded-xl p-5 h-full flex flex-col transition-all hover:bg-white dark:hover:bg-zinc-900/80">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center justify-between">
                Actividad Reciente
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline uppercase tracking-tight">Ver bitácora</span>
              </h3>

              <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
                {metrics === undefined ? (
                  <div className="text-zinc-500 text-sm animate-pulse">Cargando actividad...</div>
                ) : metrics.recentActivity.length > 0 ? (
                  metrics.recentActivity.map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      title={activity.title}
                      desc={activity.description}
                      time={formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: es })}
                      colorClass={activity.color}
                    />
                  ))
                ) : (
                  <div className="text-zinc-500 text-sm">No hay actividad reciente.</div>
                )}
              </div>

              <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Link href="/admin/tickets-soporte" className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-xs font-medium text-center text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Centro de Soporte
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// Subcomponents

function CardKPI({ icon, title, value, trend }: { icon: React.ReactNode, title: string, value: string, trend: string }) {
  return (
    <div className="bg-white/50 dark:bg-zinc-900/40 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800/80 shadow-sm rounded-xl p-5 hover:bg-white dark:hover:bg-zinc-800/60 transition-all hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/50">
      <div className="flex items-center justify-between mb-3">
        <div className="text-zinc-500 dark:text-zinc-400">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">{value}</div>
      <h3 className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{title}</h3>
      <p className="text-xs text-zinc-500 mt-2">{trend}</p>
    </div>
  );
}

function BusinessUnitCard({ icon, title, description, color, link }: { icon: React.ReactNode, title: string, description: string, color: string, link: string }) {

  const colorClasses = {
    indigo: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:border-indigo-300 dark:group-hover:border-indigo-500/50",
    purple: "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:border-purple-300 dark:group-hover:border-purple-500/50",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:border-emerald-300 dark:group-hover:border-emerald-500/50",
  };

  return (
    <Link href={link} className="group block h-full">
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md dark:hover:bg-zinc-800/80 rounded-xl p-5 transition-all h-full flex flex-col items-start cursor-pointer hover:-translate-y-1 dark:hover:shadow-xl dark:hover:shadow-black/50">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border mb-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <h3 className="text-zinc-900 dark:text-zinc-100 font-bold mb-2 group-hover:text-indigo-600 dark:group-hover:text-white">{title}</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 flex-1">{description}</p>
        <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mt-auto group-hover:text-indigo-600 dark:group-hover:text-zinc-300 flex items-center gap-1">
          Abrir Módulo &rarr;
        </div>
      </div>
    </Link>
  );
}

function ModuleLink({ title, desc, icon, href }: { title: string, desc: string, icon: React.ReactNode, href: string }) {
  return (
    <Link href={href}>
      <div className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900/40 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer group">
        <div className="text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-zinc-300 mt-0.5">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-white">{title}</h4>
          <p className="text-xs text-zinc-500">{desc}</p>
        </div>
      </div>
    </Link>
  );
}

function ActivityItem({ title, desc, time, colorClass }: { title: string, desc: string, time: string, colorClass: string }) {

  return (
    <div className="flex gap-3 items-start relative group pb-2">
      {/* Timeline Line */}
      <div className="absolute left-2.5 top-6 bottom-[-16px] w-px bg-zinc-200 dark:bg-zinc-800/50 group-last:hidden"></div>

      <div className="relative mt-1">
        <div className={`w-5 h-5 rounded-full border-[3px] border-white dark:border-zinc-950 flex-shrink-0 z-10 ${colorClass}`}></div>
      </div>
      <div className="flex-1 pb-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">{title}</h4>
          <span className="text-[10px] text-zinc-500 whitespace-nowrap ml-2 capitalize">{time}</span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

