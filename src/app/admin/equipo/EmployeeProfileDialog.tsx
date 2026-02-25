"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, DollarSign, Calendar, CreditCard, Phone, Settings2, FileText, UploadCloud, UserMinus, ShieldAlert, File, Trash2, Home, HeartPulse, Building2 } from "lucide-react";
import { sileo } from "sileo";
import { Badge } from "@/components/ui/badge";

export function EmployeeProfileDialog({ userId, userName }: { userId: Id<"users">, userName: string }) {
    const [open, setOpen] = useState(false);

    const profile = useQuery(api.hr.getEmployeeProfile, { userId });
    const documents = useQuery(api.hr.getEmployeeDocuments, { userId });

    const upsertProfile = useMutation(api.hr.upsertEmployeeProfile);
    const generateUploadUrl = useMutation(api.hr.generateUploadUrl);
    const saveDocument = useMutation(api.hr.saveEmployeeDocument);
    const deleteDocument = useMutation(api.hr.deleteEmployeeDocument);

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        // Base
        contractType: "honorarios",
        baseSalary: "",
        hireDate: new Date().toISOString().split('T')[0],
        bankAccountDetails: "",
        emergencyContact: "",

        // Legales / Demográficos
        documentId: "",
        birthDate: "",
        address: "",
        healthInsurance: "ninguno",

        // Ciclo de Vida
        status: "activo",
        terminationDate: "",
        terminationReason: ""
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                contractType: profile.contractType,
                baseSalary: profile.baseSalary.toString(),
                hireDate: new Date(profile.hireDate).toISOString().split('T')[0],
                bankAccountDetails: profile.bankAccountDetails || "",
                emergencyContact: profile.emergencyContact || "",

                documentId: profile.documentId || "",
                birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : "",
                address: profile.address || "",
                healthInsurance: profile.healthInsurance || "ninguno",

                status: profile.status || "activo",
                terminationDate: profile.terminationDate ? new Date(profile.terminationDate).toISOString().split('T')[0] : "",
                terminationReason: profile.terminationReason || ""
            });
        }
    }, [profile, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await upsertProfile({
                userId,
                contractType: formData.contractType as any,
                baseSalary: parseFloat(formData.baseSalary) || 0,
                hireDate: new Date(formData.hireDate).getTime(),
                bankAccountDetails: formData.bankAccountDetails,
                emergencyContact: formData.emergencyContact,

                status: formData.status as any,
                documentId: formData.documentId,
                birthDate: formData.birthDate ? new Date(formData.birthDate).getTime() : undefined,
                address: formData.address,
                healthInsurance: formData.healthInsurance as any,
                terminationDate: formData.terminationDate ? new Date(formData.terminationDate).getTime() : undefined,
                terminationReason: formData.terminationReason
            });
            sileo.success({ title: "Legajo digital actualizado" });
            // No cerramos el modal para permitir navegar solapas
        } catch (error) {
            sileo.error({ title: "Error al guardar el legajo" });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setIsUploading(true);

        try {
            // 1. Get Convex Upload URL
            const postUrl = await generateUploadUrl();

            // 2. Upload file
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();

            // 3. Save reference in HR Tables
            await saveDocument({
                userId,
                storageId,
                fileType: "contrato", // Podríamos poner un select, por defecto contrato en MVP
                title: file.name,
                uploadedBy: userId // En la vida real, sería el admin actual. Para simplificar, userId
            });

            sileo.success({ title: "Documento cargado a la bóveda" });
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            sileo.error({ title: "Fallo al subir archivo" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteDoc = async (docId: Id<"employeeDocuments">, storageId: Id<"_storage">) => {
        try {
            await deleteDocument({ documentId: docId, fileId: storageId });
            sileo.success({ title: "Archivo eliminado" });
        } catch (error) {
            sileo.error({ title: "Error borrando el archivo" });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "activo": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "suspendido": return "bg-orange-100 text-orange-700 border-orange-200";
            case "vacaciones": return "bg-indigo-100 text-indigo-700 border-indigo-200";
            case "licencia": return "bg-blue-100 text-blue-700 border-blue-200";
            case "cesado": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-zinc-100 text-zinc-700";
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700">
                    <Settings2 className="w-4 h-4 mr-2" />
                    Legajo HR
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col p-0 bg-white gap-0 border-zinc-200 shadow-2xl">
                <DialogHeader className="px-6 py-4 border-b border-zinc-100 bg-slate-50">
                    <DialogTitle className="flex items-center justify-between text-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-zinc-900 font-bold">{userName}</div>
                                <div className="text-xs text-zinc-500 font-mono">Legajo Digital Corporativo</div>
                            </div>
                        </div>
                        {formData.status && (
                            <Badge variant="outline" className={`uppercase tracking-wider font-bold text-[10px] ${getStatusColor(formData.status)}`}>
                                {formData.status}
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="contrato" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 pt-4 border-b border-zinc-100">
                        <TabsList className="grid grid-cols-4 w-full bg-zinc-100/50 p-1 rounded-xl h-12">
                            <TabsTrigger value="contrato" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-sm font-medium">Contrato & Salario</TabsTrigger>
                            <TabsTrigger value="legal" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-sm font-medium">Demográfica Legal</TabsTrigger>
                            <TabsTrigger value="documentos" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-sm font-medium flex items-center gap-2"><FileText className="w-4 h-4" /> Bóveda Doc</TabsTrigger>
                            <TabsTrigger value="ciclo" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:shadow-sm rounded-lg text-sm font-medium text-red-500"><ShieldAlert className="w-4 h-4 mr-1" /> Ciclo Vida</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                        <form id="hr-form" onSubmit={handleSubmit}>
                            {/* TAB 1: CONTRATO (BASE) */}
                            <TabsContent value="contrato" className="space-y-6 m-0">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Modalidad Tributaria</label>
                                        <Select value={formData.contractType} onValueChange={(v) => setFormData({ ...formData, contractType: v })}>
                                            <SelectTrigger className="bg-white border-zinc-200 h-11"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="planilla">Planilla Régimen General</SelectItem>
                                                <SelectItem value="honorarios">Recibo por Honorarios (Servicios)</SelectItem>
                                                <SelectItem value="contratista">Contratista Externo (B2B)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Salario Base (Mensual)</label>
                                        <Input type="number" className="h-11 bg-white border-zinc-200 text-lg font-mono font-bold text-emerald-700" value={formData.baseSalary} onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })} placeholder="S/ 0.00" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> F. Ingreso (Alta Laboral)</label>
                                        <Input type="date" className="h-11 bg-white border-zinc-200" value={formData.hireDate} onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Finanzas / Cuenta de Abono</label>
                                        <Input type="text" placeholder="BCP Soles 191..." className="h-11 bg-white border-zinc-200" value={formData.bankAccountDetails} onChange={(e) => setFormData({ ...formData, bankAccountDetails: e.target.value })} />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB 2: LEGAL DEMOGRÁFICO */}
                            <TabsContent value="legal" className="space-y-6 m-0">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Documento Identidad</label>
                                        <Input type="text" placeholder="DNI, CE o Pasaporte" className="h-11 bg-white border-zinc-200" value={formData.documentId} onChange={(e) => setFormData({ ...formData, documentId: e.target.value })} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> F. Cumpleaños</label>
                                        <Input type="date" className="h-11 bg-white border-zinc-200" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} />
                                    </div>
                                    <div className="space-y-3 col-span-2">
                                        <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5"><Home className="w-3.5 h-3.5" /> Dirección Domiciliaria</label>
                                        <Input type="text" placeholder="Sede fiscal del empleado o departamento" className="h-11 bg-white border-zinc-200" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5"><HeartPulse className="w-3.5 h-3.5" /> Seguro y EPS (Planilla)</label>
                                        <Select value={formData.healthInsurance} onValueChange={(v) => setFormData({ ...formData, healthInsurance: v })}>
                                            <SelectTrigger className="bg-white border-zinc-200 h-11"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ninguno">Ninguno / Honorarios</SelectItem>
                                                <SelectItem value="essalud">EsSalud (Base)</SelectItem>
                                                <SelectItem value="eps">EPS Privada / Seguro Corporativo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> SOS Emergencias</label>
                                        <Input type="text" placeholder="Familiar y Celular" className="h-11 bg-white border-zinc-200" value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB 3: STORAGE */}
                            <TabsContent value="documentos" className="space-y-6 m-0">
                                <div className="border border-dashed border-indigo-200 bg-indigo-50/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-colors hover:bg-indigo-50">
                                    <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 mb-4 shadow-sm">
                                        <UploadCloud className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-zinc-900 mb-1">Subir Documento Confidencial</h3>
                                    <p className="text-sm text-zinc-500 mb-6 max-w-sm">Adjunta memorándums, contratos físicos escaneados o NDAs vinculados directamente a {userName}.</p>

                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.jpg,.png" />
                                    <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">
                                        {isUploading ? "Cifrando y Subiendo..." : "Explorar Archivos locales"}
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Bóveda del Empleado ({documents?.length || 0})</h4>
                                    {(!documents || documents.length === 0) && (
                                        <div className="text-sm text-zinc-400 italic p-4 text-center border border-zinc-100 rounded-lg">No hay contratos escaneados en el legajo.</div>
                                    )}
                                    {documents?.map(doc => (
                                        <div key={doc._id} className="flex flex-row items-center justify-between p-3.5 bg-white border border-zinc-200 rounded-xl hover:shadow-sm transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 border border-slate-200">
                                                    <File className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <a href={doc.url as string} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-700 hover:text-indigo-900 hover:underline">{doc.title}</a>
                                                    <div className="text-[10px] text-zinc-500 uppercase mt-0.5">{doc.type} • Subido el {new Date(doc.uploadDate).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteDoc(doc._id, doc.fileId)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* TAB 4: CICLO DE VIDA (ZONA DE PELIGRO) */}
                            <TabsContent value="ciclo" className="space-y-8 m-0">
                                <div className="p-6 bg-red-50/50 border border-red-100 rounded-2xl">
                                    <h3 className="text-lg font-bold text-red-900 flex items-center gap-2 mb-2">
                                        <UserMinus className="w-5 h-5 text-red-500" /> Estado de la Operación
                                    </h3>
                                    <p className="text-sm text-red-700/80 mb-6 max-w-lg">Cambiar a un estado negativo deshabilitará de inmediato el acceso de este usuario al sistema Field Service, Pizarras Dev y Client Portal.</p>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold tracking-wider text-red-800 uppercase">Fase Vital</label>
                                            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                                <SelectTrigger className="bg-white border-red-200 h-11 focus:ring-red-500"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="activo" className="font-bold text-emerald-600">Alta Comercial (Activo)</SelectItem>
                                                    <SelectItem value="vacaciones" className="text-indigo-600">Vacaciones Aprobadas</SelectItem>
                                                    <SelectItem value="licencia" className="text-blue-600">Licencia de Enfermedad o Paternidad</SelectItem>
                                                    <SelectItem value="suspendido" className="font-bold text-orange-600">Suspensión Temporal</SelectItem>
                                                    <SelectItem value="cesado" className="font-bold text-red-600">Baja Laboral (Cesado)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {formData.status === 'cesado' && (
                                            <div className="grid grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Fecha de Salida</label>
                                                    <Input type="date" className="h-11" value={formData.terminationDate} onChange={(e) => setFormData({ ...formData, terminationDate: e.target.value })} required={formData.status === 'cesado'} />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Sustento Legal / Motivo</label>
                                                    <Input type="text" placeholder="Término contrato, Infracción, Renuncia..." className="h-11" value={formData.terminationReason} onChange={(e) => setFormData({ ...formData, terminationReason: e.target.value })} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </form>
                    </div>
                </Tabs>

                <div className="px-6 py-4 bg-slate-50 border-t border-zinc-200 flex justify-end gap-3 mt-auto">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-zinc-200 text-zinc-600">Cerrar Legajo</Button>
                    <Button type="submit" form="hr-form" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8">Guardar Enmiendas Legales</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
