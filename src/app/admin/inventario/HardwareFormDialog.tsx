import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
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
import { Plus } from "lucide-react";

const formSchema = z.object({
    sku: z.string().min(3, "El SKU debe tener al menos 3 caracteres"),
    name: z.string().min(3, "Nombre muy corto"),
    brand: z.string().min(1, "Debe especificar la marca"),
    costPrice: z.coerce.number().min(0, "Debe ser mayor a 0"),
    salePrice: z.coerce.number().min(0, "Debe ser mayor a 0"),
    minStockAlert: z.coerce.number().min(0),
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
        },
    });

    async function onSubmit(values: FormValues) {
        try {
            await addHardwareModel(values);
            toast.success("Modelo de Hardware registrado en catálogo");
            setOpen(false);
            form.reset();
        } catch (error: any) {
            toast.error(error.message || "Error al registrar");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
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

                        <Button type="submit" className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
                            Guardar Catálogo
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
