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
        startDate: v.optional(v.number()),
        dueDate: v.optional(v.number()),
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
        sprintId: v.optional(v.id("sprints")),
        assigneeId: v.optional(v.id("users")),
        githubPrLink: v.optional(v.string()),
        storyPoints: v.optional(v.number()),
        startDate: v.optional(v.number()),
        dueDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { taskId, ...updates } = args;
        await ctx.db.patch(taskId, {
            ...updates,
            updatedAt: Date.now(),
        });
    }
});

// Backlog: Tareas sin sprint asignado
export const getBacklogTasks = query({
    args: { boardId: v.optional(v.id("boards")) },
    handler: async (ctx, args) => {
        let allTasks;
        if (args.boardId) {
            allTasks = await ctx.db.query("tasks")
                .withIndex("by_board", q => q.eq("boardId", args.boardId!))
                .collect();
        } else {
            allTasks = await ctx.db.query("tasks").collect();
        }
        // Filtrar las que NO tienen sprintId
        const backlogTasks = allTasks.filter(t => !t.sprintId);

        return Promise.all(
            backlogTasks.map(async (task) => {
                const assignee = task.assigneeId ? await ctx.db.get(task.assigneeId) : null;
                const board = await ctx.db.get(task.boardId);
                return { ...task, assigneeName: assignee?.name, boardTitle: board?.title };
            })
        );
    }
});

// Gantt: Tareas con fechas para renderizado temporal
export const getTasksForGantt = query({
    args: { boardId: v.id("boards") },
    handler: async (ctx, args) => {
        const tasks = await ctx.db.query("tasks")
            .withIndex("by_board", q => q.eq("boardId", args.boardId))
            .collect();

        // Solo las tareas que tengan al menos startDate
        const ganttTasks = tasks.filter(t => t.startDate);

        return Promise.all(
            ganttTasks.map(async (task) => {
                const assignee = task.assigneeId ? await ctx.db.get(task.assigneeId) : null;
                return { ...task, assigneeName: assignee?.name };
            })
        );
    }
});

// Gestión de Sprints
export const updateSprintStatus = mutation({
    args: {
        sprintId: v.id("sprints"),
        status: v.union(v.literal("planned"), v.literal("active"), v.literal("closed")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.sprintId, { status: args.status });
    }
});

export const assignTaskToSprint = mutation({
    args: {
        taskId: v.id("tasks"),
        sprintId: v.optional(v.id("sprints")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.taskId, { sprintId: args.sprintId, updatedAt: Date.now() });
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

export const getSprintsForUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const allBoards = await ctx.db.query("boards").collect();
        const userBoards = allBoards.filter(board => board.memberIds.includes(args.userId) || board.ownerId === args.userId);
        const boardIds = userBoards.map(b => b._id);

        const allSprints = await ctx.db.query("sprints").order("desc").collect();
        return allSprints.filter(sprint => boardIds.includes(sprint.boardId) && sprint.status !== "closed");
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
