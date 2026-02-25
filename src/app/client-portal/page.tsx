"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Cctv, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { sileo } from "sileo";

export default function ClientPortalLogin() {
    const router = useRouter();
    const [loginMethod, setLoginMethod] = useState<"magic" | "simulate">("simulate");
    const [selectedClient, setSelectedClient] = useState("");

    // Solo para el entorno de pruebas, listamos los clientes.
    // En el mundo real esto no existiría, sería un token enviado al correo (Magic Link).
    const clients = useQuery(api.clients.getClients) || [];

    const handleAccess = () => {
        if (loginMethod === "simulate") {
            if (!selectedClient) {
                sileo.error({ title: "Selecciona una cuenta de empresa para ingresar." });
                return;
            }
            // Navegamos al layout protegido del portal con el cliente en la URL (o cookie en prod)
            router.push(`/client-portal/${selectedClient}`);
            sileo.success({ title: "Acceso Concedido: Entorno Simulado" });
        } else {
            sileo.info({ title: "En el sistema real, te ha llegado un correo electrónico con un enlace mágico." });
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex justify-center items-center relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10"
            >
                <div className="p-8 pb-6 border-b border-white/5 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4 text-indigo-400 border border-white/5 shadow-inner">
                        <Cctv className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Portal de Clientes</h1>
                    <p className="text-sm text-zinc-400">Transparencia corporativa y estado de cuenta 24/7.</p>
                </div>

                <div className="p-8 bg-zinc-950/50 space-y-6">
                    {/* Switcher de Métodos (Solo Dev) */}
                    <div className="flex bg-zinc-900 p-1 rounded-lg border border-white/5">
                        <button
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${loginMethod === 'simulate' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}
                            onClick={() => setLoginMethod('simulate')}
                        >
                            Simulador (Demo)
                        </button>
                        <button
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${loginMethod === 'magic' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}
                            onClick={() => setLoginMethod('magic')}
                        >
                            Enlace Mágico (Real)
                        </button>
                    </div>

                    {loginMethod === "simulate" ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Seleccionar Razón Social Habilitada</Label>
                                <Select value={selectedClient} onValueChange={setSelectedClient}>
                                    <SelectTrigger className="w-full bg-zinc-900 border-zinc-700 text-white focus:ring-indigo-500">
                                        <SelectValue placeholder="Buscando empresas inscritas..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                                        {clients.map((c: any) => (
                                            <SelectItem key={c._id} value={c._id} className="focus:bg-zinc-700 focus:text-white">
                                                {c.companyName}
                                            </SelectItem>
                                        ))}
                                        {clients.length === 0 && <SelectItem value="none" disabled>0 empresas en BD</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleAccess}
                                className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-bold h-11"
                            >
                                Ingresar al Portal <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Correo Electrónico Corporativo</Label>
                                <Input
                                    type="email"
                                    placeholder="contacto@miempresa.com"
                                    className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-indigo-500 h-11"
                                />
                            </div>
                            <Button
                                onClick={handleAccess}
                                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-semibold h-11"
                            >
                                <Mail className="w-4 h-4 mr-2" /> Enviar Enlace de Acceso
                            </Button>
                            <p className="text-xs text-center text-zinc-500">
                                Le enviaremos un Link Seguro temporal que no requiere contraseña.
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            <div className="absolute bottom-8 flex items-center gap-2 text-zinc-600 text-xs font-medium">
                <ShieldCheck className="w-4 h-4" /> Autenticado y Cifrado por BYTEK CORE
            </div>
        </div>
    );
}
