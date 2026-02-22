import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation } from "convex/react";
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
import { Plus } from "lucide-react";

const formSchema = z.object({
    clientId: z.string().min(1, "Selecciona un cliente"),
    projectId: z.string().optional(),
    amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
    billingType: z.enum(["recurring", "one_time", "milestone"]),
    status: z.enum(["pending", "paid", "overdue"]),
    dueDate: z.coerce.number().min(86400000, "Selecciona una fecha válida"), // Validaremos la lógica de fecha manual o usaremos datetime-local.
    paymentGatewayReference: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function InvoiceFormDialog({
    initialData,
    trigger
}: {
    initialData?: FormValues & { _id: Id<"invoices">, dueDate: number },
    trigger?: React.ReactNode
}) {
    const [open, setOpen] = useState(false);

    const clients = useQuery(api.clients.getClients) || [];
    const projects = useQuery(api.projects.getProjects) || [];

    const createInvoice = useMutation(api.invoices.createInvoice);
    const updateInvoice = useMutation(api.invoices.updateInvoice);

    const isEditing = !!initialData;

    // Convertimos dueDate de ms a string YYYY-MM-DD para el input type="date"
    const msToDateString = (ms: number) => {
        if (!ms) return "";
        const d = new Date(ms);
        return d.toISOString().split("T")[0];
    };

    const dateStringToMs = (dateStr: string) => {
        if (!dateStr) return Date.now();
        return new Date(dateStr).getTime();
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            clientId: initialData?.clientId || "",
            projectId: initialData?.projectId || "none",
            amount: initialData?.amount || 0,
            billingType: initialData?.billingType || "one_time",
            status: initialData?.status as any || "pending",
            dueDate: initialData?.dueDate || Date.now() + (7 * 24 * 60 * 60 * 1000), // Default +7 días
            paymentGatewayReference: initialData?.paymentGatewayReference || "",
        },
    });

    useEffect(() => {
        if (open && initialData) {
            form.reset({
                ...initialData,
                projectId: initialData.projectId || "none",
                paymentGatewayReference: initialData.paymentGatewayReference || "",
            });
        }
    }, [open, initialData, form]);

    async function onSubmit(values: FormValues) {
        try {
            const payload = {
                clientId: values.clientId as Id<"clients">,
                projectId: values.projectId === "none" ? undefined : (values.projectId as Id<"projects">),
                amount: values.amount,
                billingType: values.billingType as "recurring" | "one_time" | "milestone",
                status: values.status as "pending" | "paid" | "overdue",
                dueDate: values.dueDate,
                paymentGatewayReference: values.paymentGatewayReference || undefined
            };

            if (isEditing) {
                await updateInvoice({ id: initialData._id, ...payload });
                toast.success("Factura actualizada");
            } else {
                await createInvoice(payload);
                toast.success("Cuenta por cobrar generada");
            }
            setOpen(false);
            if (!isEditing) form.reset();
        } catch (error: any) {
            toast.error(error.message || `Error al guardar la factura`);
            console.error(error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Emitir Factura
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Cuenta de Cobro' : 'Nueva Cuenta de Cobro'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Modifica los estados de pago o montos pendientes.' : 'Genera un nuevo requerimiento de pago interno para un cliente.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control as any}
                            name="clientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cliente Facturador</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un cliente..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {clients.map(c => (
                                                <SelectItem key={c._id} value={c._id}>{c.companyName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="projectId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vincular a Proyecto (Opcional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sin vinculación" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">Sin vinculación</SelectItem>
                                            {projects.map(p => (
                                                <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monto (S/)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>F. Vencimiento</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                value={msToDateString(field.value)}
                                                onChange={(e) => field.onChange(dateStringToMs(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="billingType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Cobro</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="one_time">Único (One-Time)</SelectItem>
                                                <SelectItem value="recurring">Recurrente / SaaS</SelectItem>
                                                <SelectItem value="milestone">Por Hito de Avance</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                                <SelectItem value="pending">Pendiente</SelectItem>
                                                <SelectItem value="paid">Pagado</SelectItem>
                                                <SelectItem value="overdue">Vencido</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control as any}
                            name="paymentGatewayReference"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Referencia Pasarela (OPCIONAL)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: order_izipay_123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isEditing ? 'Guardar Cambios' : 'Generar Cuenta'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
