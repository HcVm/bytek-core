import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =============================================
// PRESUPUESTOS — CRUD + Varianza Automática
// =============================================

export const getBudgets = query({
    args: {
        year: v.optional(v.number()),
        type: v.optional(v.string()),
        costCenterId: v.optional(v.id("costCenters")),
    },
    handler: async (ctx, args) => {
        let budgets = await ctx.db.query("budgets").order("desc").collect();

        if (args.year) budgets = budgets.filter(b => b.year === args.year);
        if (args.type) budgets = budgets.filter(b => b.type === args.type);
        if (args.costCenterId) budgets = budgets.filter(b => b.costCenterId === args.costCenterId);

        return await Promise.all(budgets.map(async (b) => {
            const account = await ctx.db.get(b.accountId);
            const costCenter = b.costCenterId ? await ctx.db.get(b.costCenterId) : null;
            const project = b.projectId ? await ctx.db.get(b.projectId) : null;
            return {
                ...b,
                accountCode: account?.code || "",
                accountName: account?.name || "",
                costCenterName: costCenter?.name || "General",
                projectName: project?.title || null,
                executionPercent: b.budgetedAmount > 0 ? Math.round((b.actualAmount / b.budgetedAmount) * 10000) / 100 : 0,
            };
        }));
    }
});

export const createBudget = mutation({
    args: {
        name: v.string(),
        year: v.number(),
        month: v.optional(v.number()),
        type: v.union(v.literal("operativo"), v.literal("capital"), v.literal("proyecto"), v.literal("personal"), v.literal("forecast")),
        costCenterId: v.optional(v.id("costCenters")),
        projectId: v.optional(v.id("projects")),
        accountId: v.id("accountingAccounts"),
        budgetedAmount: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("budgets", {
            ...args,
            actualAmount: 0,
            variance: args.budgetedAmount, // Inicialmente toda la diferencia
            status: "activo",
        });
    }
});

export const updateBudget = mutation({
    args: {
        id: v.id("budgets"),
        name: v.optional(v.string()),
        budgetedAmount: v.optional(v.number()),
        status: v.optional(v.union(v.literal("activo"), v.literal("cerrado"))),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const budget = await ctx.db.get(id);
        if (!budget) throw new Error("Presupuesto no encontrado.");

        const finalUpdates: Record<string, any> = {};
        if (updates.name) finalUpdates.name = updates.name;
        if (updates.status) finalUpdates.status = updates.status;
        if (updates.budgetedAmount !== undefined) {
            finalUpdates.budgetedAmount = updates.budgetedAmount;
            finalUpdates.variance = Math.round((updates.budgetedAmount - budget.actualAmount) * 100) / 100;
        }

        await ctx.db.patch(id, finalUpdates);
    }
});

export const deleteBudget = mutation({
    args: { id: v.id("budgets") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    }
});

// =============================================
// RECÁLCULO AUTOMÁTICO DE EJECUCIÓN
// =============================================

export const recalculateBudgetActuals = mutation({
    args: { budgetId: v.id("budgets") },
    handler: async (ctx, args) => {
        const budget = await ctx.db.get(args.budgetId);
        if (!budget) throw new Error("Presupuesto no encontrado.");

        const account = await ctx.db.get(budget.accountId);
        if (!account) throw new Error("Cuenta contable no encontrada.");

        // Sumar movimientos contables de la cuenta vinculada en el año del presupuesto
        const allEntries = await ctx.db.query("journalEntries")
            .filter(q => q.eq(q.field("status"), "contabilizado"))
            .collect();

        // Filtrar por año (y opcionalmente mes)
        const yearStr = String(budget.year);
        let filteredEntries = allEntries.filter(e => e.date.startsWith(yearStr));

        if (budget.month) {
            const monthStr = `${yearStr}-${String(budget.month).padStart(2, "0")}`;
            filteredEntries = filteredEntries.filter(e => e.date.startsWith(monthStr));
        }

        // Sumar movimientos de la cuenta
        let totalActual = 0;
        for (const entry of filteredEntries) {
            const lines = await ctx.db.query("journalEntryLines")
                .withIndex("by_entry", q => q.eq("entryId", entry._id))
                .collect();

            for (const line of lines) {
                if (line.accountId === budget.accountId) {
                    // Si hay centro de costo, filtrar
                    if (budget.costCenterId && line.costCenterId !== budget.costCenterId) continue;

                    if (account.nature === "deudora") {
                        totalActual += line.debit - line.credit;
                    } else {
                        totalActual += line.credit - line.debit;
                    }
                }
            }
        }

        totalActual = Math.round(totalActual * 100) / 100;
        const variance = Math.round((budget.budgetedAmount - totalActual) * 100) / 100;

        await ctx.db.patch(args.budgetId, {
            actualAmount: totalActual,
            variance,
        });

        return { actualAmount: totalActual, variance };
    }
});

// =============================================
// COMPARATIVA PRESUPUESTAL
// =============================================

export const getBudgetComparison = query({
    args: { year: v.number() },
    handler: async (ctx, args) => {
        const budgets = await ctx.db.query("budgets")
            .withIndex("by_year", q => q.eq("year", args.year))
            .collect();

        const byType: Record<string, { budgeted: number; actual: number; variance: number; count: number }> = {};

        for (const b of budgets) {
            if (!byType[b.type]) {
                byType[b.type] = { budgeted: 0, actual: 0, variance: 0, count: 0 };
            }
            byType[b.type].budgeted += b.budgetedAmount;
            byType[b.type].actual += b.actualAmount;
            byType[b.type].variance += b.variance;
            byType[b.type].count++;
        }

        const totalBudgeted = budgets.reduce((s, b) => s + b.budgetedAmount, 0);
        const totalActual = budgets.reduce((s, b) => s + b.actualAmount, 0);

        return {
            year: args.year,
            byType: Object.entries(byType).map(([type, data]) => ({
                type,
                ...data,
                executionPercent: data.budgeted > 0 ? Math.round((data.actual / data.budgeted) * 10000) / 100 : 0,
            })),
            totals: {
                budgeted: Math.round(totalBudgeted * 100) / 100,
                actual: Math.round(totalActual * 100) / 100,
                variance: Math.round((totalBudgeted - totalActual) * 100) / 100,
                executionPercent: totalBudgeted > 0 ? Math.round((totalActual / totalBudgeted) * 10000) / 100 : 0,
            }
        };
    }
});
