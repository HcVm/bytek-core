import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =============================================
// TICKETS DE SOPORTE — Portal de Clientes
// =============================================

export const getTicketsByClient = query({
    args: { clientId: v.id("clients") },
    handler: async (ctx, args) => {
        const tickets = await ctx.db.query("supportTickets")
            .withIndex("by_client", q => q.eq("clientId", args.clientId))
            .order("desc")
            .collect();

        return await Promise.all(tickets.map(async (t) => {
            const assignee = t.assignedTo ? await ctx.db.get(t.assignedTo) : null;
            return {
                ...t,
                assignedToName: assignee?.name || null,
            };
        }));
    }
});

export const getAllTickets = query({
    args: {
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let tickets = await ctx.db.query("supportTickets").order("desc").collect();

        if (args.status) {
            tickets = tickets.filter(t => t.status === args.status);
        }

        return await Promise.all(tickets.map(async (t) => {
            const client = await ctx.db.get(t.clientId);
            const assignee = t.assignedTo ? await ctx.db.get(t.assignedTo) : null;
            return {
                ...t,
                clientName: client?.companyName || "Desconocido",
                assignedToName: assignee?.name || null,
            };
        }));
    }
});

export const createTicket = mutation({
    args: {
        clientId: v.id("clients"),
        subject: v.string(),
        description: v.string(),
        priority: v.union(v.literal("baja"), v.literal("media"), v.literal("alta"), v.literal("critica")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("supportTickets", {
            ...args,
            status: "abierto",
            createdAt: Date.now(),
        });
    }
});

export const updateTicketStatus = mutation({
    args: {
        ticketId: v.id("supportTickets"),
        status: v.union(v.literal("abierto"), v.literal("en_progreso"), v.literal("resuelto"), v.literal("cerrado")),
        assignedTo: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const updates: Record<string, any> = { status: args.status };

        if (args.assignedTo) updates.assignedTo = args.assignedTo;
        if (args.status === "resuelto" || args.status === "cerrado") {
            updates.resolvedAt = Date.now();
        }

        await ctx.db.patch(args.ticketId, updates);
    }
});

export const deleteTicket = mutation({
    args: { ticketId: v.id("supportTickets") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.ticketId);
    }
});

// =============================================
// AUTOMATIZACIÓN DE SLAs Y PENALIDADES
// =============================================

export const checkSLAViolations = mutation({
    args: {},
    handler: async (ctx) => {
        // En un caso real, esto se ejecutaría periódicamente vía Convex Crons
        const now = Date.now();
        const activeTickets = await ctx.db.query("supportTickets")
            .filter(q => q.or(
                q.eq(q.field("status"), "abierto"),
                q.eq(q.field("status"), "en_progreso")
            )).collect();

        for (const ticket of activeTickets) {
            const timeElapsedHours = (now - ticket.createdAt) / (1000 * 60 * 60);

            // Definir límites SLA simplificados por prioridad
            let limitHours = 24;
            if (ticket.priority === "critica") limitHours = 2;
            else if (ticket.priority === "alta") limitHours = 4;
            else if (ticket.priority === "media") limitHours = 8;
            else if (ticket.priority === "baja") limitHours = 24;

            if (timeElapsedHours > limitHours) {
                // Generar impacto en módulo legal o contratos si sobrepasa SLA
                // Buscamos si el cliente tiene un contrato vigente
                const contracts = await ctx.db.query("legalDocuments")
                    .withIndex("by_client", q => q.eq("targetClientId", ticket.clientId))
                    .filter(q => q.eq(q.field("type"), "contrato_cliente"))
                    .collect();

                if (contracts.length > 0) {
                    const activeContract = contracts.find(c => c.status === "vigente");
                    if (activeContract) {
                        // Buscar el SLA de tiempo de respuesta para este contrato
                        const slas = await ctx.db.query("contractSLAs")
                            .filter(q => q.and(
                                q.eq(q.field("contractDocumentId"), activeContract._id),
                                q.eq(q.field("metricName"), "Tiempo de Resolución")
                            )).collect();

                        for (const sla of slas) {
                            // Marcar como incumplido si no estaba ya marcado
                            if (sla.isCompliant !== false) {
                                await ctx.db.patch(sla._id, {
                                    isCompliant: false,
                                    currentValue: timeElapsedHours,
                                });
                            }
                        }
                    }
                }
            }
        }
    }
});
