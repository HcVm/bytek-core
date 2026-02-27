import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// 1. Obtener todas las conversaciones activas (clientes con mensajes)
export const getActiveConversations = query({
    args: {},
    handler: async (ctx) => {
        // En un caso real con muchísimos mensajes, esto debería optimizarse
        // o usar una tabla enlazada 'conversations' por cliente.
        // Por ahora, obtenemos todos los mensajes y agrupamos por cliente.
        const allMessages = await ctx.db.query("clientMessages").order("desc").collect();
        const clientIds = new Set<string>();
        const latestMessages: Record<string, any> = {};

        // Solo procesamos para obtener la lista única de clientes y el último mensaje
        for (const msg of allMessages) {
            if (!clientIds.has(msg.clientId)) {
                clientIds.add(msg.clientId);
                latestMessages[msg.clientId] = msg;
            }
        }

        const conversations = [];
        for (const clientId of Array.from(clientIds)) {
            const client = await ctx.db.get(clientId as any);
            if (client) {
                // Definimos un tipo que cubra tanto a "clients" (con companyName) como si se tratara de otro documento
                const clientDoc = client as any;
                conversations.push({
                    client: {
                        _id: clientDoc._id,
                        name: clientDoc.companyName || clientDoc.name || "Cliente Desconocido",
                    },
                    latestMessage: latestMessages[clientId],
                    // Se podría agregar unreadCount aquí calculándolo
                });
            }
        }

        // Ordenamos por hora del mensaje más reciente
        conversations.sort((a, b) => b.latestMessage.createdAt - a.latestMessage.createdAt);

        return conversations;
    }
});

// 2. Obtener historial de un cliente específico
export const getClientMessages = query({
    args: { clientId: v.id("clients") },
    handler: async (ctx, args) => {
        const messages = await ctx.db.query("clientMessages")
            .withIndex("by_client", q => q.eq("clientId", args.clientId))
            .order("asc") // Chat history standard order
            .collect();

        const enrichedMessages = await Promise.all(messages.map(async (msg) => {
            let fileUrl = undefined;
            if (msg.fileId) {
                fileUrl = await ctx.storage.getUrl(msg.fileId);
            }

            let senderName = "Administrador";
            if (msg.senderId) {
                const user = await ctx.db.get(msg.senderId);
                if (user) {
                    senderName = user.name || "Usuario BYTEK";
                }
            }

            return {
                ...msg,
                fileUrl,
                senderName
            };
        }));

        return enrichedMessages;
    }
});

// 3. Responder al cliente
export const replyToClientMessage = mutation({
    args: {
        clientId: v.id("clients"),
        senderId: v.optional(v.id("users")), // TODO: use contextual auth userId
        content: v.string(),
        type: v.union(v.literal("text"), v.literal("meeting")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("clientMessages", {
            ...args,
            isFromClient: false,
            createdAt: Date.now()
        });
    }
});

export const replyWithDocument = mutation({
    args: {
        clientId: v.id("clients"),
        senderId: v.optional(v.id("users")),
        content: v.string(),
        fileId: v.id("_storage"),
        fileName: v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("clientMessages", {
            clientId: args.clientId,
            senderId: args.senderId,
            isFromClient: false,
            content: args.content,
            type: "document",
            fileId: args.fileId,
            fileName: args.fileName,
            createdAt: Date.now()
        });
    }
});

export const generateAdminMessageUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});
