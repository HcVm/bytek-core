import { useState } from "react";
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
import { ScanBarcode } from "lucide-react";

const formSchema = z.object({
    serial: z.string().min(3, "El número de serie es inválido"),
});

type FormValues = z.infer<typeof formSchema>;

export function SerialEntryDialog({ hardwareId, equipmentName }: { hardwareId: Id<"hardwareItems">, equipmentName: string }) {
    const [open, setOpen] = useState(false);
    const registerSerialNumber = useMutation(api.inventory.registerSerialNumber);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: { serial: "" },
    });

    async function onSubmit(values: FormValues) {
        try {
            await registerSerialNumber({ hardwareId, serial: values.serial });
            toast.success("Número de serie ingresado y listo para despacho.");
            form.reset(); // Listo para escanear el siguiente automáticamente
            // Opcional: enfocar de nuevo el input
            document.getElementById("serialInput")?.focus();
        } catch (error: any) {
            toast.error(error.message || "Error al registrar serie");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800">
                    <ScanBarcode className="w-3 h-3 mr-1" />
                    Ingresar Stock
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Recepción de: {equipmentName}</DialogTitle>
                    <DialogDescription>
                        Conecta tu lectora de código de barras o ingresa manualmente el S/N único del dispositivo.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control as any}
                            name="serial"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número de Serie Física</FormLabel>
                                    <FormControl>
                                        <Input id="serialInput" placeholder="S/N: 12345ABCDEF" {...field} autoFocus />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
                            Registrar Ingreso
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
