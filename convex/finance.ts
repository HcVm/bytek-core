import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const addExpense = mutation({
    args: {
        title: v.string(),
        category: v.union(v.literal("nube"), v.literal("servicios"), v.literal("hardware"), v.literal("viaticos"), v.literal("alquiler"), v.literal("marketing"), v.literal("caja_chica"), v.literal("planilla"), v.literal("otro")),
        amount: v.number(),
        currency: v.union(v.literal("PEN"), v.literal("USD")),
        expenseDate: v.number(),
        status: v.union(v.literal("pendiente"), v.literal("pagado")),
        projectId: v.optional(v.id("projects")),
        providerName: v.optional(v.string()),
        registeredBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        return await (ctx.db as any).insert("expenses", {
            ...args,
            createdAt: Date.now(),
        });
    }
});

export const getExpenses = query({
    handler: async (ctx) => {
        const expenses = await (ctx.db as any).query("expenses").order("desc").collect();
        return Promise.all(
            expenses.map(async (exp: any) => {
                let projectName = null;
                if (exp.projectId) {
                    const prj: any = await ctx.db.get(exp.projectId as Id<"projects">);
                    projectName = prj?.name;
                }
                const user: any = await ctx.db.get(exp.registeredBy as Id<"users">);
                return { ...exp, projectName, userName: user?.name };
            })
        );
    }
});

export const updateExpenseStatus = mutation({
    args: { expenseId: v.id("expenses"), status: v.union(v.literal("pendiente"), v.literal("pagado")) },
    handler: async (ctx, args) => {
        await (ctx.db as any).patch(args.expenseId, { status: args.status });
    }
});

export const deleteExpense = mutation({
    args: { expenseId: v.id("expenses") },
    handler: async (ctx, args) => {
        await (ctx.db as any).delete(args.expenseId);
    }
});
