import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getInvoices = query({
    args: {},
    handler: async (ctx) => {
        const invoices = await ctx.db.query("invoices").order("desc").collect();
        return await Promise.all(
            invoices.map(async (invoice) => {
                const client = await ctx.db.get(invoice.clientId);
                return {
                    ...invoice,
                    clientName: client?.companyName || "Cliente Desconocido",
                };
            })
        );
    },
});

export const createInvoice = mutation({
    args: {
        clientId: v.id("clients"),
        projectId: v.optional(v.id("projects")),
        amount: v.number(),
        billingType: v.union(v.literal("recurring"), v.literal("one_time"), v.literal("milestone")),
        status: v.union(v.literal("pending"), v.literal("paid"), v.literal("overdue")),
        dueDate: v.number(),
        paymentGatewayReference: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("invoices", args);
    },
});

export const updateInvoice = mutation({
    args: {
        id: v.id("invoices"),
        status: v.optional(v.union(v.literal("pending"), v.literal("paid"), v.literal("overdue"))),
        paymentGatewayReference: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const deleteInvoice = mutation({
    args: { id: v.id("invoices") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
