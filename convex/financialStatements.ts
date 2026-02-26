import { query } from "./_generated/server";
import { v } from "convex/values";

// =============================================
// ESTADOS FINANCIEROS AUTOMATIZADOS
// =============================================

/**
 * BALANCE GENERAL (Estado de Situación Financiera)
 * Activos = Pasivos + Patrimonio
 */
export const getBalanceSheet = query({
    args: {
        periodId: v.optional(v.id("accountingPeriods")),
    },
    handler: async (ctx, args) => {
        // Obtener todos los asientos contabilizados
        let entries;
        if (args.periodId) {
            entries = await ctx.db.query("journalEntries")
                .withIndex("by_period", q => q.eq("periodId", args.periodId!))
                .filter(q => q.eq(q.field("status"), "contabilizado"))
                .collect();
        } else {
            entries = await ctx.db.query("journalEntries")
                .filter(q => q.eq(q.field("status"), "contabilizado"))
                .collect();
        }

        // Acumular por cuenta contable
        const accountBalances: Record<string, { code: string; name: string; type: string; nature: string; balance: number }> = {};

        for (const entry of entries) {
            const lines = await ctx.db.query("journalEntryLines")
                .withIndex("by_entry", q => q.eq("entryId", entry._id))
                .collect();

            for (const line of lines) {
                if (!accountBalances[line.accountCode]) {
                    const account = await ctx.db.get(line.accountId);
                    accountBalances[line.accountCode] = {
                        code: line.accountCode,
                        name: account?.name || "Desconocida",
                        type: account?.type || "gasto",
                        nature: account?.nature || "deudora",
                        balance: 0,
                    };
                }
                const acc = accountBalances[line.accountCode];
                if (acc.nature === "deudora") {
                    acc.balance += line.debit - line.credit;
                } else {
                    acc.balance += line.credit - line.debit;
                }
            }
        }

        const allAccounts = Object.values(accountBalances);

        // Clasificar por tipo
        const activos = allAccounts
            .filter(a => a.type === "activo")
            .sort((a, b) => a.code.localeCompare(b.code));
        const pasivos = allAccounts
            .filter(a => a.type === "pasivo")
            .sort((a, b) => a.code.localeCompare(b.code));
        const patrimonio = allAccounts
            .filter(a => a.type === "patrimonio")
            .sort((a, b) => a.code.localeCompare(b.code));

        const totalActivos = Math.round(activos.reduce((s, a) => s + a.balance, 0) * 100) / 100;
        const totalPasivos = Math.round(pasivos.reduce((s, a) => s + a.balance, 0) * 100) / 100;
        const totalPatrimonio = Math.round(patrimonio.reduce((s, a) => s + a.balance, 0) * 100) / 100;

        return {
            activos: { items: activos, total: totalActivos },
            pasivos: { items: pasivos, total: totalPasivos },
            patrimonio: { items: patrimonio, total: totalPatrimonio },
            totalPasivoPatrimonio: Math.round((totalPasivos + totalPatrimonio) * 100) / 100,
            isBalanced: Math.abs(totalActivos - (totalPasivos + totalPatrimonio)) < 0.01,
            generatedAt: Date.now(),
        };
    }
});

/**
 * ESTADO DE RESULTADOS (Pérdidas y Ganancias)
 * Utilidad = Ingresos - Costos - Gastos
 */
