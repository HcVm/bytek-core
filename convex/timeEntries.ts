import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =============================================
// REGISTRO DE HORAS (Timesheets) — T&M Billing
// =============================================

export const getTimeEntries = query({
    args: {
        projectId: v.optional(v.id("projects")),
        userId: v.optional(v.id("users")),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let entries = await ctx.db.query("timeEntries").order("desc").collect();

        if (args.projectId) entries = entries.filter(e => e.projectId === args.projectId);
        if (args.userId) entries = entries.filter(e => e.userId === args.userId);
        if (args.status) entries = entries.filter(e => e.status === args.status);

        return await Promise.all(entries.map(async (entry) => {
            const user = await ctx.db.get(entry.userId);
            const project = await ctx.db.get(entry.projectId);
            return {
                ...entry,
                userName: user?.name || "Desconocido",
                projectName: project?.title || "Proyecto",
            };
        }));
    }
});

export const logTime = mutation({
    args: {
        userId: v.id("users"),
        projectId: v.id("projects"),
        taskId: v.optional(v.id("tasks")),
        date: v.string(),
        hours: v.number(),
        description: v.string(),
        billable: v.boolean(),
        hourlyRate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        if (args.hours <= 0 || args.hours > 24) {
            throw new Error("Las horas deben estar entre 0.1 y 24.");
        }

        return await ctx.db.insert("timeEntries", {
            ...args,
            status: "draft",
            createdAt: Date.now(),
        });
    }
});

export const approveTimeEntries = mutation({
    args: {
        entryIds: v.array(v.id("timeEntries")),
        approvedBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        for (const id of args.entryIds) {
            const entry = await ctx.db.get(id);
            if (!entry) continue;
            if (entry.status !== "draft") continue;

            await ctx.db.patch(id, {
                status: "approved",
                approvedBy: args.approvedBy,
            });
        }
        return { approved: args.entryIds.length };
    }
});

export const deleteTimeEntry = mutation({
    args: { id: v.id("timeEntries") },
    handler: async (ctx, args) => {
        const entry = await ctx.db.get(args.id);
        if (!entry) throw new Error("Entrada no encontrada.");
        if (entry.status !== "draft") throw new Error("Solo se pueden eliminar entradas en borrador.");
        await ctx.db.delete(args.id);
    }
});

// =============================================
// HORAS NO FACTURADAS (para generar factura T&M)
// =============================================

export const getUninvoicedTime = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const entries = await ctx.db.query("timeEntries")
            .withIndex("by_project", q => q.eq("projectId", args.projectId))
            .collect();

        const billableApproved = entries.filter(e => e.status === "approved" && e.billable);

        const totalHours = billableApproved.reduce((s, e) => s + e.hours, 0);
        const totalAmount = billableApproved.reduce((s, e) => s + (e.hours * (e.hourlyRate || 0)), 0);

        return {
            entries: billableApproved,
            totalHours: Math.round(totalHours * 100) / 100,
            totalAmount: Math.round(totalAmount * 100) / 100,
        };
    }
});

export const generateTMInvoice = mutation({
    args: {
        projectId: v.id("projects"),
        dueDate: v.number(),
    },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Proyecto no encontrado.");

        // Obtener horas aprobadas y facturables
        const entries = await ctx.db.query("timeEntries")
            .withIndex("by_project", q => q.eq("projectId", args.projectId))
            .collect();

        const billableApproved = entries.filter(e => e.status === "approved" && e.billable);

        if (billableApproved.length === 0) {
            throw new Error("No hay horas aprobadas y facturables para este proyecto.");
        }

        const totalAmount = billableApproved.reduce((s, e) => s + (e.hours * (e.hourlyRate || 0)), 0);

        // Crear factura
        const invoiceId = await ctx.db.insert("invoices", {
            clientId: project.clientId,
            projectId: args.projectId,
            amount: Math.round(totalAmount * 100) / 100,
            billingType: "time_materials",
            status: "pending",
            dueDate: args.dueDate,
            timeEntryIds: billableApproved.map(e => e._id),
        });

        // Marcar las entradas como facturadas
        for (const entry of billableApproved) {
            await ctx.db.patch(entry._id, { status: "invoiced" });
        }

        // Crear CxC automáticamente
        await ctx.db.insert("accountsReceivable", {
            clientId: project.clientId,
            invoiceId,
            documentType: "factura",
            documentNumber: `TM-${Date.now()}`,
            issueDate: new Date().toISOString().split("T")[0],
            dueDate: new Date(args.dueDate).toISOString().split("T")[0],
            originalAmount: Math.round(totalAmount * 100) / 100,
            pendingAmount: Math.round(totalAmount * 100) / 100,
            currency: "PEN",
            status: "pendiente",
        });

        return { invoiceId, totalAmount: Math.round(totalAmount * 100) / 100, entriesInvoiced: billableApproved.length };
    }
});
