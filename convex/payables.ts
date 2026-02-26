import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =============================================
// CUENTAS POR PAGAR (Accounts Payable)
// =============================================

export const getPayables = query({
    args: {
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let payables = await ctx.db.query("accountsPayable").order("desc").collect();

        if (args.status) {
            payables = payables.filter(p => p.status === args.status);
        }

        return payables;
    }
});

export const createPayable = mutation({
    args: {
        providerName: v.string(),
        documentType: v.union(v.literal("factura"), v.literal("recibo"), v.literal("nota_credito"), v.literal("otro")),
        documentNumber: v.string(),
        issueDate: v.string(),
        dueDate: v.string(),
        originalAmount: v.number(),
        currency: v.union(v.literal("PEN"), v.literal("USD")),
        category: v.string(),
        expenseId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("accountsPayable", {
            ...args,
            pendingAmount: args.originalAmount,
            status: "pendiente",
        });
    }
});

export const recordPaymentMade = mutation({
    args: {
        payableId: v.id("accountsPayable"),
        amount: v.number(),
        bankAccountId: v.id("bankAccounts"),
        paymentDate: v.string(),
        paymentMethod: v.union(v.literal("transferencia"), v.literal("cheque"), v.literal("efectivo"), v.literal("yape_plin"), v.literal("tarjeta")),
        reference: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const payable = await ctx.db.get(args.payableId);
        if (!payable) throw new Error("Cuenta por pagar no encontrada.");

        if (args.amount > payable.pendingAmount) {
            throw new Error(`El monto (${args.amount}) excede el saldo pendiente (${payable.pendingAmount}).`);
        }

        const newPending = Math.round((payable.pendingAmount - args.amount) * 100) / 100;
        const newStatus = newPending <= 0 ? "pagado" : "parcial";

        await ctx.db.patch(args.payableId, {
            pendingAmount: newPending,
            status: newStatus as any,
        });

        // Actualizar saldo bancario
        const bankAccount = await ctx.db.get(args.bankAccountId);
        if (bankAccount) {
            await ctx.db.patch(args.bankAccountId, {
                currentBalance: Math.round((bankAccount.currentBalance - args.amount) * 100) / 100,
            });
        }

        // Registrar el pago
        const paymentId = await ctx.db.insert("payments", {
            type: "pago",
            payableId: args.payableId,
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
            type: "egreso",
            description: `Pago CxP ${payable.documentNumber} - ${payable.providerName}`,
            amount: args.amount,
            reference: args.reference,
            reconciled: true,
            createdAt: Date.now(),
        });

        return paymentId;
    }
});

// =============================================
// REPORTE DE ANTIGÜEDAD — CUENTAS POR PAGAR
// =============================================

export const getPayablesAging = query({
    handler: async (ctx) => {
        const payables = await ctx.db.query("accountsPayable")
            .filter(q => q.neq(q.field("status"), "pagado"))
            .collect();

        const today = new Date().toISOString().split("T")[0];
        const todayMs = new Date(today).getTime();

        const aging = {
            current: [] as any[],
            days30: [] as any[],
            days60: [] as any[],
            days90: [] as any[],
            over90: [] as any[],
        };

        for (const p of payables) {
            const dueMs = new Date(p.dueDate).getTime();
            const daysPast = Math.floor((todayMs - dueMs) / (1000 * 60 * 60 * 24));

            const item = { ...p, daysPastDue: Math.max(0, daysPast) };

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
            grandTotal: Math.round(sumPending(payables) * 100) / 100,
        };
    }
});
