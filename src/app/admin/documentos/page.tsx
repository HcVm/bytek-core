"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Files, FileText, Download, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DocumentUploadDialog } from "./DocumentUploadDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function DocumentosPage() {
    // Por el momento simulando la vista global o de la empresa.
    const documents = useQuery(api.documents.getDocumentsQuery, {});
    const departments = useQuery(api.departments.getAllDepartments);
    const users = useQuery(api.users.getAllUsers);

    if (documents === undefined || departments === undefined || users === undefined) {
        return (
            <div className="flex h-[80vh] items-center justify-center text-zinc-400">
                <Files className="w-6 h-6 animate-pulse mr-2" />
                <span>Cargando bóveda documental...</span>
            </div>
        );
    }

    const typeLabels: Record<string, string> = {
        policy: "Normativa / Política",
        manual: "Manual Operativo",
        memo: "Memorándum",
        other: "Otro Documento"
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Gestión Documental</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Bóveda central de políticas, manuales y normativas internas.</p>
                </div>
                <DocumentUploadDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {documents.map(doc => {
                    const uploader = users.find(u => u._id === doc.uploadedBy);
                    const isGlobal = !doc.departmentId;
                    const dept = departments.find(d => d._id === doc.departmentId);

                    return (
                        <div key={doc._id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0 border border-zinc-200 dark:border-zinc-800">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-zinc-900 dark:text-white text-base truncate">{doc.title}</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Subido por: {uploader?.name || 'Desconocido'}</p>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-600">{format(new Date(doc.createdAt), "dd MMM yyyy", { locale: es })}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <Badge variant="outline" className="text-[10px] uppercase text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800">
                                    {typeLabels[doc.category] || "Documento General"}
                                </Badge>
                                {!isGlobal ? (
                                    <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 flex items-center gap-1 text-[10px] border border-emerald-100 dark:border-emerald-800">
                                        <Building className="w-3 h-3" />
                                        {dept?.name || "Área"}
                                    </Badge>
                                ) : (
                                    <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] border-none">
                                        Público
                                    </Badge>
                                )}
                            </div>

                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-1">
                                <a
                                    href={doc.downloadUrl || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex w-full items-center justify-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 py-2 rounded-md transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Descargar Archivo
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>

            {documents.length === 0 && (
                <div className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500 dark:text-zinc-400 w-full mt-8">
                    <Files className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                    <p>La bóveda está vacía. No hay documentos compartidos.</p>
                </div>
            )}
        </div>
    );
}
