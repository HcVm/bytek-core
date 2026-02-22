import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Obtener todos los clientes
export const getClients = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("clients").order("desc").collect();
    },
});

// Crear nuevo cliente
export const createClient = mutation({
    args: {
        companyName: v.string(),
        taxId: v.string(), // RUC
        contactName: v.string(),
        phone: v.string(),
        status: v.string(), // "prospect", "active", "churned"
    },
    handler: async (ctx, args) => {
        if (!args.companyName || !args.taxId) {
            throw new Error("El nombre de la empresa y RUC/DNI son obligatorios");
        }

        const clientId = await ctx.db.insert("clients", {
            companyName: args.companyName,
            taxId: args.taxId,
            contactName: args.contactName,
            phone: args.phone,
            status: args.status,
        });

        return clientId;
    },
});

// Actualizar un cliente
export const updateClient = mutation({
    args: {
        id: v.id("clients"),
        companyName: v.optional(v.string()),
        taxId: v.optional(v.string()), // RUC
        contactName: v.optional(v.string()),
        phone: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Eliminar un cliente
export const deleteClient = mutation({
    args: { id: v.id("clients") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
