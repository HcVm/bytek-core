"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { HardDrive, Monitor, Key, Plus, User, AlertCircle, CheckCircle2, Shield, Settings, Users } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

export default function ActivosPage() {
    const assets = useQuery(api.assets.getHardwareAssets) || [];
    const licenses = useQuery(api.assets.getSoftwareLicenses) || [];
    const users = useQuery(api.users.getAllUsers) || [];

    const [activeTab, setActiveTab] = useState<"hardware" | "software">("hardware");

    // Hardware Modal State
    const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
    const [newAsset, setNewAsset] = useState({
        name: "",
        type: "laptop" as any,
        serialNumber: "",
        purchaseDate: "",
        warrantyExpiry: "",
        cost: 0,
        status: "available" as any,
        accountingAccountId: "" as string,
        depreciationAccountId: "" as string
    });

    // Software Modal State
    const [isAddLicenseOpen, setIsAddLicenseOpen] = useState(false);
    const [newLicense, setNewLicense] = useState({ name: "", provider: "", licenseKey: "", totalSeats: 1, costPerSeat: 0, expiresAt: "" });

    // Assignment Modal State
    const [isAssignAssetOpen, setIsAssignAssetOpen] = useState<{ isOpen: boolean, assetId: Id<"hardwareAssets"> | null }>({ isOpen: false, assetId: null });
    const [selectedUserForAsset, setSelectedUserForAsset] = useState<string>("");

    const addHardware = useMutation(api.assets.addHardwareAsset);
    const addLicense = useMutation(api.assets.addSoftwareLicense);
    const updateAssetStatus = useMutation(api.assets.updateHardwareStatus);
    const assignLicense = useMutation(api.assets.assignLicense);
    const unassignLicense = useMutation(api.assets.unassignLicense);

    const movementAccounts = useQuery(api.accounting.getMovementAccounts) || [];
    const assetAccounts = movementAccounts.filter(acc => acc.code.startsWith("33") || acc.type === "activo");
    const depreciationAccounts = movementAccounts.filter(acc => acc.code.startsWith("39"));

    const handleCreateHardware = async (e: React.FormEvent) => {
        e.preventDefault();
        await addHardware({
            model: newAsset.name,
            type: newAsset.type,
            serialNumber: newAsset.serialNumber,
            purchaseDate: new Date(newAsset.purchaseDate).getTime(),
            value: Number(newAsset.cost),
            accountingAccountId: newAsset.accountingAccountId as Id<"accountingAccounts"> || undefined,
            depreciationAccountId: newAsset.depreciationAccountId as Id<"accountingAccounts"> || undefined
        });
        setIsAddAssetOpen(false);
        setNewAsset({
            name: "",
            type: "laptop",
            serialNumber: "",
            purchaseDate: "",
            warrantyExpiry: "",
            cost: 0,
            status: "available",
            accountingAccountId: "",
            depreciationAccountId: ""
        });
    };

    const handleCreateLicense = async (e: React.FormEvent) => {
        e.preventDefault();
        await addLicense({
            softwareName: newLicense.name,
            provider: newLicense.provider,
            licenseType: "user",
            totalLicenses: Number(newLicense.totalSeats),
            costPerUser: Number(newLicense.costPerSeat),
            expirationDate: new Date(newLicense.expiresAt).getTime(),
        });
        setIsAddLicenseOpen(false);
        setNewLicense({ name: "", provider: "", licenseKey: "", totalSeats: 1, costPerSeat: 0, expiresAt: "" });
    };

    const handleAssignEquipment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isAssignAssetOpen.assetId && selectedUserForAsset) {
            await updateAssetStatus({ assetId: isAssignAssetOpen.assetId, status: "assigned", assignedTo: selectedUserForAsset as Id<"users"> });
            setIsAssignAssetOpen({ isOpen: false, assetId: null });
            setSelectedUserForAsset("");
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950">
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <Monitor className="w-8 h-8 text-emerald-500" />
                            Activos TI y Licencias
                        </h1>
                        <p className="text-slate-500 dark:text-zinc-400 mt-2">Gestión de inventario de hardware y asignación de licencias de software por usuario.</p>
                    </div>
                </div>

                {/* Dashboard Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 relative overflow-hidden">
                        <Monitor className="absolute -bottom-4 -right-4 w-24 h-24 text-indigo-500/10" />
                        <h3 className="text-slate-500 dark:text-zinc-400 font-medium text-sm mb-1 relative z-10">Equipos Hardware</h3>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white relative z-10">{assets.length}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 relative z-10">
                            {assets.filter(a => a.status === 'assigned').length} Asignados | {assets.filter(a => a.status === 'available').length} Disponibles
                        </p>
                    </div>
                    <div className="bg-white/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 relative overflow-hidden">
                        <Key className="absolute -bottom-4 -right-4 w-24 h-24 text-emerald-500/10" />
                        <h3 className="text-slate-500 dark:text-zinc-400 font-medium text-sm mb-1 relative z-10">Licencias Software</h3>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white relative z-10">{licenses.length}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 relative z-10">Gestionadas centralmente</p>
                    </div>
                    <div className="bg-white/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 relative overflow-hidden">
                        <AlertCircle className="absolute -bottom-4 -right-4 w-24 h-24 text-amber-500/10" />
                        <h3 className="text-slate-500 dark:text-zinc-400 font-medium text-sm mb-1 relative z-10">Mantenimiento</h3>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white relative z-10">{assets.filter(a => a.status === 'maintenance' || a.status === 'retired').length}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 relative z-10">Equipos rotos o retirados</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-200 dark:border-zinc-800 space-x-8">
                    <button
                        onClick={() => setActiveTab("hardware")}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === "hardware" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300"}`}
                    >
                        <HardDrive className="w-4 h-4" />
                        Inventario Hardware
                    </button>
                    <button
                        onClick={() => setActiveTab("software")}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === "software" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300"}`}
                    >
                        <Key className="w-4 h-4" />
                        Licencias de Software
                    </button>
                </div>

                {/* Hardware Tab */}
                {activeTab === "hardware" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Equipos Registrados</h2>
                            <button
                                onClick={() => setIsAddAssetOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Registrar Equipo
                            </button>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-white/50 dark:bg-zinc-950/50 border-b border-slate-200 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Detalle del Equipo</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Cuentas (Act/Dep)</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Número Serie</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Asignación</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {assets.map((asset) => (
                                        <tr key={asset._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded">
                                                        {asset.type === 'laptop' ? <Monitor className="w-4 h-4 text-indigo-400" /> : <HardDrive className="w-4 h-4 text-slate-500 dark:text-zinc-400" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{asset.model}</p>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{asset.type}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/10 px-1 rounded border border-amber-100 dark:border-amber-900/20 w-fit">
                                                        Act: {asset.accountingAccountCode || "---"}
                                                    </span>
                                                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/50 px-1 rounded border border-slate-100 dark:border-zinc-800 w-fit">
                                                        Dep: {asset.depreciationAccountCode || "---"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-zinc-400">{asset.serialNumber}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${asset.status === 'available' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    asset.status === 'assigned' ? 'bg-indigo-500/10 text-indigo-400' :
                                                        asset.status === 'maintenance' ? 'bg-amber-500/10 text-amber-500' :
                                                            'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {asset.status === 'available' ? 'Disponible' :
                                                        asset.status === 'assigned' ? 'En Uso' :
                                                            asset.status === 'maintenance' ? 'Mantenimiento' : 'Retirado'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {asset.status === 'assigned' ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs text-slate-500 dark:text-zinc-500">
                                                            <User className="w-3 h-3" />
                                                        </div>
                                                        <span className="text-sm text-slate-600 dark:text-zinc-300">{asset.assigneeName || "Desconocido"}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-zinc-500 dark:text-zinc-500 italic">Sin Asignar</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-3">
                                                    {asset.status === 'available' && (
                                                        <button
                                                            onClick={() => setIsAssignAssetOpen({ isOpen: true, assetId: asset._id })}
                                                            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                                                        >
                                                            Asignar
                                                        </button>
                                                    )}
                                                    {asset.status === 'assigned' && (
                                                        <button
                                                            onClick={() => updateAssetStatus({ assetId: asset._id, status: 'available' })}
                                                            className="text-amber-600 hover:text-amber-500 text-sm font-medium"
                                                        >
                                                            Desasignar
                                                        </button>
                                                    )}
                                                    {asset.status === 'maintenance' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateAssetStatus({ assetId: asset._id, status: 'available' })}
                                                                className="text-emerald-600 hover:text-emerald-500 text-sm font-medium"
                                                            >
                                                                Disponible
                                                            </button>
                                                            <button
                                                                onClick={() => updateAssetStatus({ assetId: asset._id, status: 'retired' })}
                                                                className="text-red-600 hover:text-red-500 text-sm font-medium"
                                                            >
                                                                Retirar
                                                            </button>
                                                        </>
                                                    )}
                                                    {asset.status !== 'retired' && asset.status !== 'maintenance' && (
                                                        <button
                                                            onClick={() => updateAssetStatus({ assetId: asset._id, status: 'maintenance' })}
                                                            className="text-slate-400 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-zinc-300 text-sm font-medium transition-colors"
                                                            title="Enviar a Mantenimiento"
                                                        >
                                                            🔧
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {assets.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                                No hay hardware registrado en el sistema.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "software" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Licencias y Suscripciones</h2>
                            <button
                                onClick={() => setIsAddLicenseOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Nueva Licencia / SaaS
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {licenses.map((license) => {
                                const utilization = Math.round((license.assignedUsers.length / license.totalLicenses) * 100);
                                return (
                                    <div key={license._id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 relative overflow-hidden group shadow-sm transition-shadow hover:shadow-md">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-slate-100 dark:bg-zinc-800 rounded-xl group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                                                    <Shield className="w-6 h-6 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{license.softwareName}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-zinc-400">{license.provider}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">${license.costPerUser * license.totalLicenses}</p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Costo / período</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-6">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 dark:text-zinc-400">Uso de Licencia</span>
                                                <span className={`${utilization >= 100 ? "text-red-400" : "text-slate-900 dark:text-zinc-300"} font-medium`}>
                                                    {license.assignedUsers.length} / {license.totalLicenses} asientos
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${utilization >= 100 ? "bg-red-500" : "bg-indigo-500"}`}
                                                    style={{ width: `${Math.min(utilization, 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Dropdown for quick assign (Mocked representation) */}
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Expira: {new Date(license.expirationDate || 0).toLocaleDateString()}</span>
                                            <button className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
                                                Gestionar Asignaciones →
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Modals */}
                {isAddAssetOpen && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Registrar Activo Físico</h2>
                            <form onSubmit={handleCreateHardware} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Nombre Equipo (Ej. MacBook Pro M2)</label>
                                    <input type="text" required value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Tipo de Activo</label>
                                    <select value={newAsset.type} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value as any })} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500">
                                        <option value="laptop">Laptop / Computadora</option>
                                        <option value="phone">Teléfono Móvil</option>
                                        <option value="monitor">Monitor / Pantalla</option>
                                        <option value="accessory">Accesorio / Periférico</option>
                                        <option value="server">Servidor Local</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Número de Serie</label>
                                        <input type="text" required value={newAsset.serialNumber} onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Costo (USD)</label>
                                        <input type="number" required value={newAsset.cost || ""} onChange={(e) => setNewAsset({ ...newAsset, cost: parseFloat(e.target.value) })} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Fecha Compra</label>
                                        <input type="date" required value={newAsset.purchaseDate} onChange={(e) => setNewAsset({ ...newAsset, purchaseDate: e.target.value })} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 block [color-scheme:dark]" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Vto. Garantía</label>
                                        <input type="date" required value={newAsset.warrantyExpiry} onChange={(e) => setNewAsset({ ...newAsset, warrantyExpiry: e.target.value })} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 block [color-scheme:dark]" />
                                    </div>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Cuenta de Activo (33x)</label>
                                        <select
                                            value={newAsset.accountingAccountId}
                                            onChange={(e) => setNewAsset({ ...newAsset, accountingAccountId: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                                        >
                                            <option value="">Seleccionar cuenta...</option>
                                            {assetAccounts.map(acc => (
                                                <option key={acc._id} value={acc._id}>{acc.code} - {acc.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Cuenta de Depreciación (39x)</label>
                                        <select
                                            value={newAsset.depreciationAccountId}
                                            onChange={(e) => setNewAsset({ ...newAsset, depreciationAccountId: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                                        >
                                            <option value="">Seleccionar cuenta...</option>
                                            {depreciationAccounts.map(acc => (
                                                <option key={acc._id} value={acc._id}>{acc.code} - {acc.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button type="button" onClick={() => setIsAddAssetOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors">Cancelar</button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors">Guardar Equipo</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isAssignAssetOpen.isOpen && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-sm shadow-2xl">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Asignar Equipo</h2>
                            <form onSubmit={handleAssignEquipment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Seleccionar Empleado</label>
                                    <select value={selectedUserForAsset} onChange={(e) => setSelectedUserForAsset(e.target.value)} required className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500">
                                        <option value="">Buscar usuario...</option>
                                        {users.map((u: any) => (
                                            <option key={u._id} value={u._id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button type="button" onClick={() => setIsAssignAssetOpen({ isOpen: false, assetId: null })} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors">Cancelar</button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">Confirmar Asignación</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isAddLicenseOpen && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Nueva Suscripción de Software</h2>
                            <form onSubmit={handleCreateLicense} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Nombre Software (Ej. Google Workspace)</label>
                                    <input type="text" required value={newLicense.name} onChange={(e) => setNewLicense({ ...newLicense, name: e.target.value })} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Proveedor (SaaS Provider)</label>
                                    <input type="text" required value={newLicense.provider} onChange={(e) => setNewLicense({ ...newLicense, provider: e.target.value })} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Clave de Licencia / Link de Admin</label>
                                    <input type="text" required value={newLicense.licenseKey} onChange={(e) => setNewLicense({ ...newLicense, licenseKey: e.target.value })} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Asientos (Seats)</label>
                                        <input type="number" required value={newLicense.totalSeats} onChange={(e) => setNewLicense({ ...newLicense, totalSeats: parseInt(e.target.value) })} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Costo Unitario USD</label>
                                        <input type="number" required value={newLicense.costPerSeat || ""} onChange={(e) => setNewLicense({ ...newLicense, costPerSeat: parseFloat(e.target.value) })} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">Fecha Expiración/Renovación</label>
                                    <input type="date" required value={newLicense.expiresAt} onChange={(e) => setNewLicense({ ...newLicense, expiresAt: e.target.value })} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500 block [color-scheme:dark]" />
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button type="button" onClick={() => setIsAddLicenseOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors">Cancelar</button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">Guardar Licencia</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
