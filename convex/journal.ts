import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// =============================================
// HELPERS
// =============================================

export async function getCurrentPeriod(ctx: any) {
    const now = new Date();
    const period = await ctx.db.query("accountingPeriods")
        .withIndex("by_year_month", (q: any) => q.eq("year", now.getFullYear()).eq("month", now.getMonth() + 1))
        .first();
    return period;
}

// =============================================
// ASIENTOS CONTABLES (Journal Entries) — Partida Doble
// =============================================

export const internalCreateJournalEntry = async (ctx: any, args: {
    date: string;
    periodId: Id<"accountingPeriods">;
    description: string;
    type: "apertura" | "operacion" | "ajuste" | "cierre" | "reclasificacion";
    createdBy: Id<"users">;
    sourceModule?: string;
    sourceId?: string;
    lines: Array<{
        accountCode: string;
        accountId: Id<"accountingAccounts">;
        description?: string;
        debit: number;
        credit: number;
        costCenterId?: Id<"costCenters">;
        documentReference?: string;
    }>;
}) => {
    // 1. Validar que el periodo está abierto
    const period = await ctx.db.get(args.periodId);
    if (!period || period.status === "cerrado") {
        throw new Error("No se puede crear asientos en un período cerrado.");
    }

    // 2. Validar partida doble: debe = haber
    const totalDebit = args.lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = args.lines.reduce((sum, l) => sum + l.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error(`El asiento no cuadra. Debe: ${totalDebit.toFixed(2)}, Haber: ${totalCredit.toFixed(2)}. Diferencia: ${(totalDebit - totalCredit).toFixed(2)}`);
    }

    // 3. Validar que cada línea tiene debe O haber (no ambos, no ninguno)
    for (const line of args.lines) {
        if (line.debit > 0 && line.credit > 0) {
            throw new Error(`La cuenta ${line.accountCode} no puede tener monto al Debe y Haber simultáneamente.`);
        }
        if (line.debit === 0 && line.credit === 0) {
            throw new Error(`La cuenta ${line.accountCode} debe tener un monto al Debe o al Haber.`);
        }
    }

    // 4. Validar que las cuentas aceptan movimientos
    for (const line of args.lines) {
        const account = await ctx.db.get(line.accountId);
        if (!account) {
            throw new Error(`No se encontró la cuenta con código ${line.accountCode}.`);
        }
        if (!account.acceptsMovements) {
            throw new Error(`La cuenta ${line.accountCode} (${account.name}) no acepta movimientos directos. Use una subcuenta de detalle.`);
        }
    }

    // 5. Generar número de asiento correlativo
    const yearStr = args.date.substring(0, 4);
    const allEntries = await ctx.db.query("journalEntries")
        .filter((q: any) => q.gte(q.field("entryNumber"), `ASIENTO-${yearStr}-`))
        .collect();
    const nextNumber = String(allEntries.length + 1).padStart(6, "0");
    const entryNumber = `ASIENTO-${yearStr}-${nextNumber}`;

    // 6. Crear el asiento
    const entryId = await ctx.db.insert("journalEntries", {
        entryNumber,
        date: args.date,
        periodId: args.periodId,
        description: args.description,
        type: args.type,
        status: "borrador",
        sourceModule: args.sourceModule,
        sourceId: args.sourceId,
        createdBy: args.createdBy,
        totalDebit: Math.round(totalDebit * 100) / 100,
        totalCredit: Math.round(totalCredit * 100) / 100,
        createdAt: Date.now(),
    });

    // 7. Crear las líneas del asiento
    for (const line of args.lines) {
        await ctx.db.insert("journalEntryLines", {
            entryId,
            accountCode: line.accountCode,
            accountId: line.accountId,
            description: line.description,
            debit: Math.round(line.debit * 100) / 100,
            credit: Math.round(line.credit * 100) / 100,
            costCenterId: line.costCenterId,
            documentReference: line.documentReference,
        });
    }

    return { entryId, entryNumber };
};

