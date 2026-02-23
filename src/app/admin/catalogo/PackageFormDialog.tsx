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
import { Plus, Pencil } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
    description: z.string().optional().default(""),
    unit: z.enum(["digital", "solutions", "infra"]),
    type: z.enum(["service", "subscription", "hardware"]),
    basePrice: z.coerce.number().min(0, "El precio no puede ser negativo."),
    active: z.boolean().default(true)
});

type FormValues = z.infer<typeof formSchema>;

export function PackageFormDialog({
    initialData,
    trigger
}: {
    initialData?: FormValues & { _id: Id<"packages"> },
    trigger?: React.ReactNode
}) {
    const [open, setOpen] = useState(false);
    const createPackage = useMutation(api.packages.createPackage);
    const updatePackage = useMutation(api.packages.updatePackage);

    const isEditing = !!initialData;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            unit: initialData?.unit || "digital",
            type: initialData?.type || "service",
            basePrice: initialData?.basePrice || 0,
            active: initialData?.active ?? true,
        },
    });

    useEffect(() => {
        if (open && initialData) {
            form.reset({
                name: initialData.name,
                description: initialData.description,
                unit: initialData.unit,
                type: initialData.type,
                basePrice: initialData.basePrice,
                active: initialData.active,
            });
        }
    }, [open, initialData, form]);

    async function onSubmit(values: FormValues) {
        try {
            if (isEditing) {
                await updatePackage({ id: initialData._id, ...values });
                toast.success("Paquete actualizado con éxito");
            } else {
                await createPackage(values);
                toast.success("Paquete creado con éxito");
            }
            setOpen(false);
            if (!isEditing) form.reset();
        } catch (error) {
            toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} el paquete`);
            console.error(error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Paquete
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Paquete' : 'Crear Nuevo Paquete'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Modifica los detalles del paquete o servicio en el catálogo.'
                            : 'Añade un nuevo servicio, suscripción o hardware al catálogo.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control as any}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Diseño Web Landing Page" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unidad Módulo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="digital">U1 - Digital</SelectItem>
                                                <SelectItem value="solutions">U2 - Solutions</SelectItem>
                                                <SelectItem value="infra">U3 - Infra</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Venta</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="service">Servicio</SelectItem>
                                                <SelectItem value="subscription">Suscripción</SelectItem>
                                                <SelectItem value="hardware">Hardware</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control as any}
                            name="basePrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Precio Base (S/)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="active"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado</FormLabel>
                                    <Select onValueChange={(v) => field.onChange(v === "true")} defaultValue={field.value ? "true" : "false"} value={field.value ? "true" : "false"}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="true">Activo</SelectItem>
                                            <SelectItem value="false">Inactivo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white">
                            {isEditing ? 'Guardar Cambios' : 'Crear Paquete'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
