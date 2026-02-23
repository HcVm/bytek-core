import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UploadCloud } from "lucide-react";

// The schema won't validate files directly, we'll handle the file upload separately
const formSchema = z.object({
    title: z.string().min(2, "El título es muy corto."),
    category: z.enum(["policy", "manual", "memo", "other"]),
    departmentId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function DocumentUploadDialog({ trigger }: { trigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const departments = useQuery(api.departments.getAllDepartments);
    const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
    const saveDocument = useMutation(api.documents.saveDocument);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            category: "other",
            departmentId: "none",
        },
    });

    async function onSubmit(values: FormValues) {
        if (!selectedFile) {
            toast.error("Por favor selecciona un archivo PDF o documento para subir.");
            return;
        }

        try {
            setIsUploading(true);

            // 1. Get an upload URL from Convex
            const postUrl = await generateUploadUrl();

            // 2. Upload the file
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": selectedFile.type },
                body: selectedFile,
            });

            if (!result.ok) throw new Error("Fallo al subir archivo a Storage");

            const { storageId } = await result.json();

            // 3. Save Document Metadata
            await saveDocument({
                title: values.title,
                fileId: storageId,
                uploadedBy: "jh71q4pnvp03ttb5y7k77hsn0s79yvnm" as any, // Placeholder ID for the uploader since auth is not fully enforced
                departmentId: values.departmentId === "none" ? undefined : (values.departmentId as any),
                category: values.category as any,
            });

            toast.success("Documento interno guardado con éxito.");
            setOpen(false);
            form.reset();
            setSelectedFile(null);
        } catch (error: any) {
            toast.error(error.message || 'Error al subir el documento');
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                        <UploadCloud className="w-4 h-4 mr-2" />
                        Subir Documento
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Añadir Documento Interno</DialogTitle>
                    <DialogDescription>
                        Sube normativas, manuales operativos o memorándums.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título del Archivo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Manual de Procedimientos TI" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoría Documental</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Clasificación..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="policy">Política Corporativa</SelectItem>
                                            <SelectItem value="manual">Manual Operativo</SelectItem>
                                            <SelectItem value="memo">Memorándum Interno</SelectItem>
                                            <SelectItem value="other">Otro Documento</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="departmentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Restringir a Departamento (Opcional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Público para todos..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">Público (Toda la compañía)</SelectItem>
                                            {departments?.map(dept => (
                                                <SelectItem key={dept._id} value={dept._id}>{dept.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Custom File Input outside of React Hook Form since standard input[type=file] is complex to wire generically with forms */}
                        <div className="space-y-2">
                            <FormLabel>Archivo Físico (PDF/DOCX)</FormLabel>
                            <Input
                                type="file"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setSelectedFile(e.target.files[0]);
                                    }
                                }}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isUploading}>
                            {isUploading ? "Subiendo archivo..." : "Subir y Compartir"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