export const createJournalEntry = mutation({
    args: {
        date: v.string(),
        periodId: v.id("accountingPeriods"),
        description: v.string(),
        type: v.union(v.literal("apertura"), v.literal("operacion"), v.literal("ajuste"), v.literal("cierre"), v.literal("reclasificacion")),
        createdBy: v.id("users"),
        sourceModule: v.optional(v.string()),
        sourceId: v.optional(v.string()),
        lines: v.array(v.object({
            accountCode: v.string(),
            accountId: v.id("accountingAccounts"),
            description: v.optional(v.string()),
            debit: v.number(),
            credit: v.number(),
            costCenterId: v.optional(v.id("costCenters")),
            documentReference: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        return await internalCreateJournalEntry(ctx, args);
    }
});

// =============================================
// APROBAR / CONTABILIZAR ASIENTO
// =============================================

export const approveJournalEntry = mutation({
    args: {
        entryId: v.id("journalEntries"),
        approvedBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        const entry = await ctx.db.get(args.entryId);
        if (!entry) throw new Error("Asiento no encontrado.");
        if (entry.status !== "borrador") {
            throw new Error(`Solo se pueden aprobar asientos en estado 'borrador'. Estado actual: ${entry.status}`);
        }

        await ctx.db.patch(args.entryId, {
            status: "contabilizado",
            approvedBy: args.approvedBy,
        });
    }
});

// =============================================
// ANULAR ASIENTO (Genera contraasiento)
// =============================================

export const voidJournalEntry = mutation({
    args: {
        entryId: v.id("journalEntries"),
        reason: v.string(),
        voidedBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        const entry = await ctx.db.get(args.entryId);
        if (!entry) throw new Error("Asiento no encontrado.");
        if (entry.status === "anulado") {
            throw new Error("Este asiento ya está anulado.");
        }

        // Marcar como anulado
        await ctx.db.patch(args.entryId, { status: "anulado" });

        // Obtener líneas originales
        const lines = await ctx.db.query("journalEntryLines")
            .withIndex("by_entry", q => q.eq("entryId", args.entryId))
            .collect();

        // Generar contraasiento (invirtiendo Debe/Haber)
        const yearStr = entry.date.substring(0, 4);
        const allEntries = await ctx.db.query("journalEntries")
            .filter((q: any) => q.gte(q.field("entryNumber"), `ASIENTO-${yearStr}-`))
            .collect();
        const nextNumber = String(allEntries.length + 1).padStart(6, "0");
        const entryNumber = `ASIENTO-${yearStr}-${nextNumber}`;

        const reverseId = await ctx.db.insert("journalEntries", {
            entryNumber,
            date: entry.date,
            periodId: entry.periodId,
            description: `ANULACIÓN: ${entry.description} — Motivo: ${args.reason}`,
            type: "ajuste",
            status: "contabilizado",
            sourceModule: "void",
            sourceId: entry._id,
            createdBy: args.voidedBy,
            approvedBy: args.voidedBy,
            totalDebit: entry.totalCredit, // Invertido
            totalCredit: entry.totalDebit, // Invertido
            createdAt: Date.now(),
        });

        // Crear líneas invertidas
        for (const line of lines) {
            await ctx.db.insert("journalEntryLines", {
                entryId: reverseId,
                accountCode: line.accountCode,
                accountId: line.accountId,
                description: `Anulación: ${line.description || ""}`,
                debit: line.credit,   // Invertido
                credit: line.debit,   // Invertido
                costCenterId: line.costCenterId,
                documentReference: line.documentReference,
            });
        }

        return { reverseEntryId: reverseId, reverseEntryNumber: entryNumber };
    }
});

// =============================================
// QUERIES: Libro Diario / Mayor
// =============================================

export const getJournalEntries = query({
    args: {
        periodId: v.optional(v.id("accountingPeriods")),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("journalEntries");

        let entries;
        if (args.periodId) {
            entries = await query
                .withIndex("by_period", q => q.eq("periodId", args.periodId!))
                .order("desc")
                .collect();
        } else {
            entries = await query.order("desc").collect();
        }

        if (args.status) {
            entries = entries.filter(e => e.status === args.status);
        }

        // Cargar datos del usuario para cada asiento
        return await Promise.all(entries.map(async (entry) => {
            const user = await ctx.db.get(entry.createdBy);
            return {
                ...entry,
                createdByName: user?.name || "Desconocido",
            };
        }));
    }
});

export const getJournalEntryDetail = query({
    args: { entryId: v.id("journalEntries") },
    handler: async (ctx, args) => {
        const entry = await ctx.db.get(args.entryId);
        if (!entry) throw new Error("Asiento no encontrado.");

        const lines = await ctx.db.query("journalEntryLines")
            .withIndex("by_entry", q => q.eq("entryId", args.entryId))
            .collect();

        const enrichedLines = await Promise.all(lines.map(async (line) => {
            const account = await ctx.db.get(line.accountId);
            let costCenterName = null;
            if (line.costCenterId) {
                const center = await ctx.db.get(line.costCenterId);
                costCenterName = center?.name;
            }
            return {
                ...line,
                accountName: account?.name || "Desconocida",
                costCenterName,
            };
        }));

        const user = await ctx.db.get(entry.createdBy);
        const period = await ctx.db.get(entry.periodId);

        return {
            ...entry,
            createdByName: user?.name || "Desconocido",
            period: period ? `${period.month}/${period.year}` : "N/A",
            lines: enrichedLines,
        };
    }
});

export const getGeneralLedger = query({
    args: {
        accountId: v.id("accountingAccounts"),
        periodId: v.optional(v.id("accountingPeriods")),
    },
    handler: async (ctx, args) => {
        const account = await ctx.db.get(args.accountId);
        if (!account) throw new Error("Cuenta no encontrada.");

        // Obtener todas las líneas para esta cuenta
        const allLines = await ctx.db.query("journalEntryLines")
            .withIndex("by_account", q => q.eq("accountId", args.accountId))
            .collect();

        // Filtrar por asientos contabilizados (y opcionalmente por periodo)
        const enrichedLines = [];
        let runningBalance = 0;

        for (const line of allLines) {
            const entry = await ctx.db.get(line.entryId);
            if (!entry || entry.status !== "contabilizado") continue;

            if (args.periodId && entry.periodId !== args.periodId) continue;

            // Calcular saldo acumulado según naturaleza de la cuenta
            if (account.nature === "deudora") {
                runningBalance += line.debit - line.credit;
            } else {
                runningBalance += line.credit - line.debit;
            }

            enrichedLines.push({
                ...line,
                entryNumber: entry.entryNumber,
                entryDate: entry.date,
                entryDescription: entry.description,
                runningBalance: Math.round(runningBalance * 100) / 100,
            });
        }

        const totalDebit = enrichedLines.reduce((sum, l) => sum + l.debit, 0);
        const totalCredit = enrichedLines.reduce((sum, l) => sum + l.credit, 0);

        return {
            account: {
                code: account.code,
                name: account.name,
                type: account.type,
                nature: account.nature,
            },
            movements: enrichedLines,
            totalDebit: Math.round(totalDebit * 100) / 100,
            totalCredit: Math.round(totalCredit * 100) / 100,
            balance: Math.round(runningBalance * 100) / 100,
        };
    }
});

// =============================================
// CIERRE DE PERÍODO AUTOMATIZADO
// =============================================

export const closePeriod = mutation({
    args: {
        periodId: v.id("accountingPeriods"),
        closedBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        const period = await ctx.db.get(args.periodId);
        if (!period) throw new Error("Periodo no encontrado.");
        if (period.status === "cerrado") throw new Error("Este periodo ya está cerrado.");

        // 1. Validar que no haya asientos en borrador
        const draftEntries = await ctx.db.query("journalEntries")
            .withIndex("by_period", q => q.eq("periodId", args.periodId))
            .filter(q => q.eq(q.field("status"), "borrador"))
            .collect();

        if (draftEntries.length > 0) {
            throw new Error(`Existen ${draftEntries.length} asientos en borrador. Contabilícelos o anúlelos antes de cerrar el periodo.`);
        }

        const allAccounts = await ctx.db.query("accountingAccounts").collect();
        const today = new Date().toISOString().split("T")[0];
        const yearStr = String(period.year);
        const allEntries = await ctx.db.query("journalEntries").collect();
        let entryCounter = allEntries.length + 1;

        const generatedEntries: string[] = [];

        // 2. DEPRECIACIÓN de activos fijos
        const activeAssets = await ctx.db.query("fixedAssets")
            .withIndex("by_active", q => q.eq("isActive", true))
            .collect();

        if (activeAssets.length > 0) {
            let totalDepreciation = 0;
            const depLines: Array<{ code: string; id: any; debit: number; credit: number; desc: string }> = [];

            for (const asset of activeAssets) {
                const monthlyDep = (asset.acquisitionCost - (asset.residualValue || 0)) / asset.usefulLifeMonths;
                const roundedDep = Math.round(monthlyDep * 100) / 100;

                if (asset.accumulatedDepreciation + roundedDep >= asset.acquisitionCost) continue;

                totalDepreciation += roundedDep;

                // Actualizar depreciación acumulada
                await ctx.db.patch(asset._id, {
                    accumulatedDepreciation: Math.round((asset.accumulatedDepreciation + roundedDep) * 100) / 100,
                });

                // Gasto de depreciación (68xx)
                const gastoAccount = allAccounts.find(a => a.code === "6814") || allAccounts.find(a => a.code.startsWith("681"));
                // Depreciación acumulada (39xx)
                const depAccount = await ctx.db.get(asset.depreciationAccountId);

                if (gastoAccount && depAccount) {
                    depLines.push({ code: gastoAccount.code, id: gastoAccount._id, debit: roundedDep, credit: 0, desc: `Depreciación ${asset.name}` });
                    depLines.push({ code: depAccount.code, id: depAccount._id, debit: 0, credit: roundedDep, desc: `Dep. acum. ${asset.name}` });
                }
            }

            if (depLines.length > 0 && totalDepreciation > 0) {
                const entryNumber = `ASIENTO-${yearStr}-${String(entryCounter++).padStart(6, "0")}`;
                const entryId = await ctx.db.insert("journalEntries", {
                    entryNumber,
                    date: today,
                    periodId: args.periodId,
                    description: `Provisión de depreciación — ${period.month}/${period.year}`,
                    type: "ajuste",
                    status: "contabilizado",
                    sourceModule: "closePeriod",
                    createdBy: args.closedBy,
                    approvedBy: args.closedBy,
                    totalDebit: Math.round(totalDepreciation * 100) / 100,
                    totalCredit: Math.round(totalDepreciation * 100) / 100,
                    createdAt: Date.now(),
                });

                for (const line of depLines) {
                    await ctx.db.insert("journalEntryLines", {
                        entryId,
                        accountCode: line.code,
                        accountId: line.id,
                        description: line.desc,
                        debit: line.debit,
                        credit: line.credit,
                    });
                }

                generatedEntries.push(entryNumber);
            }
        }

        // 3. RECLASIFICACIÓN: Cerrar cuentas ingreso/gasto a Resultado del Ejercicio (89)
        // Solo en cierre anual (mes 12 o 13)
        if (period.month >= 12) {
            const periodEntries = await ctx.db.query("journalEntries")
                .withIndex("by_period", q => q.eq("periodId", args.periodId))
                .filter(q => q.eq(q.field("status"), "contabilizado"))
                .collect();

            const accountBalances: Record<string, { id: any; code: string; type: string; nature: string; balance: number }> = {};

            for (const entry of periodEntries) {
                const lines = await ctx.db.query("journalEntryLines")
                    .withIndex("by_entry", q => q.eq("entryId", entry._id))
                    .collect();

                for (const line of lines) {
                    if (!accountBalances[line.accountCode]) {
                        const account = await ctx.db.get(line.accountId);
                        if (!account) continue;
                        accountBalances[line.accountCode] = {
                            id: line.accountId,
                            code: line.accountCode,
                            type: account.type,
                            nature: account.nature,
                            balance: 0,
                        };
                    }
                    const acc = accountBalances[line.accountCode];
                    if (acc.nature === "deudora") {
                        acc.balance += line.debit - line.credit;
                    } else {
                        acc.balance += line.credit - line.debit;
                    }
                }
            }

            // Cuentas de resultado (ingreso + gasto + costo)
            const resultAccounts = Object.values(accountBalances).filter(
                a => (a.type === "ingreso" || a.type === "gasto" || a.type === "costo") && Math.abs(a.balance) > 0.01
            );

            if (resultAccounts.length > 0) {
                const cuenta89 = allAccounts.find(a => a.code === "891");
                if (cuenta89) {
                    const reclasLines: Array<{ code: string; id: any; debit: number; credit: number; desc: string }> = [];
                    let totalResultado = 0;

                    for (const acc of resultAccounts) {
                        if (acc.type === "ingreso") {
                            // Cerrar ingreso: Debe ingreso, Haber resultado
                            reclasLines.push({ code: acc.code, id: acc.id, debit: acc.balance, credit: 0, desc: `Cierre cuenta ${acc.code}` });
                            totalResultado += acc.balance;
                        } else {
                            // Cerrar gasto/costo: Haber gasto, Debe resultado
                            reclasLines.push({ code: acc.code, id: acc.id, debit: 0, credit: acc.balance, desc: `Cierre cuenta ${acc.code}` });
                            totalResultado -= acc.balance;
                        }
                    }

                    // Línea del resultado del ejercicio
                    if (totalResultado > 0) {
                        reclasLines.push({ code: "891", id: cuenta89._id, debit: 0, credit: totalResultado, desc: "Resultado del Ejercicio — Utilidad" });
                    } else {
                        reclasLines.push({ code: "891", id: cuenta89._id, debit: Math.abs(totalResultado), credit: 0, desc: "Resultado del Ejercicio — Pérdida" });
                    }

                    const totalDebit = reclasLines.reduce((s, l) => s + l.debit, 0);
                    const totalCredit = reclasLines.reduce((s, l) => s + l.credit, 0);

                    const entryNumber = `ASIENTO-${yearStr}-${String(entryCounter++).padStart(6, "0")}`;
                    const entryId = await ctx.db.insert("journalEntries", {
                        entryNumber,
                        date: today,
                        periodId: args.periodId,
                        description: `Cierre de cuentas de resultado — ${period.year}`,
                        type: "cierre",
                        status: "contabilizado",
                        sourceModule: "closePeriod",
                        createdBy: args.closedBy,
                        approvedBy: args.closedBy,
                        totalDebit: Math.round(totalDebit * 100) / 100,
                        totalCredit: Math.round(totalCredit * 100) / 100,
                        createdAt: Date.now(),
                    });

                    for (const line of reclasLines) {
                        await ctx.db.insert("journalEntryLines", {
                            entryId,
                            accountCode: line.code,
                            accountId: line.id,
                            description: line.desc,
                            debit: Math.round(line.debit * 100) / 100,
                            credit: Math.round(line.credit * 100) / 100,
                        });
                    }

                    generatedEntries.push(entryNumber);
                }
            }
        }

        // 4. Cerrar el periodo
        await ctx.db.patch(args.periodId, {
            status: "cerrado",
            closedBy: args.closedBy,
            closedAt: Date.now(),
        });

        return {
            closed: true,
            generatedEntries,
            message: `Periodo ${period.month}/${period.year} cerrado exitosamente. ${generatedEntries.length} asientos automáticos generados.`
        };
    }
});

export const reopenPeriod = mutation({
    args: {
        periodId: v.id("accountingPeriods"),
    },
    handler: async (ctx, args) => {
        const period = await ctx.db.get(args.periodId);
        if (!period) throw new Error("Periodo no encontrado.");
        if (period.status === "abierto") throw new Error("El periodo ya está abierto.");

        await ctx.db.patch(args.periodId, {
            status: "abierto",
            closedBy: undefined,
            closedAt: undefined,
        });

        return { reopened: true };
    }
});
