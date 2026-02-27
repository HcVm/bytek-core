"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Building2, Plus, Star, Server, HardDrive, Code, User, Info, DollarSign, Calendar, Target, Activity } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

export default function ProveedoresPage() {
    const vendors = useQuery(api.vendors.getVendors) || [];
    const cloudCosts = useQuery(api.vendors.getCloudCosts, { year: new Date().getFullYear() }) || [];
    const projects = useQuery(api.projects.getProjects) || [];

    // Vendor Creation State
    const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
    const [newVendor, setNewVendor] = useState({ name: "", category: "cloud" as any, contactName: "", email: "" });
    const addVendor = useMutation(api.vendors.addVendor);

    // Filter state
    const [activeCategory, setActiveCategory] = useState<"all" | "cloud" | "software" | "contractor" | "hardware">("all");

    // Cloud Cost Logging State
    const [isLogCostOpen, setIsLogCostOpen] = useState(false);
    const [newCost, setNewCost] = useState({ vendorId: "", projectId: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), amount: 0, serviceName: "" });
    const logCloudCost = useMutation(api.vendors.logCloudCost);

    const handleAddVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        await addVendor(newVendor);
        setIsAddVendorOpen(false);
        setNewVendor({ name: "", category: "cloud", contactName: "", email: "" });
    };

    const handleLogCost = async (e: React.FormEvent) => {
        e.preventDefault();
        await logCloudCost({
            vendorId: newCost.vendorId as Id<"vendors">,
            projectId: newCost.projectId ? newCost.projectId as Id<"projects"> : undefined,
            month: Number(newCost.month),
            year: Number(newCost.year),
            amount: Number(newCost.amount),
            serviceName: newCost.serviceName
        });
        setIsLogCostOpen(false);
        setNewCost({ vendorId: "", projectId: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), amount: 0, serviceName: "" });
    };

    const filteredVendors = activeCategory === "all" ? vendors : vendors.filter(v => v.category === activeCategory);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "cloud": return <Server className="w-5 h-5 text-indigo-400" />;
            case "software": return <Code className="w-5 h-5 text-blue-400" />;
            case "contractor": return <User className="w-5 h-5 text-emerald-400" />;
            case "hardware": return <HardDrive className="w-5 h-5 text-amber-400" />;
            default: return <Building2 className="w-5 h-5 text-slate-500" />;
        }
    };

    const totalCloudCosts = cloudCosts.reduce((sum, cost) => sum + cost.amount, 0);

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950">
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <Building2 className="w-8 h-8 text-emerald-500" />
                            Proveedores y Cloud
                        </h1>
                        <p className="text-slate-500 dark:text-zinc-400 mt-2">Gestión de vendors, contratistas y tracking de costos cloud (SaaS/IaaS).</p>
                    </div>
                </div>

                {/* Dashboard Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-lg">
                                <Server className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">Costos Cloud YTD</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">${totalCloudCosts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-lg">
                                <Building2 className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">Total Vendors Activos</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{vendors.filter(v => v.status === "active").length}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-lg">
                                <Target className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">Evaluaciones Pendientes</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">0</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Panel Izquierdo: Vendors Directory */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                            <div className="flex items-center gap-2 bg-white/50 dark:bg-zinc-900/50 p-1 rounded-lg border border-slate-200 dark:border-zinc-800">
                                {["all", "cloud", "software", "contractor", "hardware"].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat as any)}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${activeCategory === cat ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white" : "text-slate-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"}`}
                                    >
                                        {cat === "all" ? "Todos" : cat}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setIsAddVendorOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Nuevo Vendor</span>
                                <span className="sm:hidden">Nuevo</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredVendors.map((vendor) => (
                                <div key={vendor._id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 hover:border-zinc-700 dark:hover:border-zinc-500 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg group-hover:bg-zinc-700 dark:group-hover:bg-zinc-700 transition-colors">
                                                {getCategoryIcon(vendor.category)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{vendor.name}</h3>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 capitalize border border-zinc-700 dark:border-zinc-600">
                                                    {vendor.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${vendor.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    </div>
                                    <div className="space-y-2 mt-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400">
                                            <User className="w-4 h-4" />
                                            <span>{vendor.contactName || "Sin contacto principal"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400">
                                            <Info className="w-4 h-4" />
                                            <span>{vendor.email || "Sin email"}</span>
                                        </div>
                                    </div>
                                    <div className="mt-5 pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                                        <button className="text-xs font-medium text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors">
                                            <Star className="w-3 h-3" />
                                            Evaluar Vendor
                                        </button>
                                        <button className="text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                            Ver Detalles
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredVendors.length === 0 && (
                                <div className="col-span-full py-12 text-center bg-white/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 border-dashed rounded-xl">
                                    <Building2 className="w-12 h-12 text-zinc-700 dark:text-zinc-600 mx-auto mb-4" />
                                    <p className="text-zinc-500 dark:text-zinc-400">No hay proveedores en esta categoría</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Panel Derecho: Cloud Costs & Actions */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-indigo-400" />
                                    Costos Cloud Recientes
                                </h3>
                                <button
                                    onClick={() => setIsLogCostOpen(true)}
                                    className="p-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-zinc-700 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 rounded transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {cloudCosts.slice(0, 5).map((cost, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-500/10 rounded">
                                                <Server className="w-4 h-4 text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{cost.vendorName}</p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{cost.serviceName} • Mes {cost.month}</p>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-slate-900 dark:text-white">${cost.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ))}
                                {cloudCosts.length === 0 && (
                                    <p className="text-sm text-zinc-500 text-center py-4">No hay costos registrados este año</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Modals */}
                {isAddVendorOpen && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Nuevo Proveedor / Vendor</h2>
                            <form onSubmit={handleAddVendor} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Nombre de Empresa</label>
                                    <input
                                        type="text"
                                        required
                                        value={newVendor.name}
                                        onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                                        placeholder="Ej: Amazon Web Services"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Categoría</label>
                                    <select
                                        value={newVendor.category}
                                        onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value as any })}
                                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                                    >
                                        <option value="cloud">Infraestructura Cloud (AWS, Azure)</option>
                                        <option value="software">Software SaaS (Atlassian, Microsoft)</option>
                                        <option value="contractor">Contratista Externo (Freelancer)</option>
                                        <option value="hardware">Proveedor de Hardware (Dell, Cisco)</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-1">Nombre Contacto</label>
                                        <input
                                            type="text"
                                            value={newVendor.contactName}
                                            onChange={(e) => setNewVendor({ ...newVendor, contactName: e.target.value })}
                                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={newVendor.email}
                                            onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                                            placeholder="john@vendor.com"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddVendorOpen(false)}
                                        className="flex-1 px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Guardar Vendor
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isLogCostOpen && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Registrar Costo Cloud</h2>
                            <form onSubmit={handleLogCost} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Vendor (Proveedor Cloud)</label>
                                    <select
                                        required
                                        value={newCost.vendorId}
                                        onChange={(e) => setNewCost({ ...newCost, vendorId: e.target.value })}
                                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                                    >
                                        <option value="">Seleccione un proveedor...</option>
                                        {vendors.filter(v => v.category === "cloud" || v.category === "software").map((vendor) => (
                                            <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Nombre del Servicio/Recurso</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCost.serviceName}
                                        onChange={(e) => setNewCost({ ...newCost, serviceName: e.target.value })}
                                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                                        placeholder="Ej: AWS EC2, S3 Storage"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-1">Mes</label>
                                        <select
                                            value={newCost.month}
                                            onChange={(e) => setNewCost({ ...newCost, month: parseInt(e.target.value) })}
                                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                <option key={m} value={m}>Mes {m}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-1">Año</label>
                                        <input
                                            type="number"
                                            value={newCost.year}
                                            onChange={(e) => setNewCost({ ...newCost, year: parseInt(e.target.value) })}
                                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Monto (USD)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-4 w-4 text-zinc-500" />
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={newCost.amount || ""}
                                            onChange={(e) => setNewCost({ ...newCost, amount: parseFloat(e.target.value) })}
                                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Proyecto (Opcional - Atribuir costo)</label>
                                    <select
                                        value={newCost.projectId}
                                        onChange={(e) => setNewCost({ ...newCost, projectId: e.target.value })}
                                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                                    >
                                        <option value="">Sin proyecto (Costo Interno)</option>
                                        {projects.filter(p => p.status !== "completed").map((p) => (
                                            <option key={p._id} value={p._id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsLogCostOpen(false)}
                                        className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Registrar Costo
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
