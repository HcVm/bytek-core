import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
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
import { UsersRound, Pencil } from "lucide-react";

const formSchema = z.object({
    companyName: z.string().min(2, "La razón social debe tener al menos 2 caracteres."),
    taxId: z.string().min(8, "RUC o DNI inválido"),
    contactName: z.string().min(2, "Ingresa un nombre de contacto válido."),
    phone: z.string().min(6, "Teléfono inválido"),
    status: z.enum(["prospect", "active", "churned"]),
});

type FormValues = z.infer<typeof formSchema>;

export function ClientFormDialog({
    initialData,
    trigger
}: {
    initialData?: FormValues & { _id: Id<"clients"> },
    trigger?: React.ReactNode
}) {
    const [open, setOpen] = useState(false);
    const createClient = useMutation(api.clients.createClient);
    const updateClient = useMutation(api.clients.updateClient);

    const isEditing = !!initialData;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            companyName: initialData?.companyName || "",
            taxId: initialData?.taxId || "",
            contactName: initialData?.contactName || "",
            phone: initialData?.phone || "",
            status: initialData?.status as any || "prospect",
        },
    });

    useEffect(() => {
        if (open && initialData) {
            form.reset({
                companyName: initialData.companyName,
                taxId: initialData.taxId,
                contactName: initialData.contactName,
                phone: initialData.phone,
                status: initialData.status as any,
            });
        }
    }, [open, initialData, form]);

    async function onSubmit(values: FormValues) {
        try {
            if (isEditing) {
                await updateClient({ id: initialData._id, ...values });
                toast.success("Cliente actualizado con éxito");
            } else {
                await createClient(values);
                toast.success("Cliente creado con éxito");
            }
            setOpen(false);
            if (!isEditing) form.reset();
        } catch (error: any) {
            toast.error(error.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el cliente`);
            console.error(error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
                        <UsersRound className="w-4 h-4 mr-2" />
                        Nuevo Cliente
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Actualiza la información comercial del cliente.'
                            : 'Añade una empresa o persona al directorio del CRM.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control as any}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Razón Social / Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. BYTEK S.A.C." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="taxId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>RUC / DNI</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. 2060..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="prospect">Prospecto</SelectItem>
                                                <SelectItem value="active">Activo</SelectItem>
                                                <SelectItem value="churned">Inactivo / Perdido</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="contactName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contacto Principal</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre del encargado" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+51 9..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white">
                            {isEditing ? 'Guardar Cambios' : 'Registrar Cliente'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