export const getIncomeStatement = query({
    args: {
        periodId: v.optional(v.id("accountingPeriods")),
    },
    handler: async (ctx, args) => {
        let entries;
        if (args.periodId) {
            entries = await ctx.db.query("journalEntries")
                .withIndex("by_period", q => q.eq("periodId", args.periodId!))
                .filter(q => q.eq(q.field("status"), "contabilizado"))
                .collect();
        } else {
            entries = await ctx.db.query("journalEntries")
                .filter(q => q.eq(q.field("status"), "contabilizado"))
                .collect();
        }

        const accountBalances: Record<string, { code: string; name: string; type: string; nature: string; balance: number }> = {};

        for (const entry of entries) {
            const lines = await ctx.db.query("journalEntryLines")
                .withIndex("by_entry", q => q.eq("entryId", entry._id))
                .collect();

            for (const line of lines) {
                if (!accountBalances[line.accountCode]) {
                    const account = await ctx.db.get(line.accountId);
                    accountBalances[line.accountCode] = {
                        code: line.accountCode,
                        name: account?.name || "Desconocida",
                        type: account?.type || "gasto",
                        nature: account?.nature || "deudora",
                        balance: 0,
                    };
                }
                const acc = accountBalances[line.accountCode];
                if (acc.nature === "deudora") {
                    acc.balance += line.debit - line.credit;
                } else {
                    acc.balance += line.credit - line.debit;
                }
            }
        }

        const allAccounts = Object.values(accountBalances);

        // Ingresos (clase 70-79)
        const ingresos = allAccounts
            .filter(a => a.type === "ingreso")
            .sort((a, b) => a.code.localeCompare(b.code));

        // Costos (clase 69)
        const costos = allAccounts
            .filter(a => a.type === "costo")
            .sort((a, b) => a.code.localeCompare(b.code));

        // Gastos (clase 60-68, 94-95)
        const gastos = allAccounts
            .filter(a => a.type === "gasto")
            .sort((a, b) => a.code.localeCompare(b.code));

        const totalIngresos = Math.round(ingresos.reduce((s, a) => s + a.balance, 0) * 100) / 100;
        const totalCostos = Math.round(costos.reduce((s, a) => s + a.balance, 0) * 100) / 100;
        const totalGastos = Math.round(gastos.reduce((s, a) => s + a.balance, 0) * 100) / 100;

        const utilidadBruta = Math.round((totalIngresos - totalCostos) * 100) / 100;
        const utilidadOperativa = Math.round((utilidadBruta - totalGastos) * 100) / 100;

        // IR estimado (29.5% para régimen general)
        const impuestoRenta = utilidadOperativa > 0 ? Math.round(utilidadOperativa * 0.295 * 100) / 100 : 0;
        const utilidadNeta = Math.round((utilidadOperativa - impuestoRenta) * 100) / 100;

        return {
            ingresos: { items: ingresos, total: totalIngresos },
            costos: { items: costos, total: totalCostos },
            utilidadBruta,
            gastos: { items: gastos, total: totalGastos },
            utilidadOperativa,
            impuestoRenta,
            utilidadNeta,
            margenBruto: totalIngresos > 0 ? Math.round((utilidadBruta / totalIngresos) * 10000) / 100 : 0,
            margenNeto: totalIngresos > 0 ? Math.round((utilidadNeta / totalIngresos) * 10000) / 100 : 0,
            generatedAt: Date.now(),
        };
    }
});

/**
 * ESTADO DE FLUJO DE EFECTIVO (Simplificado)
 * Método directo — a partir de movimientos bancarios
 */
export const getCashFlowStatement = query({
    args: {
        year: v.number(),
        month: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const allTransactions = await ctx.db.query("bankTransactions").collect();

        let filtered;
        if (args.month) {
            const monthStr = `${args.year}-${String(args.month).padStart(2, "0")}`;
            filtered = allTransactions.filter(t => t.date.startsWith(monthStr));
        } else {
            filtered = allTransactions.filter(t => t.date.startsWith(`${args.year}`));
        }

        // Clasificar por tipo de actividad (simplificado)
        const operationalIn = filtered.filter(t => t.type === "ingreso" && !t.description.toLowerCase().includes("préstamo") && !t.description.toLowerCase().includes("inversión"));
        const operationalOut = filtered.filter(t => t.type === "egreso" && !t.description.toLowerCase().includes("préstamo") && !t.description.toLowerCase().includes("inversión") && !t.description.toLowerCase().includes("equipo"));
        const investingOut = filtered.filter(t => t.type === "egreso" && (t.description.toLowerCase().includes("equipo") || t.description.toLowerCase().includes("inversión")));
        const financingIn = filtered.filter(t => t.type === "ingreso" && t.description.toLowerCase().includes("préstamo"));
        const financingOut = filtered.filter(t => t.type === "egreso" && t.description.toLowerCase().includes("préstamo"));

        const sumAmounts = (items: typeof filtered) => Math.round(items.reduce((s, t) => s + t.amount, 0) * 100) / 100;

        const operationalCashFlow = sumAmounts(operationalIn) - sumAmounts(operationalOut);
        const investingCashFlow = -sumAmounts(investingOut);
        const financingCashFlow = sumAmounts(financingIn) - sumAmounts(financingOut);

        // Saldos bancarios actuales
        const bankAccounts = await ctx.db.query("bankAccounts").collect();
        const totalCash = bankAccounts.reduce((s, a) => s + a.currentBalance, 0);

        return {
            period: args.month ? `${args.year}-${String(args.month).padStart(2, "0")}` : `${args.year}`,
            operational: {
                inflows: sumAmounts(operationalIn),
                outflows: sumAmounts(operationalOut),
                net: Math.round(operationalCashFlow * 100) / 100,
            },
            investing: {
                outflows: sumAmounts(investingOut),
                net: Math.round(investingCashFlow * 100) / 100,
            },
            financing: {
                inflows: sumAmounts(financingIn),
                outflows: sumAmounts(financingOut),
                net: Math.round(financingCashFlow * 100) / 100,
            },
            netCashChange: Math.round((operationalCashFlow + investingCashFlow + financingCashFlow) * 100) / 100,
            currentCashPosition: Math.round(totalCash * 100) / 100,
            generatedAt: Date.now(),
        };
    }
});
