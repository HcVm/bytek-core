import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createRequest = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        fromUserId: v.id("users"),
        toDepartmentId: v.id("departments"),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
        requireApproval: v.optional(v.boolean()), // Flag if the sender explicitly asks for approval
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("internalRequests", {
            title: args.title,
            description: args.description,
            fromUserId: args.fromUserId,
            toDepartmentId: args.toDepartmentId,
            priority: args.priority,
            status: args.requireApproval ? "pending_approval" : "open",
            createdAt: Date.now(),
        });
    }
});

export const getRequestsReceivedByDepartment = query({
    args: {
        departmentId: v.id("departments")
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("internalRequests")
            .withIndex("by_target_department", q => q.eq("toDepartmentId", args.departmentId))
            .order("desc")
            .collect();
    }
});

export const getRequestsSentByUser = query({
    args: {
        userId: v.id("users")
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("internalRequests")
            .withIndex("by_creator", q => q.eq("fromUserId", args.userId))
            .order("desc")
            .collect();
    }
});

export const updateRequestStatus = mutation({
    args: {
        requestId: v.id("internalRequests"),
        status: v.union(v.literal("pending_approval"), v.literal("open"), v.literal("in_progress"), v.literal("resolved"), v.literal("rejected"), v.literal("closed")),
        assignedTo: v.optional(v.id("users")),
        approverId: v.optional(v.id("users")), // If status is changing from pending_approval to open/rejected
    },
    handler: async (ctx, args) => {
        const payload: any = { status: args.status };
        if (args.assignedTo) payload.assignedTo = args.assignedTo;

        if (args.status === "open" && args.approverId) {
            payload.isApproved = true;
            payload.approvedBy = args.approverId;
        } else if (args.status === "rejected" && args.approverId) {
            payload.isApproved = false;
            payload.approvedBy = args.approverId;
        }

        if (args.status === "resolved" || args.status === "closed" || args.status === "rejected") {
            payload.resolvedAt = Date.now();
        }
        await ctx.db.patch(args.requestId, payload);
    }
});

export const transferRequest = mutation({
    args: {
        requestId: v.id("internalRequests"),
        newDepartmentId: v.id("departments"),
        transferredBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Obtenemos el viejo departamento para el registro
        const request = await ctx.db.get(args.requestId);
        if (!request) throw new Error("Request no existe");

        // Lo cambiamos de departamento y le limpiamos al responsable (para que el nuevo depto lo asigne)
        await ctx.db.patch(args.requestId, {
            toDepartmentId: args.newDepartmentId,
            assignedTo: undefined,
        });

        // Opcional: El mensaje del sistema se inserta desde el UI usando createComment
    }
});

// =====================================
// CHAT & COMENTARIOS DEL TICKET
// =====================================

export const createComment = mutation({
    args: {
        requestId: v.id("internalRequests"),
        authorId: v.id("users"),
        content: v.string(),
        isSystemMessage: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("requestComments", {
            requestId: args.requestId,
            authorId: args.authorId,
            content: args.content,
            isSystemMessage: args.isSystemMessage || false,
            createdAt: Date.now(),
        });
    }
});

export const getCommentsForRequest = query({
    args: {
        requestId: v.id("internalRequests")
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("requestComments")
            .withIndex("by_request", q => q.eq("requestId", args.requestId))
            .order("asc")
            .collect();
    }
});
