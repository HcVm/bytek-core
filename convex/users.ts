import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUsersByRole = query({
    args: { role: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .filter(q => q.eq(q.field("role"), args.role))
            .collect();
    },
});

export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("users").collect();
    },
});

export const createUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        role: v.union(v.literal("admin"), v.literal("sales"), v.literal("technician"), v.literal("developer"), v.literal("client")),
        departmentId: v.optional(v.id("departments")),
        position: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            role: args.role,
            departmentId: args.departmentId,
            position: args.position,
            active: true
        });
    }
});
