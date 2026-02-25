import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { sileo } from "sileo";
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
import { Plus } from "lucide-react";

const formSchema = z.object({
    clientId: z.string().min(1, "Debes seleccionar un cliente."),
    assignedTo: z.string().min(1, "Asigna un responsable."),
    serviceUnit: z.enum(["digital", "solutions", "infra"]),
    packageId: z.string().min(1, "Debes seleccionar un servicio base."),
    estimatedValue: z.coerce.number().min(0, "El valor no puede ser negativo."),
    status: z.enum(["lead", "presentation", "negotiation", "won", "lost"]),
});

type FormValues = z.infer<typeof formSchema>;

export function OpportunityFormDialog({
    initialData,
    trigger
}: {
    initialData?: FormValues & { _id: Id<"opportunities"> },
    trigger?: React.ReactNode
}) {
    const [open, setOpen] = useState(false);

    // Obtener datos para los selects
    const clients = useQuery(api.clients.getClients) || [];
    const packages = useQuery(api.packages.getPackages) || [];
    const users = useQuery(api.users.getAllUsers) || [];

    // El assignedTo debe ser el admin/sales inyectado en el server-side,
    // o podríamos pedir el userID al hook de frontend si fuera necesario. 
    // Por simplicidad, el esquema pide assignedTo, así que usaremos un placeholder temporal o lo extraemos de app auth
    // Ya que usamos @convex-dev/auth, una mejor práctica es añadir logic in convex mutation to assign "ctx.userId" as assignedTo.
    // Vamos a ajustar la mutación temporalmente aquí o pasar un Id "falso" que Convex backend de todos modos sobreescribirá.
    // Asumiremos que mandamos un string vacío y en Convex mutator tomamos la identidad. (nota: requires backend adjust).

    const createOpportunity = useMutation(api.opportunities.createOpportunity);
    const updateOpportunity = useMutation(api.opportunities.updateOpportunity);

    const isEditing = !!initialData;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            clientId: initialData?.clientId || "",
            assignedTo: initialData?.assignedTo || "",
            serviceUnit: initialData?.serviceUnit || "digital",
            packageId: initialData?.packageId || "",
            estimatedValue: initialData?.estimatedValue || 0,
            status: initialData?.status as any || "lead",
        },
    });

    useEffect(() => {
        if (open && initialData) {
            form.reset({
                clientId: initialData.clientId,
                assignedTo: initialData.assignedTo,
                serviceUnit: initialData.serviceUnit,
                packageId: initialData.packageId,
                estimatedValue: initialData.estimatedValue,
                status: initialData.status as any,
            });
        }
    }, [open, initialData, form]);

    async function onSubmit(values: FormValues) {
        try {
            const payload = {
                ...values,
                clientId: values.clientId as Id<"clients">,
                assignedTo: values.assignedTo as Id<"users">
            };

            if (isEditing) {
                await updateOpportunity({ id: initialData._id, ...payload });
                sileo.success({ title: "Oportunidad actualizada con éxito" });
            } else {
                await createOpportunity(payload);
                sileo.success({ title: "Oportunidad creada con éxito" });
            }
            setOpen(false);
            if (!isEditing) form.reset();
        } catch (error: any) {
            sileo.error({ title: error.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la oportunidad` });
            console.error(error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Oportunidad
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Oportunidad' : 'Crear Oportunidad'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Actualiza el valor o estatus de esta oportunidad comercial.'
                            : 'Registra el interés de un cliente en el Pipeline de Ventas.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control as any}
                            name="clientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cliente</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona el cliente..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {clients.map(c => (
                                                <SelectItem key={c._id} value={c._id}>{c.companyName}</SelectItem>
                                            ))}
                                            {clients.length === 0 && <SelectItem value="disabled" disabled>No hay clientes creados</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="assignedTo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Responsable (Ejecutivo)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un vendedor..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {users.map(u => (
                                                <SelectItem key={u._id} value={u._id}>{u.name || u.email || 'Usuario Sin Nombre'}</SelectItem>
                                            ))}
                                            {users.length === 0 && <SelectItem value="disabled" disabled>No hay usuarios</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="serviceUnit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unidad de Negocio</FormLabel>
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
                                name="packageId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Interés Base</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {packages.map(p => (
                                                    <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                                                ))}
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
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Etapa Inicial</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="lead">Prospecto</SelectItem>
                                                <SelectItem value="presentation">Presentación</SelectItem>
                                                <SelectItem value="negotiation">Negociación</SelectItem>
                                                <SelectItem value="won">Ganado</SelectItem>
                                                <SelectItem value="lost">Perdido</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="estimatedValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Est. (S/)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white">
                            {isEditing ? 'Guardar Cambios' : 'Crear Oportunidad'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
