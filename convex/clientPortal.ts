import { query } from "./_generated/server";
import { v } from "convex/values";

// Obtiene todo el expediente del cliente consolidadamente
export const getClientDashboardData = query({
    args: { clientId: v.id("clients") },
    handler: async (ctx, args) => {
        // 1. Datos del Cliente
        const client = await ctx.db.get(args.clientId);
        if (!client) throw new Error("Cliente no encontrado en el sistema.");

        // 2. Proyectos (Activos y Completados)
        const allProjects = await ctx.db.query("projects").collect();
        const clientProjects = allProjects.filter(p => p.clientId === args.clientId);

        // 3. Facturación
        const allInvoices = await ctx.db.query("invoices").collect();
        const clientInvoices = allInvoices.filter(i => i.clientId === args.clientId);

        // 4. Garantías / Field Service (Traer equipos instalados)
        const clientProjectIds = clientProjects.map(p => p._id);
        const interventions = await ctx.db.query("fieldInterventions").collect();
        const clientInterventions = interventions.filter(i => clientProjectIds.includes(i.projectId) && i.status === "completed");

        // Extraemos solo los seriales que tienen las intervenciones cerradas como historial de hardware
        const installedHardwareSerials = clientInterventions.reduce((acc: string[], curr) => {
            if (curr.hardwareSerials && curr.hardwareSerials.length > 0) {
                return [...acc, ...curr.hardwareSerials];
            }
            return acc;
        }, []);

        return {
            client,
            projects: clientProjects,
            invoices: clientInvoices,
            installedHardware: installedHardwareSerials
        };
    },
});
