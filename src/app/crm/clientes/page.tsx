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
            case "active": return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">Activo</Badge>;
            case "prospect": return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Prospecto</Badge>;
            case "churned": return <Badge className="bg-zinc-100 text-zinc-500 hover:bg-zinc-200">Perdido</Badge>;
            default: return null;
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Directorio de Clientes</h1>
                    <p className="text-zinc-500 mt-2">Gestiona el padrón de clientes, empresas y contactos.</p>
                </div>
                <ClientFormDialog />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                            <TableHead>Razón Social</TableHead>
                            <TableHead>RUC / DNI</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead className="text-right">Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
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
                                    <TableRow key={client._id}>
                                        <TableCell className="font-medium">{client.companyName}</TableCell>
                                        <TableCell className="text-zinc-500">{client.taxId}</TableCell>
                                        <TableCell>{client.contactName}</TableCell>
                                        <TableCell>{client.phone}</TableCell>
                                        <TableCell className="text-right">
                                            {getStatusBadge(client.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <ClientFormDialog
                                                    initialData={client as any}
                                                    trigger={
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50">
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                    }
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
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
