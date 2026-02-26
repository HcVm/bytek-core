import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// VENDORS
// ==========================================

export const getVendors = query({
    handler: async (ctx) => {
        return await ctx.db.query("vendors").order("desc").collect();
    }
});

export const addVendor = mutation({
    args: {
        name: v.string(),
        category: v.union(v.literal("cloud"), v.literal("software"), v.literal("contractor"), v.literal("hardware")),
        contactName: v.optional(v.string()),
        email: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("vendors", {
            ...args,
            status: "active",
        });
    }
});

export const updateVendorStatus = mutation({
    args: {
        vendorId: v.id("vendors"),
        status: v.union(v.literal("active"), v.literal("inactive")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.patch(args.vendorId, { status: args.status });
    }
});

// ==========================================
// VENDOR EVALUATIONS
// ==========================================

export const getEvaluationsByVendor = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        const evaluations = await ctx.db.query("vendorEvaluations")
            .withIndex("by_vendor", q => q.eq("vendorId", args.vendorId))
            .order("desc")
            .collect();

        // Enrich with evaluator name
        return await Promise.all(evaluations.map(async (evalRecord) => {
            const evaluator = await ctx.db.get(evalRecord.evaluatedBy);
            return {
                ...evalRecord,
                evaluatorName: evaluator?.name ?? "Unknown",
            };
        }));
    }
});

export const addEvaluation = mutation({
    args: {
        vendorId: v.id("vendors"),
        criteria: v.string(),
        score: v.number(),
        evaluatedBy: v.id("users"),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("vendorEvaluations", {
            ...args,
            date: Date.now(),
        });
    }
});

// ==========================================
// CLOUD COSTS
// ==========================================

export const getCloudCosts = query({
    args: {
        year: v.optional(v.number()),
        projectId: v.optional(v.id("projects"))
    },
    handler: async (ctx, args) => {
        let costs = args.projectId
            ? await ctx.db.query("cloudCosts").withIndex("by_project", q => q.eq("projectId", args.projectId!)).collect()
            : await ctx.db.query("cloudCosts").collect();

        if (args.year) {
            costs = costs.filter(c => c.year === args.year);
        }

        // Enrich with vendor details
        return await Promise.all(costs.map(async (cost) => {
            const vendor = await ctx.db.get(cost.vendorId);
            return {
                ...cost,
                vendorName: vendor?.name ?? "Unknown Vendor",
            };
        }));
    }
});

export const logCloudCost = mutation({
    args: {
        vendorId: v.id("vendors"),
        projectId: v.optional(v.id("projects")),
        month: v.number(),
        year: v.number(),
        amount: v.number(),
        serviceName: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("cloudCosts", {
            ...args,
        });
    }
});
