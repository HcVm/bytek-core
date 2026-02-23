import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Obtener oportunidades (con opción de filtrar por estado)
export const getOpportunities = query({
    args: {
        status: v.optional(v.union(
            v.literal("lead"),
            v.literal("presentation"),
            v.literal("negotiation"),
            v.literal("won"),
            v.literal("lost")
        )),
    },
    handler: async (ctx, args) => {
        let q = ctx.db.query("opportunities");

        if (args.status) {
            q = q.filter((q) => q.eq(q.field("status"), args.status));
        }

        const opportunities = await q.order("desc").collect();

        // Hacemos un join manual simple con clientes y paquetes para mostrar los nombres en el Kanban
        const populatedOpportunities = await Promise.all(
            opportunities.map(async (opp) => {
                const client = await ctx.db.get(opp.clientId);
                // NOTA: packageId es un string en el esquema actual, podríamos buscar en la tabla packages si lo usamos como ID
                return {
                    ...opp,
                    clientName: client?.companyName || "Cliente Desconocido",
                };
            })
        );

        return populatedOpportunities;
    },
});

// Crear nueva oportunidad
export const createOpportunity = mutation({
    args: {
        clientId: v.id("clients"),
        assignedTo: v.id("users"), // Requerido por el esquema
        serviceUnit: v.union(v.literal("digital"), v.literal("solutions"), v.literal("infra")),
        packageId: v.string(), // "despegue_digital", etc.
        estimatedValue: v.number(),
        status: v.union(
            v.literal("lead"),
            v.literal("presentation"),
            v.literal("negotiation"),
            v.literal("won"),
            v.literal("lost")
        ),
        expectedCloseDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("opportunities", args);
    },
});

// Actualizar oportunidad (Útil para arrastrar en el Kanban)
export const updateOpportunity = mutation({
    args: {
        id: v.id("opportunities"),
        status: v.optional(v.union(
            v.literal("lead"),
            v.literal("presentation"),
            v.literal("negotiation"),
            v.literal("won"),
            v.literal("lost")
        )),
        estimatedValue: v.optional(v.number()),
        assignedTo: v.optional(v.id("users")),
        clientId: v.optional(v.id("clients")),
        packageId: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const prevOpp = await ctx.db.get(id);

        await ctx.db.patch(id, updates);

        // Disparador CASCADA: Si pasa a ganada, inyectar el proyecto a Operaciones automáticamente
        if (updates.status === "won" && prevOpp?.status !== "won") {
            const client = await ctx.db.get(prevOpp!.clientId);

            // Verificar si ya tiene proyecto creado para no duplicar
            const existingProjects = await ctx.db.query("projects")
                .filter((q) => q.eq(q.field("opportunityId"), id))
                .collect();

            if (existingProjects.length === 0) {
                await ctx.db.insert("projects", {
                    clientId: prevOpp!.clientId,
                    opportunityId: id,
                    title: `Proyecto: ${client?.companyName || 'Nuevo Cliente'} - ${updates.packageId || prevOpp!.packageId}`,
                    status: "planning",
                    milestones: [
                        { name: "Adelanto Inicial (50%)", percentage: 50, isPaid: false },
                        { name: "Entrega Final (50%)", percentage: 50, isPaid: false }
                    ]
                });
            }
        }
    },
});

// Eliminar
export const deleteOpportunity = mutation({
    args: { id: v.id("opportunities") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
