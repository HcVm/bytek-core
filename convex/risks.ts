import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Obtener riesgos de un proyecto
export const getRisksByProject = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const risks = await ctx.db
            .query("projectRisks")
            .withIndex("by_project", q => q.eq("projectId", args.projectId))
            .order("desc")
            .collect();

        return Promise.all(
            risks.map(async (risk) => {
                const owner = await ctx.db.get(risk.ownerId);
                return { ...risk, ownerName: owner?.name || "Sin asignar" };
            })
        );
    }
});

// Obtener todos los riesgos (para vista global)
export const getAllRisks = query({
    handler: async (ctx) => {
        const risks = await ctx.db.query("projectRisks").order("desc").collect();
        return Promise.all(
            risks.map(async (risk) => {
                const project = await ctx.db.get(risk.projectId);
                const owner = await ctx.db.get(risk.ownerId);
                return {
                    ...risk,
                    projectTitle: project?.title || "Proyecto Desconocido",
                    ownerName: owner?.name || "Sin asignar",
                };
            })
        );
    }
});

// Crear un nuevo riesgo
export const createRisk = mutation({
    args: {
        projectId: v.id("projects"),
        title: v.string(),
        description: v.optional(v.string()),
        probability: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
        impact: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
        status: v.union(v.literal("identified"), v.literal("mitigating"), v.literal("resolved"), v.literal("accepted")),
        mitigation: v.optional(v.string()),
        ownerId: v.id("users"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("projectRisks", {
            ...args,
            createdAt: Date.now(),
        });
    }
});

// Actualizar un riesgo
export const updateRisk = mutation({
    args: {
        id: v.id("projectRisks"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        probability: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical"))),
        impact: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical"))),
        status: v.optional(v.union(v.literal("identified"), v.literal("mitigating"), v.literal("resolved"), v.literal("accepted"))),
        mitigation: v.optional(v.string()),
        ownerId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
    }
});

// Eliminar riesgo
export const deleteRisk = mutation({
    args: { id: v.id("projectRisks") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    }
});
