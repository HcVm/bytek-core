import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllDepartments = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("departments").collect();
    },
});

export const createDepartment = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        managerId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("departments", {
            name: args.name,
            description: args.description,
            managerId: args.managerId,
        });
    }
});
