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

// =============================================
// FLUJO DE CAJA PROYECTADO — 12 MESES
// =============================================

export const getCashFlowProjection = query({
    args: {
        months: v.optional(v.number()), // Default 12
    },
    handler: async (ctx, args) => {
        const projectionMonths = args.months || 12;
        const today = new Date();
        const projection: Array<{
            month: string;
            projectedInflows: number;
            projectedOutflows: number;
            projectedBalance: number;
            details: { arInflows: number; recurringInflows: number; apOutflows: number; payrollEstimate: number; fixedCosts: number };
        }> = [];

        // Datos base
        const receivables = await ctx.db.query("accountsReceivable").collect();
        const payables = await ctx.db.query("accountsPayable").collect();
        const bankAccounts = await ctx.db.query("bankAccounts").collect();
        const allTransactions = await ctx.db.query("bankTransactions").collect();

        // Saldo actual total
        let runningBalance = bankAccounts.reduce((s, a) => s + a.currentBalance, 0);

        // Estimar gastos fijos mensuales (promedio de los últimos 3 meses de egresos)
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const recentOutflows = allTransactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === "egreso" && tDate >= threeMonthsAgo && tDate <= today;
        });
        const avgMonthlyOutflow = recentOutflows.length > 0
            ? recentOutflows.reduce((s, t) => s + t.amount, 0) / 3
            : 0;

        // Estimar ingresos recurrentes (promedio de los últimos 3 meses de ingresos)
        const recentInflows = allTransactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === "ingreso" && tDate >= threeMonthsAgo && tDate <= today;
        });
        const avgMonthlyInflow = recentInflows.length > 0
            ? recentInflows.reduce((s, t) => s + t.amount, 0) / 3
            : 0;

        // Estimar nómina mensual
        const employees = await ctx.db.query("employeeProfiles").collect();
        const activeEmployees = employees.filter(e => e.status === "activo");
        const monthlyPayroll = activeEmployees.reduce((s, e) => s + (e.baseSalary || 0), 0) * 1.09; // incluir EsSalud

        for (let i = 0; i < projectionMonths; i++) {
            const monthDate = new Date(today);
            monthDate.setMonth(monthDate.getMonth() + i + 1);
            const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;

            // CxC que vencen este mes
            const arThisMonth = receivables
                .filter(r => r.status !== "cobrado" && r.dueDate.startsWith(monthStr))
                .reduce((s, r) => s + r.pendingAmount, 0);

            // CxP que vencen este mes
            const apThisMonth = payables
                .filter(p => p.status !== "pagado" && p.dueDate.startsWith(monthStr))
                .reduce((s, p) => s + p.pendingAmount, 0);

            // Ingresos proyectados = AR del mes + ingresos recurrentes estimados
            const projectedInflows = arThisMonth + (i >= 1 ? avgMonthlyInflow * 0.3 : 0); // Solo 30% adicional estimado

            // Egresos proyectados = AP del mes + nómina + gastos fijos estimados
            const fixedCosts = i >= 1 ? avgMonthlyOutflow * 0.5 : 0; // 50% de gastos variables estimados
            const projectedOutflows = apThisMonth + monthlyPayroll + fixedCosts;

            runningBalance += projectedInflows - projectedOutflows;

            projection.push({
                month: monthStr,
                projectedInflows: Math.round(projectedInflows * 100) / 100,
                projectedOutflows: Math.round(projectedOutflows * 100) / 100,
                projectedBalance: Math.round(runningBalance * 100) / 100,
                details: {
                    arInflows: Math.round(arThisMonth * 100) / 100,
                    recurringInflows: Math.round((i >= 1 ? avgMonthlyInflow * 0.3 : 0) * 100) / 100,
                    apOutflows: Math.round(apThisMonth * 100) / 100,
                    payrollEstimate: Math.round(monthlyPayroll * 100) / 100,
                    fixedCosts: Math.round(fixedCosts * 100) / 100,
                },
            });
        }

        return {
            currentBalance: Math.round(bankAccounts.reduce((s, a) => s + a.currentBalance, 0) * 100) / 100,
            projection,
            assumptions: {
                avgMonthlyInflow: Math.round(avgMonthlyInflow * 100) / 100,
                avgMonthlyOutflow: Math.round(avgMonthlyOutflow * 100) / 100,
                monthlyPayroll: Math.round(monthlyPayroll * 100) / 100,
                activeEmployees: activeEmployees.length,
            }
        };
    }
});

export const getCashFlowScenario = query({
    args: {
        collectionDelayPercent: v.number(), // % de retraso en cobros (ej: 30 = 30% se retrasan)
        extraCostPercent: v.number(),       // % de costos adicionales (ej: 15 = 15% extra)
    },
    handler: async (ctx, args) => {
        const today = new Date();
        const bankAccounts = await ctx.db.query("bankAccounts").collect();
        const receivables = await ctx.db.query("accountsReceivable").collect();
        const payables = await ctx.db.query("accountsPayable").collect();
        const allTransactions = await ctx.db.query("bankTransactions").collect();

        let runningBalance = bankAccounts.reduce((s, a) => s + a.currentBalance, 0);

        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const recentOutflows = allTransactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === "egreso" && tDate >= threeMonthsAgo && tDate <= today;
        });
        const avgMonthlyOutflow = recentOutflows.length > 0 ? recentOutflows.reduce((s, t) => s + t.amount, 0) / 3 : 0;

        const employees = await ctx.db.query("employeeProfiles").collect();
        const activeEmployees = employees.filter(e => e.status === "activo");
        const monthlyPayroll = activeEmployees.reduce((s, e) => s + (e.baseSalary || 0), 0) * 1.09;

        const scenario: Array<{ month: string; balance: number }> = [];

        for (let i = 0; i < 12; i++) {
            const monthDate = new Date(today);
            monthDate.setMonth(monthDate.getMonth() + i + 1);
            const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;

            const arThisMonth = receivables
                .filter(r => r.status !== "cobrado" && r.dueDate.startsWith(monthStr))
                .reduce((s, r) => s + r.pendingAmount, 0);

            const apThisMonth = payables
                .filter(p => p.status !== "pagado" && p.dueDate.startsWith(monthStr))
                .reduce((s, p) => s + p.pendingAmount, 0);

            // Aplicar escenario: reducir ingresos y aumentar egresos
            const adjustedInflows = arThisMonth * (1 - args.collectionDelayPercent / 100);
            const adjustedOutflows = (apThisMonth + monthlyPayroll + avgMonthlyOutflow * 0.5) * (1 + args.extraCostPercent / 100);

            runningBalance += adjustedInflows - adjustedOutflows;
            scenario.push({ month: monthStr, balance: Math.round(runningBalance * 100) / 100 });
        }

        return {
            scenarioName: `Retraso cobros ${args.collectionDelayPercent}% + Costos extra ${args.extraCostPercent}%`,
            scenario,
            breaksEvenMonth: scenario.findIndex(s => s.balance < 0) + 1 || null,
        };
    }
});
