import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, File, Calendar, Building, Landmark, ShieldCheck, Handshake } from "lucide-react";
import { toast } from "sonner";

export function UploadLegalDocDialog({ currentTab }: { currentTab: "corporativo" | "comercial" }) {
    const [open, setOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const generateUploadUrl = useMutation(api.hr.generateUploadUrl); // Re-uso del endpoint de storage base
    const saveLegalDoc = useMutation(api.legal.saveLegalDocument);
    const allUsers = useQuery(api.users.getAllUsers) || [];
    const allClients = useQuery(api.clients.getClients) || [];

    // Asumiremos que el admin logueado es el primero en este MVP Simulador
    const currentAdminId = allUsers[0]?._id;

    const [formData, setFormData] = useState({
        title: "",
        type: currentTab === "corporativo" ? "marca" : "contrato_cliente",
        status: "vigente",
        expirationDate: "",
        targetClientId: "none",
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Debes adjuntar un archivo PDF o Escaneo");
            return;
        }
        if (!currentAdminId) return;

        setIsUploading(true);
        try {
            // 1. Get Convex Upload URL
            const postUrl = await generateUploadUrl();

            // 2. Upload file
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": selectedFile.type },
                body: selectedFile,
            });
            const { storageId } = await result.json();

            // 3. Save reference in Legal Tables
            await saveLegalDoc({
                title: formData.title,
                type: formData.type as any,
                status: formData.status as any,
                expirationDate: formData.expirationDate ? new Date(formData.expirationDate).getTime() : undefined,
                targetClientId: formData.targetClientId !== "none" ? formData.targetClientId as Id<"clients"> : undefined,
                storageId,
                uploadedBy: currentAdminId
            });

            toast.success("Documento Legal archivado con éxito");
            setOpen(false);
            setFormData({ title: "", type: currentTab === "corporativo" ? "marca" : "contrato_cliente", status: "vigente", expirationDate: "", targetClientId: "none" });
            setSelectedFile(null);
        } catch (error) {
            toast.error("Error interconectando con la Bóveda Segura");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-2 shadow-sm">
                    <UploadCloud className="w-4 h-4" />
                    Nuevo Expediente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white border-slate-200 shadow-xl">
                <DialogHeader className="border-b border-slate-100 pb-4">
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                        {currentTab === "corporativo" ? <Landmark className="w-5 h-5 text-amber-500" /> : <Handshake className="w-5 h-5 text-blue-500" />}
                        Archivar {currentTab === "corporativo" ? "Propiedad Intelectual" : "Acuerdo Comercial"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título Oficial</label>
                        <Input required placeholder="Ej. Certificado de Marca INDECOPI - Clase 42" className="bg-white" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</label>
                            <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {currentTab === "corporativo" ? (
                                        <>
                                            <SelectItem value="marca">Marca Registrada</SelectItem>
                                            <SelectItem value="copia_literal">Copia Literal (SUNARP)</SelectItem>
                                            <SelectItem value="vigencia_poder">Vigencia de Poder</SelectItem>
                                        </>
                                    ) : (
                                        <>
                                            <SelectItem value="contrato_cliente">Contrato B2B</SelectItem>
                                            <SelectItem value="carta_garantia">Carta de Garantía</SelectItem>
                                            <SelectItem value="nda">Acuerdo NDA</SelectItem>
                                        </>
                                    )}
                                    <SelectItem value="otro">Otro Documento</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado Legal</label>
                            <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vigente" className="text-emerald-600 font-bold">Vigente Oficial</SelectItem>
                                    <SelectItem value="tramite" className="text-amber-600 font-bold">En Trámite / Observado</SelectItem>
                                    <SelectItem value="vencido" className="text-red-600 font-bold">Vencido / Anulado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> F. Expira o Renovación
                        </label>
                        <Input type="date" className="bg-white" value={formData.expirationDate} onChange={e => setFormData({ ...formData, expirationDate: e.target.value })} />
                        <p className="text-[10px] text-slate-400">Si se estipula, el radar de Compliance te avisará 30 días antes.</p>
                    </div>

                    {currentTab === "comercial" && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <Building className="w-3.5 h-3.5" /> Relacionar con Entidad
                            </label>
                            <Select value={formData.targetClientId} onValueChange={v => setFormData({ ...formData, targetClientId: v })}>
                                <SelectTrigger className="bg-white"><SelectValue placeholder="Seleccionar Cliente (Opcional)" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none" className="text-slate-400 italic">No vincular a CRM</SelectItem>
                                    {allClients.map((c: any) => (
                                        <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="border border-dashed border-slate-300 bg-slate-50 p-4 rounded-xl mt-4 flex flex-col items-center">
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept=".pdf,.png,.jpg,.jpeg" />
                        {selectedFile ? (
                            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg w-full justify-between">
                                <div className="flex items-center gap-2 truncate">
                                    <File className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{selectedFile.name}</span>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedFile(null)} className="h-6 w-6 p-0 hover:bg-emerald-100 shrink-0">✕</Button>
                            </div>
                        ) : (
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 border-slate-200 border-2 border-dashed w-full h-12">
                                + Seleccionar Archivo
                            </Button>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-slate-500">Cancelar</Button>
                        <Button type="submit" disabled={isUploading} className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
                            {isUploading ? "Cifrando y Subiendo..." : "Registrar Documento Civil"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
