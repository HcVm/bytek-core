import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internalCreateJournalEntry, getCurrentPeriod } from "./journal";

export const getInvoices = query({
    args: {},
    handler: async (ctx) => {
        const invoices = await ctx.db.query("invoices").order("desc").collect();
        return await Promise.all(
            invoices.map(async (invoice) => {
                const client = await ctx.db.get(invoice.clientId);
                return {
                    ...invoice,
                    clientName: client?.companyName || "Cliente Desconocido",
                };
            })
        );
    },
});

export const createInvoice = mutation({
    args: {
        clientId: v.id("clients"),
        projectId: v.optional(v.id("projects")),
        amount: v.number(),
        billingType: v.union(v.literal("recurring"), v.literal("one_time"), v.literal("milestone"), v.literal("time_materials")),
        status: v.union(v.literal("pending"), v.literal("paid"), v.literal("overdue")),
        dueDate: v.number(),
        paymentGatewayReference: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Crear Factura en CRM
        const invoiceId = await ctx.db.insert("invoices", args);

        // 2. Automatizar Cuenta por Cobrar (CxC)
        const issueDate = new Date();
        const dueDate = new Date(args.dueDate);
        const invoiceDateStr = issueDate.toISOString().split("T")[0];
        const dueDateStr = dueDate.toISOString().split("T")[0];

        const docNum = `F001-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;

        await ctx.db.insert("accountsReceivable", {
            clientId: args.clientId,
            invoiceId,
            documentType: "factura",
            documentNumber: docNum,
            issueDate: invoiceDateStr,
            dueDate: dueDateStr,
            originalAmount: args.amount,
            currency: "PEN",
            pendingAmount: args.amount,
            status: "pendiente"
        });

        // 3. Automatización Asiento en Libro Diario (Provisión)
        const period = await getCurrentPeriod(ctx);
        if (!period) throw new Error("No existe un período contable configurado para este mes.");
        if (period.status === "cerrado") throw new Error("El período contable actual está cerrado. No se pueden registrar ventas.");

        const sysAcc = await ctx.db.query("accountingAccounts").collect();
        const a1212 = sysAcc.find(a => a.code === "1212"); // CxC Terceros
        const a40111 = sysAcc.find(a => a.code === "40111"); // IGV Debito
        const a7041 = sysAcc.find(a => a.code === "7041"); // Ventas Servicios
        const firstAdmin = await ctx.db.query("users").filter(q => q.eq(q.field("role"), "admin")).first();

        if (a1212 && a40111 && a7041 && firstAdmin) {
            const baseAmount = Math.round((args.amount / 1.18) * 100) / 100;
            const igvAmount = Math.round((args.amount - baseAmount) * 100) / 100;

            await internalCreateJournalEntry(ctx, {
                date: invoiceDateStr,
                periodId: period._id,
                description: `Provisión de Venta (CRM) F.V. ${docNum}`,
                type: "operacion",
                createdBy: firstAdmin._id,
                sourceModule: "crm_invoices",
                sourceId: invoiceId,
                lines: [
                    {
                        accountId: a1212._id,
                        accountCode: a1212.code,
                        description: "Factura por Cobrar a Clientes",
                        debit: args.amount,
                        credit: 0
                    },
                    {
                        accountId: a40111._id,
                        accountCode: a40111.code,
                        description: "IGV Ventas",
                        debit: 0,
                        credit: igvAmount
                    },
                    {
                        accountId: a7041._id,
                        accountCode: a7041.code,
                        description: "Ingresos por Servicios",
                        debit: 0,
                        credit: baseAmount
                    }
                ]
            });
        }

        return invoiceId;
    },
});

export const updateInvoice = mutation({
    args: {
        id: v.id("invoices"),
        clientId: v.optional(v.id("clients")),
        projectId: v.optional(v.id("projects")),
        amount: v.optional(v.number()),
        billingType: v.optional(v.union(v.literal("recurring"), v.literal("one_time"), v.literal("milestone"), v.literal("time_materials"))),
        status: v.optional(v.union(v.literal("pending"), v.literal("paid"), v.literal("overdue"))),
        dueDate: v.optional(v.number()),
        paymentGatewayReference: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, val]) => val !== undefined)
        );

        const currentInvoice = await ctx.db.get(id);
        if (!currentInvoice) throw new Error("Factura no encontrada");

        await ctx.db.patch(id, filteredUpdates);

        // Si la factura ha cambiado a estado "pagado" (paid) desde el CRM.
        if (currentInvoice.status !== "paid" && updates.status === "paid") {
            const dateStr = new Date().toISOString().split("T")[0];

            // 1. Liquidar Cuentas por Cobrar
            const rec = await ctx.db.query("accountsReceivable")
                .filter(q => q.eq(q.field("invoiceId"), id))
                .first();

            if (rec) {
                await ctx.db.patch(rec._id, {
                    pendingAmount: 0,
                    status: "cobrado"
                });
            }

            // 2. Registrar abono en Cuenta Bancaria Principal
            const bankAccount = await ctx.db.query("bankAccounts").filter(q => q.eq(q.field("isActive"), true)).first();
            if (bankAccount) {
                await ctx.db.patch(bankAccount._id, {
                    currentBalance: Math.round((bankAccount.currentBalance + currentInvoice.amount) * 100) / 100
                });

                // Registrar transacción bancaria automática
                await ctx.db.insert("bankTransactions", {
                    bankAccountId: bankAccount._id,
                    date: dateStr,
                    type: "ingreso",
                    description: `Cobro automático desde CRM - Factura`,
                    amount: currentInvoice.amount,
                    reconciled: true,
                    createdAt: Date.now()
                });

                // Registrar ingreso/pago
                if (rec) {
                    await ctx.db.insert("payments", {
                        type: "cobro",
                        receivableId: rec._id,
                        bankAccountId: bankAccount._id,
                        amount: currentInvoice.amount,
                        paymentDate: dateStr,
                        paymentMethod: "transferencia", // Default assumption from CRM
                        createdAt: Date.now()
                    });
                }

                // 3. Asiento contable de Cobranza en el Libro Diario
                const period = await getCurrentPeriod(ctx);
                if (!period) throw new Error("No existe un período contable configurado para este mes.");
                if (period.status === "cerrado") throw new Error("El período contable actual está cerrado. No se pueden registrar cobranzas.");

                const sysAcc = await ctx.db.query("accountingAccounts").collect();
                const a1041 = sysAcc.find(a => a._id === bankAccount.accountingAccountId) || sysAcc.find(a => a.code === "1041");
                const a1212 = sysAcc.find(a => a.code === "1212");
                const firstAdmin = await ctx.db.query("users").filter(q => q.eq(q.field("role"), "admin")).first();

                if (a1041 && a1212 && firstAdmin) {
                    await internalCreateJournalEntry(ctx, {
                        date: dateStr,
                        periodId: period._id,
                        description: `Cobro Factura CRM - Ingreso a Banco`,
                        type: "operacion",
                        createdBy: firstAdmin._id,
                        sourceModule: "crm_payments",
                        sourceId: id,
                        lines: [
                            {
                                accountId: a1041._id,
                                accountCode: a1041.code,
                                description: `Ingreso en ${bankAccount.bankName}`,
                                debit: currentInvoice.amount,
                                credit: 0
                            },
                            {
                                accountId: a1212._id,
                                accountCode: a1212.code,
                                description: "Cancelación Factura CxC",
                                debit: 0,
                                credit: currentInvoice.amount
                            }
                        ]
                    });
                }
            }
        }
    },
});

export const deleteInvoice = mutation({
    args: { id: v.id("invoices") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
