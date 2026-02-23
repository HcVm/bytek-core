import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ==========================================
// PORTAL DEL EMPLEADO (Perfil RRHH)
// ==========================================

export const getEmployeeProfile = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("employeeProfiles")
            .withIndex("by_user", q => q.eq("userId", args.userId))
            .first();
    }
});

export const upsertEmployeeProfile = mutation({
    args: {
        userId: v.id("users"),
        contractType: v.union(v.literal("planilla"), v.literal("honorarios"), v.literal("contratista")),
        baseSalary: v.number(),
        hireDate: v.number(),
        bankAccountDetails: v.optional(v.string()),
        emergencyContact: v.optional(v.string()),
        // Nuevos: Ciclo de vida y legajo
        status: v.optional(v.union(v.literal("activo"), v.literal("suspendido"), v.literal("vacaciones"), v.literal("licencia"), v.literal("cesado"))),
        documentId: v.optional(v.string()),
        birthDate: v.optional(v.number()),
        address: v.optional(v.string()),
        healthInsurance: v.optional(v.union(v.literal("essalud"), v.literal("eps"), v.literal("afp"), v.literal("onp"), v.literal("ninguno"))),
        terminationDate: v.optional(v.number()),
        terminationReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("employeeProfiles")
            .withIndex("by_user", q => q.eq("userId", args.userId))
            .first();

        // Limpiamos los args que son undefined para que Convex no se queje
        const patchData: any = {
            contractType: args.contractType,
            baseSalary: args.baseSalary,
            hireDate: args.hireDate,
            updatedAt: Date.now(),
        };
        if (args.bankAccountDetails !== undefined) patchData.bankAccountDetails = args.bankAccountDetails;
        if (args.emergencyContact !== undefined) patchData.emergencyContact = args.emergencyContact;
        if (args.status !== undefined) patchData.status = args.status;
        if (args.documentId !== undefined) patchData.documentId = args.documentId;
        if (args.birthDate !== undefined) patchData.birthDate = args.birthDate;
        if (args.address !== undefined) patchData.address = args.address;
        if (args.healthInsurance !== undefined) patchData.healthInsurance = args.healthInsurance;
        if (args.terminationDate !== undefined) patchData.terminationDate = args.terminationDate;
        if (args.terminationReason !== undefined) patchData.terminationReason = args.terminationReason;

        if (existing) {
            await ctx.db.patch(existing._id, patchData);

            // Repercutir estado cesado al Account (User)
            if (args.status === "cesado" || args.status === "suspendido") {
                await ctx.db.patch(args.userId, { active: false });
            } else if (args.status === "activo") {
                await ctx.db.patch(args.userId, { active: true });
            }

            return existing._id;
        } else {
            return await ctx.db.insert("employeeProfiles", {
                userId: args.userId,
                createdAt: Date.now(),
                ...patchData
            });
        }
    }
});

// ==========================================
// EXPEDIENTE DIGITAL Y STORAGE (Documentos)
// ==========================================

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const saveEmployeeDocument = mutation({
    args: {
        userId: v.id("users"),
        storageId: v.id("_storage"),
        fileType: v.union(v.literal("contrato"), v.literal("memorandum"), v.literal("identidad"), v.literal("certificado"), v.literal("boleta"), v.literal("otro")),
        title: v.string(),
        uploadedBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("employeeDocuments", {
            userId: args.userId,
            fileId: args.storageId,
            type: args.fileType,
            title: args.title,
            uploadDate: Date.now(),
            uploadedBy: args.uploadedBy,
        });
    }
});

export const getEmployeeDocuments = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const docs = await ctx.db
            .query("employeeDocuments")
            .withIndex("by_user", q => q.eq("userId", args.userId))
            .order("desc")
            .collect();

        // Map to include download URLs
        return Promise.all(
            docs.map(async (doc) => ({
                ...doc,
                url: await ctx.storage.getUrl(doc.fileId),
            }))
        );
    }
});

export const deleteEmployeeDocument = mutation({
    args: { documentId: v.id("employeeDocuments"), fileId: v.id("_storage") },
    handler: async (ctx, args) => {
        await ctx.storage.delete(args.fileId);
        await ctx.db.delete(args.documentId);
    }
});

// ==========================================
// ASISTENCIA Y RELOJ BIOMÉTRICO WEB
// ==========================================

export const getTodayAttendance = query({
    args: { userId: v.id("users"), date: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("attendances")
            .withIndex("by_user_date", q => q.eq("userId", args.userId).eq("date", args.date))
            .first();
    }
});

export const clockIn = mutation({
    args: {
        userId: v.id("users"),
        date: v.string(),
        notes: v.optional(v.string()),
        status: v.optional(v.union(v.literal("presente"), v.literal("tardanza"), v.literal("ausente"), v.literal("justificado"))),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("attendances")
            .withIndex("by_user_date", q => q.eq("userId", args.userId).eq("date", args.date))
            .first();

        if (existing) throw new Error("Ya marcaste asistencia hoy.");

        // Evaluar tardanza automática
        // Si la hora actual es > 9:15 AM por ejemplo, status = "tardanza"
        // Este cálculo es mejor pre-enviarlo desde el cliente o usar tz en el server
        const finalStatus = args.status || "presente";

        return await ctx.db.insert("attendances", {
            userId: args.userId,
            date: args.date,
            clockInTime: Date.now(),
            status: finalStatus,
            notes: args.notes,
        });
    }
});

export const clockOut = mutation({
    args: { attendanceId: v.id("attendances") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.attendanceId, {
            clockOutTime: Date.now(),
        });
    }
});

// ==========================================
// VACACIONES Y PERMISOS
// ==========================================

export const getMyLeaveRequests = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("leaveRequests")
            .withIndex("by_user", q => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    }
});

export const createLeaveRequest = mutation({
    args: {
        userId: v.id("users"),
        type: v.union(v.literal("vacaciones"), v.literal("enfermedad"), v.literal("personal"), v.literal("maternidad_paternidad")),
        startDate: v.number(),
        endDate: v.number(),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("leaveRequests", {
            ...args,
            status: "pendiente",
            createdAt: Date.now(),
        });
    }
});

// Vistas HR Admin (Pendientes de aprobación)
export const getPendingLeaveRequests = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("leaveRequests")
            .withIndex("by_status", q => q.eq("status", "pendiente"))
            .order("desc")
            .collect();
    }
});

export const resolveLeaveRequest = mutation({
    args: {
        requestId: v.id("leaveRequests"),
        managerId: v.id("users"),
        status: v.union(v.literal("aprobado"), v.literal("rechazado")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, {
            status: args.status,
            managerId: args.managerId,
        });
    }
});
