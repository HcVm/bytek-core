import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const generateQuote = mutation({
    args: {
        opportunityId: v.id("opportunities"),
        quoteNumber: v.string(),
        items: v.array(v.object({
            description: v.string(),
            quantity: v.number(),
            unitPrice: v.number(),
            totalPrice: v.number(),
        })),
        validUntil: v.number(),
        notes: v.optional(v.string()),
        createdBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        const subtotal = args.items.reduce((acc, curr) => acc + curr.totalPrice, 0);
        const tax = subtotal * 0.18; // IGV Perú
        const total = subtotal + tax;

        return await (ctx.db as any).insert("quotes", {
            opportunityId: args.opportunityId,
            quoteNumber: args.quoteNumber,
            items: args.items,
            subtotal,
            tax,
            total,
            status: "borrador",
            validUntil: args.validUntil,
            notes: args.notes,
            createdBy: args.createdBy,
            createdAt: Date.now()
        });
    }
});

export const getQuotesByOpportunity = query({
    args: { opportunityId: v.id("opportunities") },
    handler: async (ctx, args) => {
        return await (ctx.db as any)
            .query("quotes")
            .withIndex("by_opportunity", (q: any) => q.eq("opportunityId", args.opportunityId))
            .order("desc")
            .collect();
    }
});

export const updateQuoteStatus = mutation({
    args: { quoteId: v.id("quotes"), status: v.union(v.literal("borrador"), v.literal("enviado"), v.literal("aceptado"), v.literal("rechazado")) },
    handler: async (ctx, args) => {
        await (ctx.db as any).patch(args.quoteId, { status: args.status });

        // Efecto Cascada: Si una Proforma se acepta, la Oportunidad Padre debe reflejar la ganancia
        if (args.status === "aceptado") {
            const quote = await (ctx.db as any).get(args.quoteId);
            if (quote) {
                await (ctx.db as any).patch(quote.opportunityId, { status: "won", estimatedValue: quote.total });
            }
        }
    }
});

export const getAllQuotes = query({
    handler: async (ctx) => {
        const quotes = await (ctx.db as any).query("quotes").order("desc").collect();
        return Promise.all(
            quotes.map(async (quote: any) => {
                const opp = await (ctx.db as any).get(quote.opportunityId);
                let clientName = "Cliente Desconocido";
                if (opp && opp.clientId) {
                    const client = await (ctx.db as any).get(opp.clientId);
                    clientName = client?.companyName || "Cliente Desconocido";
                }
                return { ...quote, clientName };
            })
        );
    }
});
