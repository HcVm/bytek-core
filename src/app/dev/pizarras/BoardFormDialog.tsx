"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle } from "lucide-react";

// For member selection, ideally we'd use a multiselect component.
// For the MVP, we'll keep it simple: the creator picks the name, description, 
// and we'll just assign all users from "Desarrollo" as members in the backend to save time, 
// OR simpler: just let them select one Lead Developer, and we skip multi-select complex UI for now.

const formSchema = z.object({
    title: z.string().min(3, "El título es obligatorio."),
    description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function BoardFormDialog({ currentUserId }: { currentUserId: Id<"users"> }) {
    const [open, setOpen] = useState(false);
    const createBoard = useMutation(api.agile.createBoard);

    // Grab all users to easily add them to the board for the MVP demo (everyone is in)
    const allUsers = useQuery(api.users.getAllUsers);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { title: "", description: "" },
    });

    async function onSubmit(values: FormValues) {
        try {
            // MVP: Añadir a todos los usuarios disponibles al board para que cualquiera lo vea
            const memberIds = allUsers?.map(u => u._id) || [currentUserId];

            await createBoard({
                ...values,
                ownerId: currentUserId,
                memberIds,
            });

            toast.success("Pizarra Kanban creada.");
            setOpen(false);
            form.reset();
        } catch (error: any) {
            toast.error("Error al crear la pizarra");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Nueva Pizarra Scrum
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Inicializar Proyecto Ágil</DialogTitle>
                    <DialogDescription>
                        Crea un tablero colaborativo para trazar las incidencias y desarrollo del software.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Proyecto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. E-Commerce B2B V2.0" {...field} />
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
                                    <FormLabel>Objetivo del Sprint / Proyecto</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Breve resumen del enfoque..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                            Lanzar Pizarra
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
