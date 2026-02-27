import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================
// PORTAL DEL CLIENTE — Dashboard Consolidado
// =============================================

export const getClientDashboardData = query({
    args: { clientId: v.id("clients") },
    handler: async (ctx, args) => {
        const client = await ctx.db.get(args.clientId);
        if (!client) throw new Error("Cliente no encontrado.");

        // Proyectos
        const projects = await ctx.db.query("projects")
            .filter(q => q.eq(q.field("clientId"), args.clientId))
            .collect();

        // Facturas
        const invoices = await ctx.db.query("invoices")
            .withIndex("by_client", q => q.eq("clientId", args.clientId))
            .collect();

        const allLegalDocs = await ctx.db.query("legalDocuments").collect();
        const legalDocs = allLegalDocs.filter((d: any) => d.clientId === args.clientId || d.targetClientId === args.clientId);

        const allInterventions = await ctx.db.query("fieldInterventions").collect();
        const interventions = allInterventions.filter((i: any) => i.clientId === args.clientId);

        // Tickets de soporte
        const tickets = await ctx.db.query("supportTickets")
            .withIndex("by_client", q => q.eq("clientId", args.clientId))
            .order("desc")
            .collect();

        const enrichedTickets = await Promise.all(tickets.map(async (t) => {
            const assignee = t.assignedTo ? await ctx.db.get(t.assignedTo) : null;
            return {
                ...t,
                assignedToName: assignee?.name || null,
            };
        }));

        // SLAs de contratos del cliente
        const slas: any[] = [];
        for (const doc of legalDocs) {
            const docSLAs = await ctx.db.query("contractSLAs")
                .withIndex("by_contract", q => q.eq("contractDocumentId", doc._id))
                .collect();
            for (const sla of docSLAs) {
                slas.push({
                    ...sla,
                    contractTitle: doc.title,
                });
            }
        }

        // Upcoming meetings (Pending and Confirmed)
        const meetings = await ctx.db.query("clientMessages")
            .withIndex("by_client", q => q.eq("clientId", args.clientId))
            .filter(q => q.eq(q.field("type"), "meeting"))
            .filter(q => q.or(q.eq(q.field("meetingStatus"), "pending"), q.eq(q.field("meetingStatus"), "confirmed")))
            .order("desc") // Most recently created or we could sort by meetingDate on frontend
            .collect();

        return {
            client: {
                name: client.companyName,
                contact: client.contactName,
                phone: client.phone,
                status: client.status
            },
            projects: projects.map(p => ({
                _id: p._id,
                title: p.title,
                status: p.status,
                milestoneCount: p.milestones.length,
                completedMilestones: p.milestones.filter(m => m.completedAt !== undefined).length,
            })),
            invoices: invoices.map(i => ({
                _id: i._id,
                amount: i.amount,
                status: i.status,
                billingType: i.billingType,
                dueDate: i.dueDate,
            })),
            contracts: legalDocs.map(d => ({
                _id: d._id,
                title: d.title,
                type: d.type,
                status: d.status,
            })),
            interventions: interventions.length,
            installedHardware: interventions.flatMap((i: any) => i.installedHardware || []),
            tickets: enrichedTickets,
            slas,
            upcomingMeetings: meetings.map(m => ({
                _id: m._id,
                title: m.meetingTitle,
                date: m.meetingDate,
                status: m.meetingStatus,
                link: m.meetingLink
            })),
            summary: {
                totalProjects: projects.length,
                activeProjects: projects.filter(p => p.status !== "completed").length,
                pendingInvoices: invoices.filter(i => i.status === "pending" || i.status === "overdue").length,
                totalInvoiced: invoices.reduce((s, i) => s + i.amount, 0),
                openTickets: tickets.filter(t => t.status === "abierto" || t.status === "en_progreso").length,
                slaCompliance: slas.length > 0
                    ? Math.round((slas.filter((s: any) => s.isCompliant).length / Math.max(1, slas.filter((s: any) => s.isCompliant !== undefined).length)) * 10000) / 100
                    : 100,
            }
        };
    }
});

// =============================================
// TICKETS — Creación desde Portal de Cliente
// =============================================

export const createClientTicket = mutation({
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

// =============================================
// BASE DE CONOCIMIENTO — Wiki para Clientes
// =============================================

export const getKnowledgeBase = query({
    args: {
        search: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const docs = await ctx.db.query("documents")
            .filter(q => q.eq(q.field("category"), "wiki"))
            .collect();

        let filtered = docs;
        if (args.search) {
            const searchLower = args.search.toLowerCase();
            filtered = docs.filter(d =>
                d.title.toLowerCase().includes(searchLower) ||
                (d.tags && d.tags.some(t => t.toLowerCase().includes(searchLower))) ||
                (d.content && d.content.toLowerCase().includes(searchLower))
            );
        }

        return filtered.map(d => ({
            _id: d._id,
            title: d.title,
            tags: d.tags || [],
            content: d.content || "",
            createdAt: d.createdAt,
        }));
    }
});

// =============================================
// COMUNICACIÓN (Mensajes, Documentos, Reuniones)
// =============================================

export const getMessages = query({
    args: { clientId: v.id("clients") },
    handler: async (ctx, args) => {
        const messages = await ctx.db.query("clientMessages")
            .withIndex("by_client", q => q.eq("clientId", args.clientId))
            .order("asc")
            .collect();

        // Enriquecer con URLs de archivos si es necesario y nombres de remitentes
        return await Promise.all(messages.map(async (m) => {
            let fileUrl = null;
            if (m.type === "document" && m.fileId) {
                fileUrl = await ctx.storage.getUrl(m.fileId);
            }

            let senderName = m.isFromClient ? "Cliente" : "BYTEK Support";
            if (!m.isFromClient && m.senderId) {
                const user = await ctx.db.get(m.senderId);
                if (user && user.name) {
                    senderName = user.name;
                }
            }

            return {
                ...m,
                fileUrl,
                senderName
            };
        }));
    }
});

export const sendMessage = mutation({
    args: {
        clientId: v.id("clients"),
        senderId: v.optional(v.id("users")),
        isFromClient: v.boolean(),
        content: v.string(),
        type: v.union(v.literal("text"), v.literal("meeting")),
        meetingDate: v.optional(v.number()),
        meetingTitle: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        let meetingStatus = undefined;
        if (args.type === "meeting") {
            meetingStatus = "pending";
        }

        return await ctx.db.insert("clientMessages", {
            ...args,
            meetingStatus: meetingStatus as any,
            createdAt: Date.now()
        });
    }
});

export const updateMeetingStatus = mutation({
    args: {
        messageId: v.id("clientMessages"),
        status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled"), v.literal("completed")),
        meetingLink: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (!message || message.type !== "meeting") throw new Error("Mensaje de reunión no válido.");

        const updates: any = { meetingStatus: args.status };
        if (args.meetingLink !== undefined) {
            updates.meetingLink = args.meetingLink;
        }

        return await ctx.db.patch(args.messageId, updates);
    }
});

export const generateMessageUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const sendDocumentMessage = mutation({
    args: {
        clientId: v.id("clients"),
        senderId: v.optional(v.id("users")),
        isFromClient: v.boolean(),
        content: v.string(),
        fileId: v.id("_storage"),
        fileName: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("clientMessages", {
            clientId: args.clientId,
            senderId: args.senderId,
            isFromClient: args.isFromClient,
            content: args.content,
            type: "document",
            fileId: args.fileId,
            fileName: args.fileName,
            createdAt: Date.now()
        });
    }
});

export const getMessageById = query({
    args: { messageId: v.id("clientMessages") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.messageId);
    }
});
