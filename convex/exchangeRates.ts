import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =============================================
// TASAS DE CAMBIO — Multi-Moneda
// =============================================

export const getExchangeRates = query({
    args: {
        fromCurrency: v.optional(v.union(v.literal("PEN"), v.literal("USD"))),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let rates = await ctx.db.query("exchangeRates").order("desc").collect();

        if (args.fromCurrency) {
            rates = rates.filter(r => r.fromCurrency === args.fromCurrency);
        }

        return rates.slice(0, args.limit || 50);
    }
});

export const getLatestRate = query({
    args: {
        fromCurrency: v.union(v.literal("PEN"), v.literal("USD")),
        toCurrency: v.union(v.literal("PEN"), v.literal("USD")),
    },
    handler: async (ctx, args) => {
        const rates = await ctx.db.query("exchangeRates")
            .withIndex("by_currencies", q =>
                q.eq("fromCurrency", args.fromCurrency).eq("toCurrency", args.toCurrency)
            )
            .order("desc")
            .first();

        return rates;
    }
});

export const createExchangeRate = mutation({
    args: {
        fromCurrency: v.union(v.literal("PEN"), v.literal("USD")),
        toCurrency: v.union(v.literal("PEN"), v.literal("USD")),
        buyRate: v.number(),
        sellRate: v.number(),
        date: v.string(),
        source: v.union(v.literal("manual"), v.literal("sunat"), v.literal("sbs")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("exchangeRates", {
            ...args,
            createdAt: Date.now(),
        });
    }
});

// =============================================
// REVALUACIÓN DE POSICIONES MONETARIAS
// =============================================

export const revalueMonetaryPositions = mutation({
    args: {
        periodId: v.id("accountingPeriods"),
        newRate: v.number(), // Tipo de cambio del cierre
        createdBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Obtener cuentas bancarias en USD
        const usdAccounts = await ctx.db.query("bankAccounts")
            .filter(q => q.eq(q.field("currency"), "USD"))
            .collect();

        if (usdAccounts.length === 0) return { adjustmentMade: false, message: "No hay cuentas en USD." };

        let totalDifference = 0;

        for (const account of usdAccounts) {
            // Saldo USD * nuevo tipo de cambio - saldo contable en PEN
            // Simplificación: asumimos que el saldo contable se registra al TC del momento
            const newPENValue = account.currentBalance * args.newRate;
            // La diferencia de cambio se acumula
            totalDifference += newPENValue - (account.currentBalance * args.newRate);
        }

        // Si la diferencia es 0 o insignificante, no hacer nada
        if (Math.abs(totalDifference) < 0.01) {
            return { adjustmentMade: false, message: "Sin diferencias significativas." };
        }

        // Obtener el periodo
        const period = await ctx.db.get(args.periodId);
        if (!period) throw new Error("Periodo contable no encontrado.");

        // Generar número de asiento
        const existingEntries = await ctx.db.query("journalEntries")
            .withIndex("by_period", q => q.eq("periodId", args.periodId))
            .collect();

        const entryNumber = `ASIENTO-${period.year}-${String(existingEntries.length + 1).padStart(6, "0")}`;
        const today = new Date().toISOString().split("T")[0];

        // Buscar cuentas contables
        const allAccounts = await ctx.db.query("accountingAccounts").collect();
        const cuenta676 = allAccounts.find(a => a.code === "676"); // Dif. cambio gasto
        const cuenta776 = allAccounts.find(a => a.code === "776"); // Dif. cambio ingreso

        if (!cuenta676 || !cuenta776) {
            return { adjustmentMade: false, message: "Cuentas 676/776 no encontradas en el plan contable." };
        }

        const absAmount = Math.abs(totalDifference);
        const isLoss = totalDifference < 0;

        // Crear asiento de ajuste
        const entryId = await ctx.db.insert("journalEntries", {
            entryNumber,
            date: today,
            periodId: args.periodId,
            description: `Ajuste por diferencia de cambio — TC: ${args.newRate}`,
            type: "ajuste",
            status: "contabilizado",
            sourceModule: "exchangeRates",
            createdBy: args.createdBy,
            totalDebit: absAmount,
            totalCredit: absAmount,
            createdAt: Date.now(),
        });

        // Líneas del asiento
        if (isLoss) {
            // Pérdida por diferencia de cambio
            await ctx.db.insert("journalEntryLines", {
                entryId,
                accountCode: "676",
                accountId: cuenta676._id,
                description: "Pérdida por diferencia de cambio",
                debit: absAmount,
                credit: 0,
            });
            await ctx.db.insert("journalEntryLines", {
                entryId,
                accountCode: usdAccounts[0] ? "1061" : "1041",
                accountId: usdAccounts[0]?.accountingAccountId || cuenta676._id,
                description: "Ajuste saldo bancario USD",
                debit: 0,
                credit: absAmount,
            });
        } else {
            // Ganancia por diferencia de cambio
            await ctx.db.insert("journalEntryLines", {
                entryId,
                accountCode: usdAccounts[0] ? "1061" : "1041",
                accountId: usdAccounts[0]?.accountingAccountId || cuenta776._id,
                description: "Ajuste saldo bancario USD",
                debit: absAmount,
                credit: 0,
            });
            await ctx.db.insert("journalEntryLines", {
                entryId,
                accountCode: "776",
                accountId: cuenta776._id,
                description: "Ganancia por diferencia de cambio",
                debit: 0,
                credit: absAmount,
            });
        }

        return { adjustmentMade: true, entryNumber, amount: absAmount, type: isLoss ? "perdida" : "ganancia" };
    }
});
