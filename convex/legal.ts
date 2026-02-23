import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const saveLegalDocument = mutation({
    args: {
        title: v.string(),
        type: v.union(v.literal("marca"), v.literal("copia_literal"), v.literal("vigencia_poder"), v.literal("carta_garantia"), v.literal("contrato_cliente"), v.literal("nda"), v.literal("otro")),
        storageId: v.id("_storage"),
        status: v.union(v.literal("vigente"), v.literal("tramite"), v.literal("vencido")),
        expirationDate: v.optional(v.number()),
        targetClientId: v.optional(v.id("clients")),
        targetProjectId: v.optional(v.id("projects")),
        uploadedBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("legalDocuments", {
            title: args.title,
            type: args.type,
            fileId: args.storageId,
            status: args.status,
            expirationDate: args.expirationDate,
            targetClientId: args.targetClientId,
            targetProjectId: args.targetProjectId,
            uploadedBy: args.uploadedBy,
            createdAt: Date.now(),
        });
    }
});

export const getLegalDocuments = query({
    args: {
        filterType: v.optional(v.union(v.literal("corporativo"), v.literal("comercial"))),
    },
    handler: async (ctx, args) => {
        let docs = await ctx.db.query("legalDocuments").order("desc").collect();

        if (args.filterType === "corporativo") {
            // Marcas, copias literales, poderes
            docs = docs.filter(d => ["marca", "copia_literal", "vigencia_poder"].includes(d.type));
        } else if (args.filterType === "comercial") {
            // Contratos, actas, cartas
            docs = docs.filter(d => ["carta_garantia", "contrato_cliente", "nda"].includes(d.type));
        }

        return Promise.all(
            docs.map(async (doc) => {
                const url = await ctx.storage.getUrl(doc.fileId);
                let clientName = null;
                if (doc.targetClientId) {
                    const client: any = await ctx.db.get(doc.targetClientId);
                    clientName = client?.name;
                }
                return { ...doc, url, clientName };
            })
        );
    }
});

export const getExpiringLegalDocuments = query({
    args: { daysThreshold: v.number() },
    handler: async (ctx, args) => {
        const thresholdMs = args.daysThreshold * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const limit = now + thresholdMs;

        const docs = await ctx.db
            .query("legalDocuments")
            // .withIndex("by_expiration") // No es rango directo hasta Convex 1.12, filtramos en memoria por versatilidad MVP
            .order("desc")
            .collect();

        // Filtrar aquellos que tienen expiración y caen dentro del umbral
        return docs.filter(d => d.expirationDate && d.expirationDate > now && d.expirationDate <= limit);
    }
});

export const deleteLegalDocument = mutation({
    args: { documentId: v.id("legalDocuments"), fileId: v.id("_storage") },
    handler: async (ctx, args) => {
        await ctx.storage.delete(args.fileId);
        await ctx.db.delete(args.documentId);
    }
});
