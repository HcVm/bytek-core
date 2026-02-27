import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
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
import { Network } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
    name: z.string().min(2, "El nombre del departamento es muy corto."),
    description: z.string().optional(),
    managerId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function DepartmentFormDialog({ trigger }: { trigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const createDepartment = useMutation(api.departments.createDepartment);
    const users = useQuery(api.users.getAllUsers);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            managerId: "none",
        },
    });

    async function onSubmit(values: FormValues) {
        try {
            const payload = {
                name: values.name,
                description: values.description,
                managerId: values.managerId === "none" ? undefined : (values.managerId as any)
            };
            await createDepartment(payload);
            sileo.success({ title: "Departamento creado con éxito" });
            setOpen(false);
            form.reset();
        } catch (error: any) {
            sileo.error({ title: error.message || 'Error al crear departamento' });
            console.error(error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                        <Network className="w-4 h-4 mr-2" />
                        Nueva Área
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Departamento</DialogTitle>
                    <DialogDescription>
                        Añade una nueva área corporativa a tu organigrama central.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Área</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Gerencia General, Soporte TI..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Responsable de..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="managerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Responsable / Jefe (Opcional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="dark:bg-zinc-950 dark:border-zinc-800">
                                                <SelectValue placeholder="Selecciona un líder..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">Sin asignación temprana</SelectItem>
                                            {users?.map(u => (
                                                <SelectItem key={u._id} value={u._id}>{u.name} - {u.email}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                            Registrar Departamento
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
