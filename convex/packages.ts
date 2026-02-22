import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Obtener todos los servicios/paquetes
export const getPackages = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("packages").order("desc").collect();
    },
});

// Crear nuevo servicio/paquete
export const createPackage = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        unit: v.union(v.literal("digital"), v.literal("solutions"), v.literal("infra")),
        type: v.union(v.literal("service"), v.literal("subscription"), v.literal("hardware")),
        basePrice: v.number(),
        active: v.boolean(),
    },
    handler: async (ctx, args) => {
        const packageId = await ctx.db.insert("packages", args);
        return packageId;
    },
});

// Actualizar un servicio
export const updatePackage = mutation({
    args: {
        id: v.id("packages"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        unit: v.optional(v.union(v.literal("digital"), v.literal("solutions"), v.literal("infra"))),
        type: v.optional(v.union(v.literal("service"), v.literal("subscription"), v.literal("hardware"))),
        basePrice: v.optional(v.number()),
        active: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Eliminar (o desactivar)
export const deletePackage = mutation({
    args: { id: v.id("packages") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
