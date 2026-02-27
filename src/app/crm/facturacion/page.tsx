"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { DollarSign, Clock, AlertCircle, Pencil } from "lucide-react";
import { InvoiceFormDialog } from "./InvoiceFormDialog";

export default function FacturacionPage() {
    const invoices = useQuery(api.invoices.getInvoices) || [];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 whitespace-nowrap"><Clock className="w-3 h-3 mr-1" /> Pendiente</Badge>;
            case 'paid': return <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 whitespace-nowrap"><DollarSign className="w-3 h-3 mr-1" /> Pagado</Badge>;
            case 'overdue': return <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 whitespace-nowrap"><AlertCircle className="w-3 h-3 mr-1" /> Vencido</Badge>;
            default: return <Badge variant="secondary">Desconocido</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'one_time': return <span className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Único</span>;
            case 'recurring': return <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center gap-1">Recurrente</span>;
            case 'milestone': return <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">Hito Proyecto</span>;
            default: return <span>{type}</span>;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
    };

    const formatDate = (ms: number) => {
        return new Date(ms).toLocaleDateString('es-PE');
    };

    // Resumen financiero básico
    const totalPending = invoices.filter(i => i.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="p-8 h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Control Financiero</h1>
                    <p className="text-zinc-500 mt-2">Gestiona las cuentas por cobrar, facturación y suscripciones.</p>
                </div>
                <InvoiceFormDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                            Ingresos Cobrados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(totalPaid)}</div>
                    </CardContent>
                </Card>

                <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
                            Pendiente por Cobrar
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">{formatCurrency(totalPending)}</div>
                    </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                            Facturas Vencidas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-700 dark:text-red-400">{formatCurrency(totalOverdue)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="flex-1 overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 flex flex-col">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                            <TableRow className="border-zinc-200 dark:border-zinc-800">
                                <TableHead className="w-[100px] dark:text-zinc-300">Estado</TableHead>
                                <TableHead className="dark:text-zinc-300">Cliente</TableHead>
                                <TableHead className="dark:text-zinc-300">Monto Neto</TableHead>
                                <TableHead className="dark:text-zinc-300">Tipo de Cobro</TableHead>
                                <TableHead className="dark:text-zinc-300">Vencimiento</TableHead>
                                <TableHead className="dark:text-zinc-300">Referencia</TableHead>
                                <TableHead className="text-right dark:text-zinc-300">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                                        No hay facturas registradas. Genera una nueva cuenta de cobro.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoices.map((invoice) => (
                                    <TableRow key={invoice._id} className="border-zinc-200 dark:border-zinc-800">
                                        <TableCell>{getStatusBadge(invoice.status as string)}</TableCell>
                                        <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">{invoice.clientName}</TableCell>
                                        <TableCell className="font-bold text-zinc-900 dark:text-white">{formatCurrency(invoice.amount)}</TableCell>
                                        <TableCell>{getTypeBadge(invoice.billingType)}</TableCell>
                                        <TableCell>
                                            <span className={invoice.status === 'overdue' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-zinc-600 dark:text-zinc-400'}>
                                                {formatDate(invoice.dueDate)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                                {invoice.paymentGatewayReference || 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <InvoiceFormDialog
                                                initialData={invoice as any}
                                                trigger={
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
