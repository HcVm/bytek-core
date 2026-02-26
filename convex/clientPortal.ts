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
