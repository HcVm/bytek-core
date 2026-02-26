import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internalCreateJournalEntry, getCurrentPeriod } from "./journal";

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
        accountingAccountId: v.optional(v.id("accountingAccounts")),
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
        // Validar unicidad
        const existing = await ctx.db
            .query("serialNumbers")
            .withIndex("by_serial", q => q.eq("serial", args.serial))
            .first();

        if (existing) {
            throw new Error(`El número de serie ${args.serial} ya está registrado.`);
        }

        const serialId = await ctx.db.insert("serialNumbers", {
            hardwareId: args.hardwareId,
            serial: args.serial,
            status: "in_stock",
            dateAdded: Date.now(),
        });

        // Automatización contable
        const item = await ctx.db.get(args.hardwareId);
        if (item?.accountingAccountId && item.costPrice > 0) {
            const period = await getCurrentPeriod(ctx);
            const admin = await ctx.db.query("users").filter(q => q.eq(q.field("role"), "admin")).first();
            const inventoryAccount = await ctx.db.get(item.accountingAccountId);
            const liabilityAccount = await ctx.db.query("accountingAccounts").filter(q => q.eq(q.field("code"), "4212")).first();

            if (period && admin && inventoryAccount && liabilityAccount) {
                await internalCreateJournalEntry(ctx, {
                    date: new Date().toISOString().split('T')[0],
                    periodId: period._id,
                    description: `Ingreso a Almacén: ${item.name} (${item.sku}) - S/N: ${args.serial}`,
                    type: "operacion",
                    createdBy: admin._id,
                    sourceModule: "inventory",
                    sourceId: serialId,
                    lines: [
                        {
                            accountId: inventoryAccount._id,
                            accountCode: inventoryAccount.code,
                            debit: item.costPrice,
                            credit: 0,
                            description: `Entrada de mercadería: ${item.name}`
                        },
                        {
                            accountId: liabilityAccount._id,
                            accountCode: liabilityAccount.code,
                            debit: 0,
                            credit: item.costPrice,
                            description: `Provisión de compra de mercadería`
                        }
                    ]
                });
            }
        }

        return serialId;
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
