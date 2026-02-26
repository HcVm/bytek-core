"use client";

import { BadgeDollarSign } from "lucide-react";

export default function PresupuestosPage() {
    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-md">
                            <BadgeDollarSign className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Presupuestos</h1>
                    </div>
                    <p className="text-slate-500 font-medium pl-14">Control presupuestal por centro de costos. Ejecución vs. planificado.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-7xl mx-auto p-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BadgeDollarSign className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Módulo de Presupuestos</h2>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Este módulo permite definir presupuestos por período, departamento y centro de costos, y comparar la ejecución real contra lo planificado.
                        </p>
                        <p className="text-sm text-slate-400 mt-4">Crea centros de costos y períodos contables primero para habilitar la gestión presupuestal.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
