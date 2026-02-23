"use client";

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
import { Textarea } from "@/components/ui/textarea";
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
import { PlusCircle } from "lucide-react";

const formSchema = z.object({
    title: z.string().min(5, "El asunto debe ser claro (Mínimo 5 caracteres)."),
    description: z.string().min(10, "Aporta más detalles del requerimiento."),
    toDepartmentId: z.string().min(5, "Debes seleccionar un área destino."),
    priority: z.enum(["low", "medium", "high", "urgent"]),
});

type FormValues = z.infer<typeof formSchema>;

export function RequestFormDialog({ trigger }: { trigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    const departments = useQuery(api.departments.getAllDepartments);
    const users = useQuery(api.users.getAllUsers);
    const createRequest = useMutation(api.internalRequests.createRequest);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            toDepartmentId: "",
            priority: "medium",
        },
    });

    async function onSubmit(values: FormValues) {
        try {
            // Emulando envío por el primer usuario (MVP Auth bypass)
            const senderId = users?.[0]?._id;

            if (!senderId) throw new Error("No hay personal registrado para enviar el ticket.");

            await createRequest({
                ...values,
                toDepartmentId: values.toDepartmentId as any,
                fromUserId: senderId,
            });

            toast.success("Solicitud enviada al área seleccionada.");
            setOpen(false);
            form.reset();
        } catch (error: any) {
            toast.error(error.message || 'Error al emitir el requerimiento');
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Nuevo Requerimiento
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Crear Solicitud / Ticket Interno</DialogTitle>
                    <DialogDescription>
                        Abre un caso formal hacia otro departamento para cruce de tareas o requerimientos logísticos.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="toDepartmentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Área Destino</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="¿Hacia dónde va esta solicitud?" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {departments?.map(dept => (
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
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Asunto del Requerimiento</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Solicitud de nueva Licencia Office365" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Nivel de Prioridad</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Rango de importancia" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Baja (Mantenimiento Rutina)</SelectItem>
                                                <SelectItem value="medium">Media (Estándar)</SelectItem>
                                                <SelectItem value="high">Alta (Urgente para Producción)</SelectItem>
                                                <SelectItem value="urgent">Crítica / Urgente (Bloqueante)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cuerpo de la Solicitud</FormLabel>
                                    <FormControl>
                                        <Textarea className="min-h-[100px]" placeholder="Detalla aquí los requerimientos exactos de manera profesional..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white mt-4">
                            Levantar Ticket
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
