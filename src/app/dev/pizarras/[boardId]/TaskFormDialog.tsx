"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { sileo } from "sileo";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

const formSchema = z.object({
    title: z.string().min(3, "El título es obligatorio."),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    type: z.enum(["feature", "bug", "task", "epic"]),
    storyPoints: z.string().optional(),
    assigneeId: z.string().min(1, "Debe seleccionar un responsable"),
});

type FormValues = z.infer<typeof formSchema>;

export function TaskFormDialog({ boardId, boardMembers }: { boardId: Id<"boards">, boardMembers: any[] }) {
    const [open, setOpen] = useState(false);
    const createTask = useMutation(api.agile.createTask);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { title: "", description: "", priority: "medium", type: "task", assigneeId: "", storyPoints: "" },
    });

    async function onSubmit(values: FormValues) {
        try {
            await createTask({
                boardId,
                title: values.title,
                description: values.description,
                priority: values.priority as any,
                type: values.type as any,
                storyPoints: values.storyPoints ? parseInt(values.storyPoints) : undefined,
                status: "todo",
                assigneeId: values.assigneeId as Id<"users">,
            });
            sileo.success({ title: "Tarea registrada correctamente." });
            setOpen(false);
            form.reset();
        } catch (error: any) {
            sileo.error({ title: "Error al crear la tarea" });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Añadir Tarea
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nueva Incidencia / Tarea</DialogTitle>
                    <DialogDescription>
                        Crea un ticket de trabajo en el Backlog.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título Corto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Bug: Checkout crashea en mobile" {...field} />
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
                                    <FormLabel>Criterios de Aceptación / Contexto</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Al presionar Pagar, la app se cierra..." {...field} />
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
                                    <FormItem>
                                        <FormLabel>Prioridad</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Baja</SelectItem>
                                                <SelectItem value="medium">Media</SelectItem>
                                                <SelectItem value="high">Alta</SelectItem>
                                                <SelectItem value="urgent">Crítica (Blocker)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Tarea</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="feature">Historia (Feature)</SelectItem>
                                                <SelectItem value="bug">Error (Bug)</SelectItem>
                                                <SelectItem value="task">Tarea Técnica</SelectItem>
                                                <SelectItem value="epic">Épica</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="storyPoints"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Story Points</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Ej. 3, 5, 8" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="assigneeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asignar a</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Developers..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {boardMembers.map(user => (
                                                    <SelectItem key={user._id} value={user._id}>{user.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                            Agregar a Pizarra
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
