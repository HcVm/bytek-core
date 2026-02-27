import { query } from "./_generated/server";
import { v } from "convex/values";

export const getOverviewMetrics = query({
    args: {},
    handler: async (ctx) => {
        // 1. Proyectos Activos
        const allProjects = await ctx.db.query("projects").collect();
        const activeProjects = allProjects.filter((p) => p.status !== "completed").length;

        // 2. Tickets Abiertos
        const allTickets = await ctx.db.query("supportTickets").collect();
        const openTickets = allTickets.filter((t) => t.status === "abierto" || t.status === "en_progreso").length;

        // 3. Facturas Pendientes
        const allInvoices = await ctx.db.query("invoices").collect();
        const pendingInvoices = allInvoices.filter((i) => i.status === "pending");
        const pendingInvoicesAmount = pendingInvoices.reduce((acc, inv) => acc + inv.amount, 0);

        // 4. Actividad Reciente (Agregando de múltiples tablas)
        const recentActivity = [];

        // Recientes Tickets
        const recentTickets = await ctx.db.query("supportTickets").order("desc").take(5);
        for (const t of recentTickets) {
            recentActivity.push({
                id: t._id,
                type: "ticket",
                title: "Ticket de Soporte",
                description: t.subject,
                timestamp: t.createdAt || t._creationTime,
                color: "bg-amber-500",
            });
        }

        // Recientes Facturas Emitidas
        const recentInvoices = await ctx.db.query("invoices").order("desc").take(5);
        for (const i of recentInvoices) {
            recentActivity.push({
                id: i._id,
                type: "invoice",
                title: "Factura Emitida",
                description: `Monto: $${i.amount.toFixed(2)}`,
                timestamp: i._creationTime,
                color: "bg-emerald-500",
            });
        }

        // Recientes Proyectos
        const recentProjectsRecords = await ctx.db.query("projects").order("desc").take(5);
        for (const p of recentProjectsRecords) {
            recentActivity.push({
                id: p._id,
                type: "project",
                title: "Nuevo Proyecto",
                description: p.title,
                timestamp: p._creationTime,
                color: "bg-blue-500",
            });
        }

        // Recientes Leads (Oportunidades)
        const recentLeads = await ctx.db.query("opportunities").order("desc").take(5);
        for (const l of recentLeads) {
            const client = await ctx.db.get(l.clientId);
            recentActivity.push({
                id: l._id,
                type: "lead",
                title: "Nuevo Lead (CRM)",
                description: client ? client.companyName : "Cliente Desconocido",
                timestamp: l._creationTime,
                color: "bg-purple-500",
            });
        }

        // Ordenar y tomar los top 5
        recentActivity.sort((a, b) => b.timestamp - a.timestamp);
        const topRecentActivity = recentActivity.slice(0, 5);

        return {
            activeProjects,
            openTickets,
            pendingInvoicesCount: pendingInvoices.length,
            pendingInvoicesAmount,
            recentActivity: topRecentActivity,
        };
    },
});
