import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "convex/react";
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
    sku: z.string().min(3, "El SKU debe tener al menos 3 caracteres"),
    name: z.string().min(3, "Nombre muy corto"),
    brand: z.string().min(1, "Debe especificar la marca"),
    costPrice: z.coerce.number().min(0, "Debe ser mayor a 0"),
    salePrice: z.coerce.number().min(0, "Debe ser mayor a 0"),
    minStockAlert: z.coerce.number().min(0),
    accountingAccountId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function HardwareFormDialog() {
    const [open, setOpen] = useState(false);
    const addHardwareModel = useMutation(api.inventory.addHardwareModel);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            sku: "",
            name: "",
            brand: "",
            costPrice: 0,
            salePrice: 0,
            minStockAlert: 5,
            accountingAccountId: undefined,
        },
    });

    const movementAccounts = useQuery(api.accounting.getMovementAccounts) || [];
    const inventoryAccounts = movementAccounts.filter(acc => acc.code.startsWith("20") || acc.type === "activo");

    async function onSubmit(values: FormValues) {
        try {
            const { accountingAccountId, ...rest } = values;
            await addHardwareModel({
                ...rest,
                accountingAccountId: accountingAccountId as Id<"accountingAccounts"> | undefined
            });
            sileo.success({ title: "Modelo añadido al catálogo" });
            setOpen(false);
            form.reset();
        } catch (error: any) {
            sileo.error({ title: error.message || `Error al guardar` });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Modelo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Añadir Modelo al Catálogo</DialogTitle>
                    <DialogDescription>
                        Crea la ficha del producto físico para empezar a recibir stock.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="sku"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SKU / Código</FormLabel>
                                        <FormControl>
                                            <Input placeholder="CAM-IP-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marca</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Hikvision" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control as any}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Equipo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Cámara IP Domo 2MP" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="costPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Costo (S/)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="salePrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio Venta (S/)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control as any}
                            name="minStockAlert"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Alerta Stock Mínimo</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="accountingAccountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cuenta Contable (Inventario)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                                <SelectValue placeholder="Seleccione cuenta (ej: 20x)" className="dark:text-zinc-400" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {inventoryAccounts.map(acc => (
                                                <SelectItem key={acc._id} value={acc._id}>
                                                    {acc.code} - {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">
                            Guardar Catálogo
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
