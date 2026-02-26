import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internalCreateJournalEntry, getCurrentPeriod } from "./journal";

// ==========================================
// HARDWARE ASSETS
// ==========================================

export const getHardwareAssets = query({
    handler: async (ctx) => {
        const assets = await ctx.db.query("hardwareAssets").order("desc").collect();
        return await Promise.all(assets.map(async (asset) => {
            const assignee = asset.assignedTo ? await ctx.db.get(asset.assignedTo) : null;
            const accountingAccount = asset.accountingAccountId ? await ctx.db.get(asset.accountingAccountId) : null;
            const depreciationAccount = asset.depreciationAccountId ? await ctx.db.get(asset.depreciationAccountId) : null;
            return {
                ...asset,
                assigneeName: (assignee as any)?.name ?? "En Stock",
                accountingAccountCode: (accountingAccount as any)?.code,
                depreciationAccountCode: (depreciationAccount as any)?.code,
            };
        }));
    }
});

export const addHardwareAsset = mutation({
    args: {
        serialNumber: v.string(),
        type: v.union(v.literal("laptop"), v.literal("desktop"), v.literal("monitor"), v.literal("mobile"), v.literal("networking")),
        model: v.string(),
        purchaseDate: v.number(),
        value: v.number(),
        accountingAccountId: v.optional(v.id("accountingAccounts")),
        depreciationAccountId: v.optional(v.id("accountingAccounts")),
    },
    handler: async (ctx, args) => {
        const assetId = await ctx.db.insert("hardwareAssets", {
            ...args,
            status: "available",
        });

        // Automatización contable si se vincula cuenta
        if (args.accountingAccountId && args.value > 0) {
            const period = await getCurrentPeriod(ctx);
            const admin = await ctx.db.query("users").filter(q => q.eq(q.field("role"), "admin")).first();
            const assetAccount = await ctx.db.get(args.accountingAccountId);
            const liabilityAccount = await ctx.db.query("accountingAccounts").filter(q => q.eq(q.field("code"), "4212")).first();

            if (period && admin && assetAccount && liabilityAccount) {
                await internalCreateJournalEntry(ctx, {
                    date: new Date(args.purchaseDate).toISOString().split('T')[0],
                    periodId: period._id,
                    description: `Adquisición de Activo TI: ${args.model} (S/N: ${args.serialNumber})`,
                    type: "operacion",
                    createdBy: admin._id,
                    sourceModule: "assets",
                    sourceId: assetId,
                    lines: [
                        {
                            accountId: assetAccount._id,
                            accountCode: assetAccount.code,
                            debit: args.value,
                            credit: 0,
                            description: `Activo fijo: ${args.model}`
                        },
                        {
                            accountId: liabilityAccount._id,
                            accountCode: liabilityAccount.code,
                            debit: 0,
                            credit: args.value,
                            description: `Obligación por compra de activo`
                        }
                    ]
                });
            }
        }

        return assetId;
    }
});

export const updateHardwareStatus = mutation({
    args: {
        assetId: v.id("hardwareAssets"),
        status: v.union(v.literal("available"), v.literal("assigned"), v.literal("maintenance"), v.literal("retired")),
        assignedTo: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.patch(args.assetId, {
            status: args.status,
            assignedTo: args.assignedTo !== undefined ? args.assignedTo : undefined
        });
    }
});

// ==========================================
// SOFTWARE LICENSES
// ==========================================

export const getSoftwareLicenses = query({
    handler: async (ctx) => {
        const licenses = await ctx.db.query("softwareLicenses").order("desc").collect();
        return await Promise.all(licenses.map(async (license) => {
            const users = await Promise.all(license.assignedUsers.map(id => ctx.db.get(id)));
            return {
                ...license,
                assignedNames: users.map(u => u?.name ?? "Unknown"),
            };
        }));
    }
});

export const addSoftwareLicense = mutation({
    args: {
        softwareName: v.string(),
        provider: v.string(),
        licenseType: v.union(v.literal("user"), v.literal("device"), v.literal("site")),
        totalLicenses: v.number(),
        expirationDate: v.optional(v.number()),
        costPerUser: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("softwareLicenses", {
            ...args,
            assignedUsers: [],
        });
    }
});

export const assignLicense = mutation({
    args: {
        licenseId: v.id("softwareLicenses"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const license = await ctx.db.get(args.licenseId);
        if (!license) throw new Error("License not found");

        if (license.assignedUsers.length >= license.totalLicenses) {
            throw new Error("No available seats for this license");
        }

        if (license.assignedUsers.includes(args.userId)) {
            throw new Error("User already assigned to this license");
        }

        const newAssigned = [...license.assignedUsers, args.userId];
        return await ctx.db.patch(args.licenseId, { assignedUsers: newAssigned });
    }
});

export const unassignLicense = mutation({
    args: {
        licenseId: v.id("softwareLicenses"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const license = await ctx.db.get(args.licenseId);
        if (!license) throw new Error("License not found");

        const newAssigned = license.assignedUsers.filter(id => id !== args.userId);
        return await ctx.db.patch(args.licenseId, { assignedUsers: newAssigned });
    }
});
