import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =============================================
// CUENTAS POR COBRAR (Accounts Receivable)
// =============================================

export const getReceivables = query({
    args: {
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let receivables = await ctx.db.query("accountsReceivable").order("desc").collect();

        if (args.status) {
            receivables = receivables.filter(r => r.status === args.status);
        }

        return await Promise.all(receivables.map(async (r) => {
            const client = await ctx.db.get(r.clientId);
            return {
                ...r,
                clientName: client?.companyName || "Desconocido",
            };
        }));
    }
});

export const createReceivable = mutation({
    args: {
        clientId: v.id("clients"),
        invoiceId: v.optional(v.id("invoices")),
        documentType: v.union(v.literal("factura"), v.literal("boleta"), v.literal("nota_debito"), v.literal("otro")),
        documentNumber: v.string(),
        issueDate: v.string(),
        dueDate: v.string(),
        originalAmount: v.number(),
        currency: v.union(v.literal("PEN"), v.literal("USD")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("accountsReceivable", {
            ...args,
            pendingAmount: args.originalAmount,
            status: "pendiente",
        });
    }
});

export const recordPaymentReceived = mutation({
    args: {
        receivableId: v.id("accountsReceivable"),
        amount: v.number(),
        bankAccountId: v.id("bankAccounts"),
        paymentDate: v.string(),
        paymentMethod: v.union(v.literal("transferencia"), v.literal("cheque"), v.literal("efectivo"), v.literal("yape_plin"), v.literal("tarjeta")),
        reference: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const receivable = await ctx.db.get(args.receivableId);
        if (!receivable) throw new Error("Cuenta por cobrar no encontrada.");

        if (args.amount > receivable.pendingAmount) {
            throw new Error(`El monto (${args.amount}) excede el saldo pendiente (${receivable.pendingAmount}).`);
        }

        const newPending = Math.round((receivable.pendingAmount - args.amount) * 100) / 100;
        const newStatus = newPending <= 0 ? "cobrado" : "parcial";

        await ctx.db.patch(args.receivableId, {
            pendingAmount: newPending,
            status: newStatus as any,
        });

        // Actualizar saldo bancario
        const bankAccount = await ctx.db.get(args.bankAccountId);
        if (bankAccount) {
            await ctx.db.patch(args.bankAccountId, {
                currentBalance: Math.round((bankAccount.currentBalance + args.amount) * 100) / 100,
            });
        }

        // Registrar el pago
        const paymentId = await ctx.db.insert("payments", {
            type: "cobro",
            receivableId: args.receivableId,
            bankAccountId: args.bankAccountId,
            amount: args.amount,
            paymentDate: args.paymentDate,
            paymentMethod: args.paymentMethod,
            reference: args.reference,
            createdAt: Date.now(),
        });

        // Registrar transacción bancaria
        await ctx.db.insert("bankTransactions", {
            bankAccountId: args.bankAccountId,
            date: args.paymentDate,
            type: "ingreso",
            description: `Cobro CxC ${receivable.documentNumber}`,
            amount: args.amount,
            reference: args.reference,
            reconciled: true,
            createdAt: Date.now(),
        });

        return paymentId;
    }
});

// =============================================
// REPORTE DE ANTIGÜEDAD DE SALDOS (Aging)
// =============================================

export const getAgingReport = query({
    handler: async (ctx) => {
        const receivables = await ctx.db.query("accountsReceivable")
            .filter(q => q.neq(q.field("status"), "cobrado"))
            .collect();

        const today = new Date().toISOString().split("T")[0];
        const todayMs = new Date(today).getTime();

        const aging = {
            current: [] as any[],     // No vencido
            days30: [] as any[],      // 1-30 días
            days60: [] as any[],      // 31-60 días
            days90: [] as any[],      // 61-90 días
            over90: [] as any[],      // +90 días
        };

        for (const r of receivables) {
            const client = await ctx.db.get(r.clientId);
            const dueMs = new Date(r.dueDate).getTime();
            const daysPast = Math.floor((todayMs - dueMs) / (1000 * 60 * 60 * 24));

            const item = {
                ...r,
                clientName: client?.companyName || "Desconocido",
                daysPastDue: Math.max(0, daysPast),
            };

            if (daysPast <= 0) aging.current.push(item);
            else if (daysPast <= 30) aging.days30.push(item);
            else if (daysPast <= 60) aging.days60.push(item);
            else if (daysPast <= 90) aging.days90.push(item);
            else aging.over90.push(item);
        }

        const sumPending = (items: any[]) => items.reduce((s, i) => s + i.pendingAmount, 0);

        return {
            current: { items: aging.current, total: Math.round(sumPending(aging.current) * 100) / 100 },
            days30: { items: aging.days30, total: Math.round(sumPending(aging.days30) * 100) / 100 },
            days60: { items: aging.days60, total: Math.round(sumPending(aging.days60) * 100) / 100 },
            days90: { items: aging.days90, total: Math.round(sumPending(aging.days90) * 100) / 100 },
            over90: { items: aging.over90, total: Math.round(sumPending(aging.over90) * 100) / 100 },
            grandTotal: Math.round(sumPending(receivables) * 100) / 100,
        };
    }
});
