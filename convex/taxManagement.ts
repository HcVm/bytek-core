import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =============================================
// GESTIÓN TRIBUTARIA PERÚ (IGV, IR, EsSalud, etc.)
// =============================================

export const getTaxObligations = query({
    args: {
        period: v.optional(v.string()),
        type: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let obligations = await ctx.db.query("taxObligations").order("desc").collect();

        if (args.period) {
            obligations = obligations.filter(o => o.period === args.period);
        }
        if (args.type) {
            obligations = obligations.filter(o => o.type === args.type);
        }

        return obligations;
    }
});

export const createTaxObligation = mutation({
    args: {
        period: v.string(),
        type: v.union(v.literal("igv"), v.literal("renta_mensual"), v.literal("renta_anual"), v.literal("essalud"), v.literal("onp"), v.literal("afp"), v.literal("detraccion")),
        baseAmount: v.number(),
        taxAmount: v.number(),
        creditAmount: v.optional(v.number()),
        dueDate: v.string(),
    },
    handler: async (ctx, args) => {
        const netPayable = args.taxAmount - (args.creditAmount || 0);

        return await ctx.db.insert("taxObligations", {
            period: args.period,
            type: args.type,
            baseAmount: args.baseAmount,
            taxAmount: args.taxAmount,
            creditAmount: args.creditAmount,
            netPayable: Math.max(0, Math.round(netPayable * 100) / 100),
            dueDate: args.dueDate,
            status: "por_declarar",
        });
    }
});

export const markTaxAsDeclared = mutation({
    args: {
        obligationId: v.id("taxObligations"),
        pdtReference: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.obligationId, {
            status: "declarado",
            pdtReference: args.pdtReference,
        });
    }
});

export const markTaxAsPaid = mutation({
    args: {
        obligationId: v.id("taxObligations"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.obligationId, { status: "pagado" });
    }
});

// =============================================
// CÁLCULO AUTOMÁTICO DE IGV MENSUAL
// =============================================

export const calculateMonthlyIGV = query({
    args: {
        year: v.number(),
        month: v.number(),
    },
    handler: async (ctx, args) => {
        const monthStr = `${args.year}-${String(args.month).padStart(2, "0")}`;

        // IGV Ventas (Débito Fiscal) — Facturas emitidas en el mes
        const invoices = await ctx.db.query("invoices").collect();
        const monthInvoices = invoices.filter(inv => {
            const invoiceDate = new Date(inv._creationTime);
            return invoiceDate.getFullYear() === args.year && invoiceDate.getMonth() + 1 === args.month;
        });
        const totalSales = monthInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        const salesBase = Math.round((totalSales / 1.18) * 100) / 100;
        const igvVentas = Math.round((salesBase * 0.18) * 100) / 100;

        // IGV Compras (Crédito Fiscal) — Gastos registrados en el mes
        const expenses = await ctx.db.query("expenses").collect();
        const monthExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.expenseDate);
            return expDate.getFullYear() === args.year && expDate.getMonth() + 1 === args.month && exp.currency === "PEN";
        });
        const totalPurchases = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const purchasesBase = Math.round((totalPurchases / 1.18) * 100) / 100;
        const igvCompras = Math.round((purchasesBase * 0.18) * 100) / 100;

        const netIGV = Math.round((igvVentas - igvCompras) * 100) / 100;

        return {
            period: monthStr,
            sales: {
                total: totalSales,
                base: salesBase,
                igv: igvVentas,
                invoiceCount: monthInvoices.length,
            },
            purchases: {
                total: totalPurchases,
                base: purchasesBase,
                igv: igvCompras,
                expenseCount: monthExpenses.length,
            },
            debitoFiscal: igvVentas,
            creditoFiscal: igvCompras,
            netPayable: Math.max(0, netIGV),
            creditBalance: netIGV < 0 ? Math.abs(netIGV) : 0,
        };
    }
});

// =============================================
// CÁLCULO IMPUESTO A LA RENTA MENSUAL (1.5%)
// =============================================

export const calculateMonthlyIncomeTax = query({
    args: {
        year: v.number(),
        month: v.number(),
    },
    handler: async (ctx, args) => {
        const invoices = await ctx.db.query("invoices").collect();
        const monthInvoices = invoices.filter(inv => {
            const invoiceDate = new Date(inv._creationTime);
            return invoiceDate.getFullYear() === args.year && invoiceDate.getMonth() + 1 === args.month;
        });

        const totalIncome = monthInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        const incomeBase = Math.round((totalIncome / 1.18) * 100) / 100; // Sin IGV
        const monthlyTax = Math.round((incomeBase * 0.015) * 100) / 100; // 1.5% pago a cuenta

        return {
            period: `${args.year}-${String(args.month).padStart(2, "0")}`,
            totalIncome,
            incomeBase,
            rate: 0.015,
            monthlyPayment: monthlyTax,
        };
    }
});

// =============================================
// CALENDARIO TRIBUTARIO
// =============================================

export const getTaxCalendar = query({
    args: { year: v.number() },
    handler: async (ctx, args) => {
        const obligations = await ctx.db.query("taxObligations")
            .filter(q => q.gte(q.field("period"), `${args.year}-`))
            .collect();

        const filteredByYear = obligations.filter(o => o.period.startsWith(`${args.year}`));

        // Agrupar por periodo
        const byPeriod: Record<string, typeof filteredByYear> = {};
        filteredByYear.forEach(o => {
            if (!byPeriod[o.period]) byPeriod[o.period] = [];
            byPeriod[o.period].push(o);
        });

        const totalPending = filteredByYear
            .filter(o => o.status !== "pagado")
            .reduce((sum, o) => sum + o.netPayable, 0);

        return {
            year: args.year,
            periods: Object.entries(byPeriod)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([period, obligations]) => ({
                    period,
                    obligations,
                    totalDue: obligations.reduce((s, o) => s + o.netPayable, 0),
                    allPaid: obligations.every(o => o.status === "pagado"),
                })),
            totalPendingAmount: Math.round(totalPending * 100) / 100,
        };
    }
});
