"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Clock, CalendarDays, Receipt, Clock3, LogOut, CheckCircle2, UserCog } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function MiPerfilPage() {
    // Para MVP sin Login Auth real, simulamos con el primer usuario de la BD o por un ID fijo
    // o dejamos que escojan quién está en sesión. Implementaremos un selector rápido.
    const allUsers = useQuery(api.users.getAllUsers) || [];
    const [currentUserId, setCurrentUserId] = useState<string>("");

    if (allUsers.length === 0) return <div className="p-8 text-zinc-500">Cargando directorio...</div>;

    const selectedUser = allUsers.find(u => u._id === currentUserId) || allUsers[0];
    if (!currentUserId && allUsers.length > 0) {
        setCurrentUserId(allUsers[0]._id);
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            {/* Header de simulación de cuenta */}
            <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-xl shadow-lg border border-zinc-800 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-lg text-emerald-950">
                        {selectedUser?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <div className="text-xs text-zinc-400 uppercase tracking-widest font-semibold font-mono">Simulando Sesión Activa</div>
                        <div className="font-bold">{selectedUser?.name}</div>
                    </div>
                </div>
                <div className="w-64">
                    <Select value={currentUserId} onValueChange={setCurrentUserId}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue placeholder="Cambiar Usuario" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                            {allUsers.map((u) => (
                                <SelectItem key={u._id} value={u._id} className="focus:bg-zinc-700 focus:text-white">
                                    {u.name} - {u.role === 'admin' ? 'Gerencia' : 'Staff'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedUser && <PerfilContenido userId={selectedUser._id} />}
        </div>
    );
}

function PerfilContenido({ userId }: { userId: Id<"users"> }) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD local
    const attendance = useQuery(api.hr.getTodayAttendance, { userId, date: today });
    const profile = useQuery(api.hr.getEmployeeProfile, { userId });

    const clockInMutation = useMutation(api.hr.clockIn);
    const clockOutMutation = useMutation(api.hr.clockOut);

    const handleClockIn = async () => {
        try {
            await clockInMutation({ userId, date: today });
            toast.success("¡Asistencia Marcada! Buen día de trabajo.");
        } catch (error: any) {
            toast.error(error.message || "Error al registrar entrada.");
        }
    };

    const handleClockOut = async () => {
        if (!attendance) return;
        try {
            await clockOutMutation({ attendanceId: attendance._id });
            toast.success("¡Salida Registrada! Hasta mañana.");
        } catch (error: any) {
            toast.error("Error al registrar salida.");
        }
    };

    const formatTime = (ts: number | undefined) => {
        if (!ts) return "--:--";
        return new Date(ts).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Columna Izquierda: Información Personal */}
            <div className="col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                    <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-emerald-600" /> Datos Corporativos
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <div className="text-xs text-zinc-500 uppercase font-semibold mb-1">Tipo de Contrato</div>
                            <div className="font-medium text-zinc-900 capitalize">{profile?.contractType || 'Contrato no especificado'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-zinc-500 uppercase font-semibold mb-1">Fecha de Ingreso</div>
                            <div className="font-medium text-zinc-900">
                                {profile?.hireDate ? new Date(profile.hireDate).toLocaleDateString('es-PE') : 'No registrada'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-zinc-500 uppercase font-semibold mb-1">Banco y Cuenta</div>
                            <div className="font-medium text-zinc-900 font-mono text-sm">{profile?.bankAccountDetails || 'Falta información (Hablar con RRHH)'}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-emerald-50 p-6 rounded-2xl shadow-sm border border-emerald-100">
                    <h2 className="text-lg font-bold text-emerald-900 mb-2">Próximo Pago</h2>
                    <p className="text-emerald-700 text-sm mb-4">Tu corte de nómina se realiza los 30 de cada mes laboral.</p>
                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                        <Receipt className="w-4 h-4" /> Ver mis Boletas de Pago
                    </button>
                </div>
            </div>

            {/* Columna Derecha: Reloj Biométrico & Vacaciones */}
            <div className="col-span-2 space-y-8">
                {/* RELOJ BIOMÉTRICO */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-600" /> Reloj Biométrico ("Clock In")
                            </h2>
                            <p className="text-zinc-500 text-sm mt-1">Registra tu asistencia diaria con 1 click.</p>
                        </div>
                        <div className="bg-zinc-100 px-4 py-2 rounded-lg font-mono text-xl font-bold text-zinc-800">
                            {new Date().toLocaleDateString('es-PE')}
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center">
                        {!attendance ? (
                            <>
                                <button
                                    onClick={handleClockIn}
                                    className="w-48 h-48 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white shadow-xl hover:shadow-indigo-500/30 transition-all hover:scale-105"
                                >
                                    <div className="flex flex-col items-center">
                                        <Clock3 className="w-12 h-12 mb-2" />
                                        <span className="text-xl font-black tracking-wider uppercase">Clock In</span>
                                        <span className="text-indigo-200 text-xs mt-1">Iniciar Jornada</span>
                                    </div>
                                </button>
                                <p className="mt-6 text-zinc-500 text-sm">Aún no has marcado ingreso hoy.</p>
                            </>
                        ) : (
                            <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-zinc-900">Jornada Activa</div>
                                        <div className="text-sm text-zinc-500">Haz marcado asistencia para el día de hoy.</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                        <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Hora de Entrada</div>
                                        <div className="text-2xl font-mono text-zinc-900 font-bold">{formatTime(attendance.clockInTime)}</div>
                                    </div>
                                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                        <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Hora de Salida</div>
                                        <div className="text-2xl font-mono text-zinc-900 font-bold">
                                            {attendance.clockOutTime ? formatTime(attendance.clockOutTime) : "--:--"}
                                        </div>
                                    </div>
                                </div>

                                {!attendance.clockOutTime ? (
                                    <button
                                        onClick={handleClockOut}
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/25 transition-all text-center"
                                    >
                                        <LogOut className="w-5 h-5 inline-block mr-2" />
                                        Terminar Jornada ("Clock Out")
                                    </button>
                                ) : (
                                    <div className="w-full bg-zinc-100 text-zinc-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-zinc-200 text-center">
                                        Jornada Finalizada
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* MIS VACACIONES */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-purple-600" /> Solicitudes y Vacaciones
                            </h2>
                            <p className="text-zinc-500 text-sm mt-1">Acuerda tus permisos y descansos con Recursos Humanos.</p>
                        </div>
                        <button className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                            + Nueva Solicitud
                        </button>
                    </div>

                    <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center bg-zinc-50/50">
                        <CalendarDays className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                        <h3 className="font-semibold text-zinc-600">No hay solicitudes recientes</h3>
                        <p className="text-zinc-400 text-sm mt-1">El historial de tus permisos médicos y vacaciones aparecerá aquí.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
