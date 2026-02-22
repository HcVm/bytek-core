import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Obtener todo el catálogo de hardware iterando su stock físico
export const getHardwareItems = query({
    args: {},
    handler: async (ctx) => {
        const hardware = await ctx.db.query("hardwareItems").collect();
        const serials = await ctx.db.query("serialNumbers").collect();

        // Agrupar y calcular stock en memoria (in_stock)
        return hardware.map(item => {
            const inStockCount = serials.filter(s => s.hardwareId === item._id && s.status === "in_stock").length;
            return {
                ...item,
                currentStock: inStockCount,
                isLowStock: inStockCount <= item.minStockAlert
            };
        });
    },
});

export const addHardwareModel = mutation({
    args: {
        sku: v.string(),
        name: v.string(),
        brand: v.string(),
        costPrice: v.number(),
        salePrice: v.number(),
        minStockAlert: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("hardwareItems", args);
    },
});

export const getHardwareSerials = query({
    args: { hardwareId: v.id("hardwareItems") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("serialNumbers")
            .withIndex("by_hardware", q => q.eq("hardwareId", args.hardwareId))
            .collect();
    },
});

export const registerSerialNumber = mutation({
    args: {
        hardwareId: v.id("hardwareItems"),
        serial: v.string(),
    },
    handler: async (ctx, args) => {
        // Validar unicidad (simple validación en endpoint)
        const existing = await ctx.db
            .query("serialNumbers")
            .withIndex("by_serial", q => q.eq("serial", args.serial))
            .first();

        if (existing) {
            throw new Error(`El número de serie ${args.serial} ya está registrado.`);
        }

        return await ctx.db.insert("serialNumbers", {
            hardwareId: args.hardwareId,
            serial: args.serial,
            status: "in_stock",
            dateAdded: Date.now(),
        });
    },
});

export const updateSerialStatus = mutation({
    args: {
        serialId: v.id("serialNumbers"),
        status: v.union(v.literal("in_stock"), v.literal("installed"), v.literal("under_warranty"), v.literal("written_off")),
        projectId: v.optional(v.id("projects"))
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.serialId, {
            status: args.status,
            assignedProjectId: args.projectId
        });
    },
});
