import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getInterventions = query({
    args: {
        role: v.optional(v.string()), // "admin" o "technician"
        technicianId: v.optional(v.id("users"))
    },
    handler: async (ctx, args) => {
        let interventions = await ctx.db.query("fieldInterventions").collect();

        // Filtro si es técnico para ver solo sus propias visitas
        if (args.role === "technician" && args.technicianId) {
            interventions = interventions.filter(i => i.technicianId === args.technicianId);
        }

        // Popular datos relacionados (Proyecto y Cliente) para la UI
        const populated = await Promise.all(
            interventions.map(async (intervention) => {
                const project = await ctx.db.get(intervention.projectId);
                let clientName = "Cliente Desconocido";
                let projectTitle = "Proyecto Desconocido";

                if (project) {
                    projectTitle = project.title;
                    const client = await ctx.db.get(project.clientId);
                    if (client) clientName = client.companyName;
                }

                // Popular nombre del técnico
                const technician = await ctx.db.get(intervention.technicianId);
                const techName = technician ? technician.name : "Sin asignar";

                return {
                    ...intervention,
                    projectTitle,
                    clientName,
                    techName
                };
            })
        );
        return populated;
    },
});

export const createIntervention = mutation({
    args: {
        projectId: v.id("projects"),
        technicianId: v.id("users"),
        type: v.union(v.literal("installation"), v.literal("support"), v.literal("maintenance")),
        siteLocation: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("fieldInterventions", {
            projectId: args.projectId,
            technicianId: args.technicianId,
            type: args.type,
            siteLocation: args.siteLocation,
            status: "scheduled",
        });
    },
});

export const updateInterventionStatus = mutation({
    args: {
        id: v.id("fieldInterventions"),
        status: v.union(v.literal("scheduled"), v.literal("en_route"), v.literal("working"), v.literal("completed")),
        hardwareSerials: v.optional(v.array(v.string())), // Seriales extraídos/instalados
        evidencePhotosUrl: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const payload: any = { status: args.status };
        if (args.hardwareSerials) payload.hardwareSerials = args.hardwareSerials;
        if (args.evidencePhotosUrl) payload.evidencePhotosUrl = args.evidencePhotosUrl;

        await ctx.db.patch(args.id, payload);

        // Si cerró la orden con hardware, vamos a marcar los N° de Serie físicos como Instalados
        if (args.status === "completed" && args.hardwareSerials && args.hardwareSerials.length > 0) {
            const intervention = await ctx.db.get(args.id);
            if (intervention) {
                // Buscamos los serialNumbers en la DB de Inventario
                for (let serialStr of args.hardwareSerials) {
                    const sn = await ctx.db
                        .query("serialNumbers")
                        .withIndex("by_serial", q => q.eq("serial", serialStr))
                        .first();

                    if (sn && sn.status === "in_stock") {
                        // Cambiamos el estado y vinculamos al proyecto
                        await ctx.db.patch(sn._id, {
                            status: "installed",
                            assignedProjectId: intervention.projectId
                        });
                    }
                }
            }
        }
    },
});
