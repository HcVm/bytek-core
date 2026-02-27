"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Pencil, Trash2, UsersRound } from "lucide-react";
import { sileo } from "sileo";
import { Badge } from "@/components/ui/badge";
import { ClientFormDialog } from "./ClientFormDialog";

export default function ClientesPage() {
    const clients = useQuery(api.clients.getClients);
    const deleteClient = useMutation(api.clients.deleteClient);

    const handleDelete = async (id: Id<"clients">) => {
        sileo.error({
            title: "¿Eliminar este cliente?",
            description: "Esto podría afectar sus oportunidades y facturas relacionadas.",
            button: {
                title: "Confirmar Eliminación",
                onClick: async () => {
                    try {
                        await deleteClient({ id });
                        sileo.success({ title: "Cliente eliminado exitosamente" });
                    } catch (error: any) {
                        sileo.error({ title: "Error al eliminar el cliente" });
                    }
                },
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active": return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20">Activo</Badge>;
            case "prospect": return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20">Prospecto</Badge>;
            case "churned": return <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200">Perdido</Badge>;
            default: return null;
        }
    };

    return (
        <div className="p-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Directorio de Clientes</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">Gestiona el padrón de clientes, empresas y contactos.</p>
                </div>
                <ClientFormDialog />
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                            <TableHead className="dark:text-zinc-300">Razón Social</TableHead>
                            <TableHead className="dark:text-zinc-300">RUC / DNI</TableHead>
                            <TableHead className="dark:text-zinc-300">Contacto</TableHead>
                            <TableHead className="dark:text-zinc-300">Teléfono</TableHead>
                            <TableHead className="text-right dark:text-zinc-300">Estado</TableHead>
                            <TableHead className="text-right dark:text-zinc-300">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients === undefined ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">Cargando directorio...</TableCell>
                            </TableRow>
                        ) : clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <UsersRound className="w-8 h-8 text-zinc-300" />
                                        <p>No hay clientes registrados.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients.map((client) => {
                                return (
                                    <TableRow key={client._id} className="border-zinc-200 dark:border-zinc-800">
                                        <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">{client.companyName}</TableCell>
                                        <TableCell className="text-zinc-500 dark:text-zinc-400">{client.taxId}</TableCell>
                                        <TableCell className="dark:text-zinc-300">{client.contactName}</TableCell>
                                        <TableCell className="dark:text-zinc-300">{client.phone}</TableCell>
                                        <TableCell className="text-right">
                                            {getStatusBadge(client.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <ClientFormDialog
                                                    initialData={client as any}
                                                    trigger={
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                    }
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                    onClick={() => handleDelete(client._id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
