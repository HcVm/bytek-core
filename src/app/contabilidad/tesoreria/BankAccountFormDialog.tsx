"use client";

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
import { Plus } from "lucide-react";

const formSchema = z.object({
    bankName: z.string().min(1, "Nombre requerido"),
    accountNumber: z.string().min(1, "Número requerido"),
    accountType: z.enum(["corriente", "ahorros", "detraccion", "caja_chica"]),
    currency: z.enum(["PEN", "USD"]),
    initialBalance: z.number(),
    accountingAccountId: z.string().min(1, "Cuenta contable requerida"),
});

type FormValues = z.infer<typeof formSchema>;

export function BankAccountFormDialog({
    trigger
}: {
    trigger?: React.ReactNode
}) {
    const [open, setOpen] = useState(false);

    const accounts = useQuery(api.accounting.getMovementAccounts) || [];
    const createBankAccount = useMutation(api.treasury.createBankAccount);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bankName: "",
            accountNumber: "",
            accountType: "corriente",
            currency: "PEN",
            initialBalance: 0,
            accountingAccountId: "",
        },
    });

    async function onSubmit(values: FormValues) {
        try {
            await createBankAccount({
                ...values,
                accountingAccountId: values.accountingAccountId as Id<"accountingAccounts">
            });
            sileo.success({ title: "Cuenta bancaria registrada" });
            setOpen(false);
            form.reset();
        } catch (error: any) {
            sileo.error({ title: error.message || `Error al guardar` });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-amber-600 text-white hover:bg-amber-700 shadow-md h-10 px-4 rounded-xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Cuenta
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Añadir Cuenta Bancaria o Caja</DialogTitle>
                    <DialogDescription>
                        Registra una nueva cuenta para vincularla al flujo de efectivo (tesorería) y Libro Diario.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="bankName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Banco / Entidad (ej: BCP, Caja Piura)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Banco..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="accountNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número de Cuenta / CCI</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: 191-..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="accountType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="corriente">Cuenta Corriente</SelectItem>
                                                <SelectItem value="ahorros">Ahorros / Sueldo</SelectItem>
                                                <SelectItem value="detraccion">Cuenta de Detracciones</SelectItem>
                                                <SelectItem value="caja_chica">Caja Chica (Efectivo)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Moneda</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PEN">Soles (PEN)</SelectItem>
                                                <SelectItem value="USD">Dólares (USD)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="initialBalance"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Saldo Inicial</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="accountingAccountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vincular a Cuenta Contable (Ref)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Elige la cuenta contable (1041...)" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accounts.map(acc => (
                                                <SelectItem key={acc._id} value={acc._id}>{acc.code} - {acc.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                            Añadir Cuenta Bancaria
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
