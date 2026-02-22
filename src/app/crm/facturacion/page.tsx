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
            case 'pending': return <Badge variant="secondary" className="bg-amber-100 text-amber-700 whitespace-nowrap"><Clock className="w-3 h-3 mr-1" /> Pendiente</Badge>;
            case 'paid': return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 whitespace-nowrap"><DollarSign className="w-3 h-3 mr-1" /> Pagado</Badge>;
            case 'overdue': return <Badge variant="secondary" className="bg-red-100 text-red-700 whitespace-nowrap"><AlertCircle className="w-3 h-3 mr-1" /> Vencido</Badge>;
            default: return <Badge variant="secondary">Desconocido</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'one_time': return <span className="text-zinc-600 text-sm font-medium">Único</span>;
            case 'recurring': return <span className="text-indigo-600 text-sm font-medium flex items-center gap-1">Recurrente</span>;
            case 'milestone': return <span className="text-purple-600 text-sm font-medium">Hito Proyecto</span>;
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
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Control Financiero</h1>
                    <p className="text-zinc-500 mt-2">Gestiona las cuentas por cobrar, facturación y suscripciones.</p>
                </div>
                <InvoiceFormDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-emerald-200 bg-emerald-50/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                            Ingresos Cobrados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-700">{formatCurrency(totalPaid)}</div>
                    </CardContent>
                </Card>

                <Card className="border-amber-200 bg-amber-50/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
                            Pendiente por Cobrar
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-700">{formatCurrency(totalPending)}</div>
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                            Facturas Vencidas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-700">{formatCurrency(totalOverdue)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-zinc-50">
                            <TableRow>
                                <TableHead className="w-[100px]">Estado</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Monto Neto</TableHead>
                                <TableHead>Tipo de Cobro</TableHead>
                                <TableHead>Vencimiento</TableHead>
                                <TableHead>Referencia</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
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
                                    <TableRow key={invoice._id}>
                                        <TableCell>{getStatusBadge(invoice.status as string)}</TableCell>
                                        <TableCell className="font-medium">{invoice.clientName}</TableCell>
                                        <TableCell className="font-bold text-zinc-900">{formatCurrency(invoice.amount)}</TableCell>
                                        <TableCell>{getTypeBadge(invoice.billingType)}</TableCell>
                                        <TableCell>
                                            <span className={invoice.status === 'overdue' ? 'text-red-600 font-medium' : 'text-zinc-600'}>
                                                {formatDate(invoice.dueDate)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-mono bg-zinc-100 px-2 py-1 rounded text-zinc-500">
                                                {invoice.paymentGatewayReference || 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <InvoiceFormDialog
                                                initialData={invoice as any}
                                                trigger={
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50">
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
