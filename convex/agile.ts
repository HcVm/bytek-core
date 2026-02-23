import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =====================================
// BOARDS (TABLEROS KANBAN)
// =====================================

export const getBoardsForUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        // En MVP buscamos todos los boards y luego filtramos en memoria por memberId
        // Para escalabilidad se requeriría un índice personalizado en array o una tabla relacional user_boards
        const allBoards = await ctx.db.query("boards").order("desc").collect();
        return allBoards.filter(board => board.memberIds.includes(args.userId) || board.ownerId === args.userId);
    }
});

export const getBoardById = query({
    args: { boardId: v.id("boards") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.boardId);
    }
});

export const createBoard = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        ownerId: v.id("users"),
        memberIds: v.array(v.id("users")), // Quienes van a participar (incluyendo el dueño opcionalmente)
    },
    handler: async (ctx, args) => {
        // Aseguramos que el owner esté también en los miembros para poder verlo
        const members = Array.from(new Set([...args.memberIds, args.ownerId]));

        return await ctx.db.insert("boards", {
            title: args.title,
            description: args.description,
            ownerId: args.ownerId,
            memberIds: members,
            createdAt: Date.now(),
        });
    }
});

// =====================================
// TASKS (INCIDENCIAS / HISTORIAS)
// =====================================

export const getTasksByBoard = query({
    args: { boardId: v.id("boards") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("tasks")
            .withIndex("by_board", q => q.eq("boardId", args.boardId))
            .order("desc") // Los mas recientes arriba, hasta que hagamos sorting manual
            .collect();
    }
});

export const createTask = mutation({
    args: {
        boardId: v.id("boards"),
        sprintId: v.optional(v.id("sprints")),
        title: v.string(),
        description: v.optional(v.string()),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
        type: v.union(v.literal("feature"), v.literal("bug"), v.literal("task"), v.literal("epic")),
        storyPoints: v.optional(v.number()),
        assigneeId: v.optional(v.id("users")),
        status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("review"), v.literal("done")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("tasks", {
            ...args,
            createdAt: Date.now(),
        });
    }
});

export const updateTaskFields = mutation({
    args: {
        taskId: v.id("tasks"),
        status: v.optional(v.union(v.literal("todo"), v.literal("in_progress"), v.literal("review"), v.literal("done"))),
        priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
        sprintId: v.optional(v.id("sprints")), // null to move back to backlog - we use undefined in convex mostly but we can patch
        assigneeId: v.optional(v.id("users")),
        githubPrLink: v.optional(v.string()),
        storyPoints: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { taskId, ...updates } = args;
        await ctx.db.patch(taskId, {
            ...updates,
            updatedAt: Date.now(),
        });
    }
});

export const updateTaskStatus = mutation({
    args: {
        taskId: v.id("tasks"),
        status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("review"), v.literal("done")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.taskId, {
            status: args.status,
            updatedAt: Date.now(),
        });
    }
});

// =====================================
// SPRINTS
// =====================================

export const getSprintsByBoard = query({
    args: { boardId: v.id("boards") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("sprints")
            .withIndex("by_board", q => q.eq("boardId", args.boardId))
            .order("desc")
            .collect();
    }
});

export const createSprint = mutation({
    args: {
        boardId: v.id("boards"),
        name: v.string(),
        goal: v.optional(v.string()),
        startDate: v.number(),
        endDate: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("sprints", {
            ...args,
            status: "planned",
            createdAt: Date.now(),
        });
    }
});

// =====================================
// MENSAJES DEL TABLERO (SLACK INTERNO)
// =====================================

export const getBoardMessages = query({
    args: { boardId: v.id("boards") },
    handler: async (ctx, args) => {
        // Por ahora devuelve el hilo global del board. 
        // Filtramos por taskId undefined asumiendo que es el chat general.
        return await ctx.db
            .query("boardMessages")
            .withIndex("by_board", q => q.eq("boardId", args.boardId))
            .filter(q => q.eq(q.field("taskId"), undefined))
            .order("asc") // Chat history: más antiguos primero para scroll
            .collect();
    }
});

export const sendBoardMessage = mutation({
    args: {
        boardId: v.id("boards"),
        authorId: v.id("users"),
        content: v.string(),
        taskId: v.optional(v.id("tasks")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("boardMessages", {
            boardId: args.boardId,
            authorId: args.authorId,
            content: args.content,
            taskId: args.taskId,
            createdAt: Date.now()
        });
    }
});
