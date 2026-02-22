import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getProjects = query({
    args: {},
    handler: async (ctx) => {
        const projects = await ctx.db.query("projects").order("desc").collect();
        // Resolvemos el nombre del cliente para mostrarlo
        return await Promise.all(
            projects.map(async (project) => {
                const client = await ctx.db.get(project.clientId);
                return {
                    ...project,
                    clientName: client?.companyName || "Cliente Desconocido",
                };
            })
        );
    },
});

export const getProject = query({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.id);
        if (!project) return null;

        const client = await ctx.db.get(project.clientId);
        return {
            ...project,
            clientName: client?.companyName || "Cliente Desconocido",
        };
    },
});

export const createProject = mutation({
    args: {
        clientId: v.id("clients"),
        opportunityId: v.id("opportunities"),
        title: v.string(),
        status: v.union(v.literal("planning"), v.literal("in_progress"), v.literal("review"), v.literal("completed")),
        milestones: v.array(v.object({
            name: v.string(),
            percentage: v.number(),
            isPaid: v.boolean(),
            completedAt: v.optional(v.number()),
        })),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("projects", args);
    },
});

export const updateProjectStatus = mutation({
    args: {
        id: v.id("projects"),
        status: v.union(v.literal("planning"), v.literal("in_progress"), v.literal("review"), v.literal("completed")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: args.status });
    },
});

export const updateProjectMilestones = mutation({
    args: {
        id: v.id("projects"),
        milestones: v.array(v.object({
            name: v.string(),
            percentage: v.number(),
            isPaid: v.boolean(),
            completedAt: v.optional(v.number()),
        })),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { milestones: args.milestones });
    },
});

export const deleteProject = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
