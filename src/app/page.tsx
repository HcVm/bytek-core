"use client";

import { Activity, ShieldCheck, Cctv, Server, Rocket, ChevronRight, BarChart3, Archive } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

export default function Home() {

  // Variantes de animación general (Fade up)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15 // Retraso en cascada para cada tarjeta
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30 overflow-hidden relative">

      {/* Fondo Ambient Particle Simulado con CSS Grid / Radial */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Premium */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-white/5">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            BYTEK CORE
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          {/* Botón principal unificado -> Lleva al CRM Dashboard Gerencial */}
          <Link href="/admin" className="group flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all">
            <span>Admin Central</span>
            <Server className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/crm" className="group flex items-center gap-2 bg-white hover:bg-zinc-100 text-zinc-950 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <span>CRM Comercial</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </header>

      {/* Main Content con Animaciones */}
      <main className="max-w-7xl mx-auto px-6 py-20 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center md:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Sistema Versión Alpha Disponible
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-white">
            Gestión <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Total B2B</span>
          </h1>
          <p className="text-zinc-400 text-xl max-w-2xl">
            Central de operaciones corporativas 360° interconectando facturación, ventas e infraestructura de campo en una sola malla neuronal.
          </p>
        </motion.div>

        {/* Unidades Grid (Animado con Stagger) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* U1 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="group relative bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8 hover:border-indigo-500/30 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Rocket className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-indigo-200 transition-colors">BYTEK Digital</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                Gestión volumétrica de clientes comerciales, despliegue de landing pages y automatización de cobros recurrentes de mantenimiento.
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-400">
                <span className="w-8 h-[1px] bg-indigo-400/50"></span>
                <span>Pipeline Comercial</span>
              </div>
            </div>
          </motion.div>

          {/* U2 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="group relative bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8 hover:border-purple-500/30 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-purple-200 transition-colors">BYTEK Solutions</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                Factoría de Software a medida, facturación progresiva por hitos operativos y auditoría estricta de alcances de producto.
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-400">
                <span className="w-8 h-[1px] bg-purple-400/50"></span>
                <span>Gestión de Hitos</span>
              </div>
            </div>
          </motion.div>

          {/* U3 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="group relative bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8 hover:border-emerald-500/30 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Server className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-emerald-200 transition-colors">BYTEK Infra</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                Despliegue operativo Field Service, control dinámico de inventario de equipos físicos, trazabilidad térmica y logística.
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <span className="w-8 h-[1px] bg-emerald-400/50"></span>
                <span>Bodega y Técnicos</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Accesos Transversales y Módulos Externos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-20 pt-10 border-t border-white/5"
        >
          <h3 className="text-xl font-semibold mb-8 text-white/90">Ecosistema Módulos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Link href="/crm" className="group bg-zinc-900/30 border border-white/5 rounded-xl p-5 flex flex-col items-start gap-4 hover:bg-zinc-800/50 hover:border-white/10 transition-all cursor-pointer">
              <ShieldCheck className="w-6 h-6 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
              <span className="font-medium text-sm text-zinc-300">Dashboard de Ventas</span>
            </Link>
            <Link href="/admin/inventario" className="group bg-zinc-900/30 border border-white/5 rounded-xl p-5 flex flex-col items-start gap-4 hover:bg-zinc-800/50 hover:border-white/10 transition-all cursor-pointer">
              <Archive className="w-6 h-6 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
              <span className="font-medium text-sm text-zinc-300">Logística & Almacén</span>
            </Link>
            <Link href="/client-portal" className="group bg-zinc-900/30 border border-white/5 rounded-xl p-5 flex flex-col items-start gap-4 hover:bg-zinc-800/50 hover:border-white/10 transition-all cursor-pointer">
              <Cctv className="w-6 h-6 text-zinc-500 group-hover:text-amber-400 transition-colors" />
              <div className="flex flex-col">
                <span className="font-medium text-sm text-zinc-300">Portal B2B Cliente</span>
                <span className="text-[10px] uppercase text-amber-500 font-bold mt-1">Nuevo Modulo</span>
              </div>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
