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

// ==========================================
// MOTOR DE NÓMINA — Cálculo Automático
// ==========================================

// UIT 2026 = S/ 5,350
const UIT_2026 = 5350;

/**
 * Calcula IR 5ta Categoría anual y devuelve el mensual.
 * Escalas progresivas (Perú):
 * - Hasta 5 UIT: 8%
 * - 5-20 UIT: 14%
 * - 20-35 UIT: 17%
 * - 35-45 UIT: 20%
 * - +45 UIT: 30%
 */
function calculateIR5ta(annualGross: number): number {
    // Deducción de 7 UIT anuales
    const deduction7UIT = 7 * UIT_2026;
    const taxableIncome = Math.max(0, annualGross - deduction7UIT);

    if (taxableIncome <= 0) return 0;

    let tax = 0;
    const brackets = [
        { limit: 5 * UIT_2026, rate: 0.08 },
        { limit: 20 * UIT_2026, rate: 0.14 },
        { limit: 35 * UIT_2026, rate: 0.17 },
        { limit: 45 * UIT_2026, rate: 0.20 },
        { limit: Infinity, rate: 0.30 },
    ];

    let remaining = taxableIncome;
    let previousLimit = 0;

    for (const bracket of brackets) {
        const bracketSize = bracket.limit - previousLimit;
        const taxableInBracket = Math.min(remaining, bracketSize);
        tax += taxableInBracket * bracket.rate;
        remaining -= taxableInBracket;
        previousLimit = bracket.limit;
        if (remaining <= 0) break;
    }

    // Retorno mensual (dividido entre 12)
    return Math.round((tax / 12) * 100) / 100;
}

export const runPayroll = mutation({
    args: {
        periodMonth: v.number(),
        periodYear: v.number(),
        executedBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Verificar que no exista planilla para este periodo
        const existingRuns = await ctx.db.query("payrollRuns").collect();
        const alreadyExists = existingRuns.find(r =>
            r.period === `${args.periodYear}-${String(args.periodMonth).padStart(2, "0")}`
        );
        if (alreadyExists) {
            throw new Error(`Ya existe una planilla para ${args.periodMonth}/${args.periodYear}.`);
        }

        // Obtener empleados activos en planilla
        const employees = await ctx.db.query("employeeProfiles").collect();
        const activeEmployees = employees.filter(e => e.status === "activo" && e.contractType === "planilla");

        if (activeEmployees.length === 0) {
            throw new Error("No hay empleados activos en planilla.");
        }

        // Crear el run
        const periodStr = `${args.periodYear}-${String(args.periodMonth).padStart(2, "0")}`;
        const payrollRunId = await ctx.db.insert("payrollRuns", {
            period: periodStr,
            periodMonth: args.periodMonth,
            periodYear: args.periodYear,
            status: "borrador",
            totalGross: 0,
            totalDeductions: 0,
            totalNet: 0,
            totalAmount: 0,
            employeeCount: activeEmployees.length,
            executedBy: args.executedBy,
            createdAt: Date.now(),
        });

        let totalGross = 0;
        let totalDeductions = 0;
        let totalNet = 0;
        let totalEsSalud = 0;

        for (const emp of activeEmployees) {
            const grossSalary = emp.baseSalary || 0;
            const annualGross = grossSalary * 12; // Simplificación: 12 meses

            // EsSalud (9% aporte patronal — NO descuenta al trabajador)
            const essaludAmount = Math.round(grossSalary * 0.09 * 100) / 100;

            // Pensión
            let pensionType: "onp" | "afp" | "ninguno" = "ninguno";
            let pensionAmount = 0;

            if (emp.healthInsurance === "onp") {
                pensionType = "onp";
                pensionAmount = Math.round(grossSalary * 0.13 * 100) / 100;
            } else if (emp.healthInsurance === "afp") {
                pensionType = "afp";
                pensionAmount = Math.round(grossSalary * 0.125 * 100) / 100; // Promedio AFP
            }

            // IR 5ta Categoría
            const incomeTaxAmount = calculateIR5ta(annualGross);

            // Neto = Bruto - Pensión - IR
            const netPay = Math.round((grossSalary - pensionAmount - incomeTaxAmount) * 100) / 100;

            await ctx.db.insert("payrollDetails", {
                payrollRunId,
                userId: emp.userId,
                grossSalary,
                essaludAmount,
                pensionType,
                pensionAmount,
                incomeTaxAmount,
                netPay,
            });

            totalGross += grossSalary;
            totalDeductions += pensionAmount + incomeTaxAmount;
            totalNet += netPay;
            totalEsSalud += essaludAmount;
        }

        // Actualizar totales del run
        await ctx.db.patch(payrollRunId, {
            totalGross: Math.round(totalGross * 100) / 100,
            totalDeductions: Math.round(totalDeductions * 100) / 100,
            totalNet: Math.round(totalNet * 100) / 100,
            totalAmount: Math.round(totalNet * 100) / 100,
        });

        return {
            payrollRunId,
            employeeCount: activeEmployees.length,
            totalGross: Math.round(totalGross * 100) / 100,
            totalEsSalud: Math.round(totalEsSalud * 100) / 100,
            totalDeductions: Math.round(totalDeductions * 100) / 100,
            totalNet: Math.round(totalNet * 100) / 100,
        };
    }
});

export const getPayrollDetail = query({
    args: { payrollRunId: v.id("payrollRuns") },
    handler: async (ctx, args) => {
        const run = await ctx.db.get(args.payrollRunId);
        if (!run) throw new Error("Planilla no encontrada.");

        const details = await ctx.db.query("payrollDetails")
            .withIndex("by_payroll", q => q.eq("payrollRunId", args.payrollRunId))
            .collect();

        const enriched = await Promise.all(details.map(async (d) => {
            const user = await ctx.db.get(d.userId);
            return {
                ...d,
                employeeName: user?.name || "Desconocido",
            };
        }));

        return {
            run,
            details: enriched,
        };
    }
});

export const getPayrollRuns = query({
    handler: async (ctx) => {
        const runs = await ctx.db.query("payrollRuns").order("desc").collect();

        return await Promise.all(runs.map(async (run) => {
            const user = await ctx.db.get(run.executedBy);
            return {
                ...run,
                executedByName: user?.name || "Sistema",
            };
        }));
    }
});

export const markPayrollAsPaid = mutation({
    args: { payrollRunId: v.id("payrollRuns") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.payrollRunId, { status: "pagado" });
    }
});
