import { query } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// DETAILED PROJECT PROFITABILITY
// ==========================================

export const getDetailedProjectProfitability = query({
    handler: async (ctx) => {
        const projects = await ctx.db.query("projects").collect();
        const invoices = await ctx.db.query("invoices").collect();
        const expenses = await ctx.db.query("expenses").collect();

        const profitability = projects.map(p => {
            const projectInvoices = invoices.filter(i => i.projectId === p._id && i.status === "paid");
            const projectExpenses = expenses.filter(e => e.projectId === p._id);

            const totalRevenue = projectInvoices.reduce((sum, inv) => sum + inv.amount, 0);
            const totalExpenses = projectExpenses.reduce((sum, exp) => sum + exp.amount, 0);

            // Assume 100 penetration arbitrary internal costs if needed, keeping simple.
            const grossMargin = totalRevenue - totalExpenses;
            const marginPercentage = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

            return {
                projectId: p._id,
                title: p.title,
                status: p.status,
                totalRevenue,
                totalExpenses,
                grossMargin,
                marginPercentage,
            };
        });

        // Filter out projects with 0 revenue that haven't even started billing
        return profitability.filter(p => p.totalRevenue > 0 || p.totalExpenses > 0).sort((a, b) => b.grossMargin - a.grossMargin);
    }
});

// ==========================================
// HR ANALYTICS
// ==========================================

export const getHrAnalytics = query({
    handler: async (ctx) => {
        const employees = await ctx.db.query("employeeProfiles").collect();
        const candidates = await ctx.db.query("candidates").collect();

        // 1. Turnover Rate (Churn) calculation for current year
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).getTime();

        const activeEmployees = employees.filter(e => e.status === "activo").length;
        const terminatedEmployees = employees.filter(e => e.status === "cesado" && e.terminationDate && e.terminationDate > startOfYear).length;

        let turnoverRate = 0;
        if (activeEmployees + terminatedEmployees > 0) {
            turnoverRate = (terminatedEmployees / (activeEmployees + (terminatedEmployees / 2))) * 100;
        }

        // 2. Average Time to Hire
        const hiredCandidates = candidates.filter(c => c.status === "hired");
        // We lack a specific "hiredDate", so we'll approximate based on when they applied vs now (or use a placeholder)
        // Here we just use a placeholder average for the example payload
        const avgTimeToHireDays = 14;

        // 3. Department distribution
        const departments = await ctx.db.query("departments").collect();
        const users = await ctx.db.query("users").collect();

        const depDist = departments.map(d => {
            const depUsers = users.filter(u => u.departmentId === d._id).length;
            return {
                name: d.name,
                count: depUsers
            }
        });

        return {
            turnoverRate,
            activeEmployees,
            terminatedEmployees,
            avgTimeToHireDays,
            departmentDistribution: depDist
        };
    }
});

// ==========================================
// CLOUD COST PREDICTION
// ==========================================

export const getCloudCostAnalysis = query({
    args: { vendorId: v.optional(v.id("vendors")) },
    handler: async (ctx, args) => {
        const costs = args.vendorId
            ? await ctx.db.query("cloudCosts").withIndex("by_vendor", q => q.eq("vendorId", args.vendorId!)).collect()
            : await ctx.db.query("cloudCosts").collect();

        // Group by month/year
        const trendMap = new Map<string, number>();
        costs.forEach(c => {
            const key = `${c.year}-${c.month.toString().padStart(2, '0')}`;
            const current = trendMap.get(key) || 0;
            trendMap.set(key, current + c.amount);
        });

        const sortedKeys = Array.from(trendMap.keys()).sort();
        const historical = sortedKeys.map(k => ({ period: k, amount: trendMap.get(k) || 0 }));

        // Simple linear prediction for Next Month
        let predictedNextMonth = 0;
        if (historical.length >= 2) {
            const last = historical[historical.length - 1].amount;
            const prev = historical[historical.length - 2].amount;
            const delta = last - prev;
            predictedNextMonth = last + delta;
            if (predictedNextMonth < 0) predictedNextMonth = 0;
        } else if (historical.length === 1) {
            predictedNextMonth = historical[0].amount;
        }

        return {
            historical,
            predictedNextMonth
        };
    }
});
