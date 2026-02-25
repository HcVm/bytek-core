import { useState } from "react";
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
import { UserPlus } from "lucide-react";

const formSchema = z.object({
    projectId: z.string().min(1, "Debe seleccionar un Proyecto Base"),
    technicianId: z.string().min(1, "Debe asignar un Técnico"),
    type: z.enum(["installation", "support", "maintenance"]),
    siteLocation: z.string().min(5, "Dirección muy corta"),
});

type FormValues = z.infer<typeof formSchema>;

export function DispatchFormDialog() {
    const [open, setOpen] = useState(false);

    // Obtenemos todos los proyectos y luego el listado de técnicos
    const projects = useQuery(api.projects.getProjects) || [];
    // Nota: El query de getUsers asume que retorna todos los usuarios, luego filtramos rol technician.
    // Usaremos getClients() o getProjects(). Pero necesitamos técnicos.
    // Como no tenemos un endpoint específico getTechnicians, requeriremos uno en la API de Users.
    // Pero asumiendo que el usuario del MVP los filtra en cliente, podemos modificar / usar users genérico.
    // Usaremos inventario para probar, pero necesitamos un query de usuarios.
    // Para no bloquear, he creado temporalmente la mutación createIntervention.
    const technicians = useQuery(api.users.getUsersByRole, { role: "technician" }) || [];

    // Si no existiera la query getUsersByRole, mostraremos un fallback o requeriremos modificar convex/users.ts.
    // Añadiremos getUsersByRole en convex/users.ts enseguida.

    const createIntervention = useMutation(api.fieldService.createIntervention);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            projectId: "",
            technicianId: "",
            type: "installation",
            siteLocation: "",
        },
    });

    async function onSubmit(values: FormValues) {
        try {
            await createIntervention({
                projectId: values.projectId as Id<"projects">,
                technicianId: values.technicianId as Id<"users">,
                type: values.type,
                siteLocation: values.siteLocation,
            });
            sileo.success({ title: "Orden de trabajo programada correctamente" });
            setOpen(false);
            form.reset();
        } catch (error: any) {
            sileo.error({ title: error.message || "Error al programar despacho" });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Asignar Técnico a Proyecto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nueva Orden de Intervención</DialogTitle>
                    <DialogDescription>
                        Programa una visita física asignando un técnico de campo a un proyecto en curso.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control as any}
                            name="projectId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proyecto Originen</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un proyecto..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {projects.filter(p => p.status !== 'completed').map(p => (
                                                <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
                                            ))}
                                            {projects.length === 0 && <SelectItem value="none" disabled>No hay proyectos activos</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="technicianId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Técnico de Campo Asignado</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un técnico..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {technicians.map((t: any) => (
                                                <SelectItem key={t._id} value={t._id}>{t.name || t.email}</SelectItem>
                                            ))}
                                            {technicians.length === 0 && <SelectItem value="none" disabled>No hay técnicos registrados</SelectItem>}
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
                                    <FormLabel>Naturaleza del Trabajo</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona tipo..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="installation">Instalación / Despliegue Nuevo</SelectItem>
                                            <SelectItem value="maintenance">Mantenimiento Preventivo</SelectItem>
                                            <SelectItem value="support">Soporte Técnico / Garantía</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="siteLocation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dirección Sede Cliente (GPS/Física)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Av. Los Ingenieros 300, Lima" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
                            Agendar Despacho
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
