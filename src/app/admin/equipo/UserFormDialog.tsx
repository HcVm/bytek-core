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
import { UserPlus, Building2 } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
    email: z.string().email("Correo electrónico inválido."),
    role: z.enum(["admin", "sales", "technician", "developer", "client"]),
    departmentId: z.string().optional(),
    position: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function UserFormDialog({
    trigger
}: {
    trigger?: React.ReactNode
}) {
    const [open, setOpen] = useState(false);
    const createUser = useMutation(api.users.createUser);
    const departments = useQuery(api.departments.getAllDepartments);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            role: "sales",
            departmentId: "none",
            position: "",
        },
    });

    async function onSubmit(values: FormValues) {
        try {
            const payload = {
                ...values,
                departmentId: values.departmentId === "none" ? undefined : (values.departmentId as any)
            };
            await createUser(payload as any);
            toast.success("Miembro de equipo creado con éxito");
            setOpen(false);
            form.reset();
        } catch (error: any) {
            toast.error(error.message || 'Error al crear el equipo');
            console.error(error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Nuevo Miembro
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Miembro de Equipo</DialogTitle>
                    <DialogDescription>
                        Añade un ejecutivo, ingeniero o técnico sin necesidad de Auth0 mediante esta mutación manual.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Juan Pérez" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo Corporativo</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="juan@bytek.pe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rol en Sistema</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un Rol..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="admin">Administrador General</SelectItem>
                                            <SelectItem value="sales">Ventas & Comercial (U1)</SelectItem>
                                            <SelectItem value="developer">Desarrollo Software (U2)</SelectItem>
                                            <SelectItem value="technician">Operario Infraestructura (U3)</SelectItem>
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
                                    <FormLabel>Departamento / Área Organizacional</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Asignar al Área..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">Sin Área / General</SelectItem>
                                            {departments?.map((dept: any) => (
                                                <SelectItem key={dept._id} value={dept._id}>{dept.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cargo Específico</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Analista de Redes, Consultor..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white">
                            Guardar Personal
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
