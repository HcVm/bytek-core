import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =============================================
// TESORERÍA: Cuentas Bancarias y Movimientos
// =============================================

export const getBankAccounts = query({
    handler: async (ctx) => {
        const accounts = await ctx.db.query("bankAccounts").collect();
        return await Promise.all(accounts.map(async (acc) => {
            const accounting = await ctx.db.get(acc.accountingAccountId);
            return {
                ...acc,
                accountingAccountCode: accounting?.code || "",
                accountingAccountName: accounting?.name || "",
            };
        }));
    }
});

export const createBankAccount = mutation({
    args: {
        bankName: v.string(),
        accountNumber: v.string(),
        accountType: v.union(v.literal("corriente"), v.literal("ahorros"), v.literal("detraccion"), v.literal("caja_chica")),
        currency: v.union(v.literal("PEN"), v.literal("USD")),
        initialBalance: v.number(),
        accountingAccountId: v.id("accountingAccounts"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("bankAccounts", {
            bankName: args.bankName,
            accountNumber: args.accountNumber,
            accountType: args.accountType,
            currency: args.currency,
            currentBalance: args.initialBalance,
            accountingAccountId: args.accountingAccountId,
            isActive: true,
        });
    }
});

export const updateBankAccountBalance = mutation({
    args: {
        bankAccountId: v.id("bankAccounts"),
        newBalance: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.bankAccountId, { currentBalance: args.newBalance });
    }
});

// =============================================
// MOVIMIENTOS BANCARIOS
// =============================================

export const getBankTransactions = query({
    args: {
        bankAccountId: v.optional(v.id("bankAccounts")),
        reconciledFilter: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        let transactions;
        if (args.bankAccountId) {
            transactions = await ctx.db.query("bankTransactions")
                .withIndex("by_account", q => q.eq("bankAccountId", args.bankAccountId!))
                .order("desc")
                .collect();
        } else {
            transactions = await ctx.db.query("bankTransactions").order("desc").collect();
        }

        if (args.reconciledFilter !== undefined) {
            transactions = transactions.filter(t => t.reconciled === args.reconciledFilter);
        }

        return await Promise.all(transactions.map(async (tx) => {
            const account = await ctx.db.get(tx.bankAccountId);
            return {
                ...tx,
                bankName: account?.bankName || "",
                accountNumber: account?.accountNumber || "",
            };
        }));
    }
});

export const recordBankTransaction = mutation({
    args: {
        bankAccountId: v.id("bankAccounts"),
        date: v.string(),
        type: v.union(v.literal("ingreso"), v.literal("egreso"), v.literal("transferencia")),
        description: v.string(),
        amount: v.number(),
        reference: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Actualizar saldo bancario
        const account = await ctx.db.get(args.bankAccountId);
        if (!account) throw new Error("Cuenta bancaria no encontrada.");

        let newBalance = account.currentBalance;
        if (args.type === "ingreso") {
            newBalance += args.amount;
        } else if (args.type === "egreso") {
            newBalance -= args.amount;
        }

        await ctx.db.patch(args.bankAccountId, { currentBalance: Math.round(newBalance * 100) / 100 });

        return await ctx.db.insert("bankTransactions", {
            bankAccountId: args.bankAccountId,
            date: args.date,
            type: args.type,
            description: args.description,
            amount: args.amount,
            reference: args.reference,
            reconciled: false,
            createdAt: Date.now(),
        });
    }
});

export const reconcileTransaction = mutation({
    args: {
        transactionId: v.id("bankTransactions"),
        journalEntryId: v.id("journalEntries"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.transactionId, {
            reconciled: true,
            journalEntryId: args.journalEntryId,
        });
    }
});

// =============================================
// CONCILIACIÓN BANCARIA
// =============================================

export const getBankReconciliation = query({
    args: { bankAccountId: v.id("bankAccounts") },
    handler: async (ctx, args) => {
        const account = await ctx.db.get(args.bankAccountId);
        if (!account) throw new Error("Cuenta bancaria no encontrada.");

        const allTransactions = await ctx.db.query("bankTransactions")
            .withIndex("by_account", q => q.eq("bankAccountId", args.bankAccountId))
            .collect();

        const reconciled = allTransactions.filter(t => t.reconciled);
        const pending = allTransactions.filter(t => !t.reconciled);

        const totalReconciled = reconciled.reduce((sum, t) => {
            return sum + (t.type === "ingreso" ? t.amount : -t.amount);
        }, 0);

        const totalPending = pending.reduce((sum, t) => {
            return sum + (t.type === "ingreso" ? t.amount : -t.amount);
        }, 0);

        return {
            bankAccount: {
                bankName: account.bankName,
                accountNumber: account.accountNumber,
                currentBalance: account.currentBalance,
                currency: account.currency,
            },
            reconciled: {
                count: reconciled.length,
                total: Math.round(totalReconciled * 100) / 100,
            },
            pending: {
                count: pending.length,
                total: Math.round(totalPending * 100) / 100,
                items: pending.sort((a, b) => b.createdAt - a.createdAt),
            },
        };
    }
});

// =============================================
// FLUJO DE CAJA
// =============================================

export const getCashFlow = query({
    args: {
        year: v.number(),
        month: v.number(),
    },
    handler: async (ctx, args) => {
        const monthStr = `${args.year}-${String(args.month).padStart(2, "0")}`;

        const allTransactions = await ctx.db.query("bankTransactions").collect();
        const monthTransactions = allTransactions.filter(t => t.date.startsWith(monthStr));

        const inflows = monthTransactions
            .filter(t => t.type === "ingreso")
            .reduce((sum, t) => sum + t.amount, 0);

        const outflows = monthTransactions
            .filter(t => t.type === "egreso")
            .reduce((sum, t) => sum + t.amount, 0);

        // Agrupar por día para gráfico
        const dailyFlow: Record<string, { inflows: number; outflows: number }> = {};
        monthTransactions.forEach(t => {
            if (!dailyFlow[t.date]) {
                dailyFlow[t.date] = { inflows: 0, outflows: 0 };
            }
            if (t.type === "ingreso") {
                dailyFlow[t.date].inflows += t.amount;
            } else if (t.type === "egreso") {
                dailyFlow[t.date].outflows += t.amount;
            }
        });

        return {
            period: monthStr,
            totalInflows: Math.round(inflows * 100) / 100,
            totalOutflows: Math.round(outflows * 100) / 100,
            netCashFlow: Math.round((inflows - outflows) * 100) / 100,
            dailyBreakdown: Object.entries(dailyFlow)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, flow]) => ({ date, ...flow })),
            transactionCount: monthTransactions.length,
        };
    }
});
