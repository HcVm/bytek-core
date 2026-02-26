import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =============================================
// PLAN CONTABLE GENERAL EMPRESARIAL (PCGE) — PERÚ
// Cuentas base para una empresa de tecnología
// =============================================

const PCGE_BASE_ACCOUNTS = [
    // CLASE 1: ACTIVO DISPONIBLE Y EXIGIBLE
    { code: "10", name: "Efectivo y Equivalentes de Efectivo", type: "activo" as const, level: 1, nature: "deudora" as const, acceptsMovements: false },
    { code: "101", name: "Caja", type: "activo" as const, level: 2, nature: "deudora" as const, parentCode: "10", acceptsMovements: false },
    { code: "1011", name: "Caja General", type: "activo" as const, level: 3, nature: "deudora" as const, parentCode: "101", acceptsMovements: true },
    { code: "1012", name: "Caja Chica", type: "activo" as const, level: 3, nature: "deudora" as const, parentCode: "101", acceptsMovements: true },
    { code: "104", name: "Cuentas Corrientes en Instituciones Financieras", type: "activo" as const, level: 2, nature: "deudora" as const, parentCode: "10", acceptsMovements: false },
    { code: "1041", name: "Cuentas Corrientes Operativas", type: "activo" as const, level: 3, nature: "deudora" as const, parentCode: "104", acceptsMovements: true },
    { code: "1042", name: "Cuentas Corrientes para Fines Específicos", type: "activo" as const, level: 3, nature: "deudora" as const, parentCode: "104", acceptsMovements: true },
    { code: "106", name: "Depósitos en Instituciones Financieras", type: "activo" as const, level: 2, nature: "deudora" as const, parentCode: "10", acceptsMovements: false },
    { code: "1061", name: "Depósitos de Ahorros", type: "activo" as const, level: 3, nature: "deudora" as const, parentCode: "106", acceptsMovements: true },

    // CLASE 12: CUENTAS POR COBRAR COMERCIALES
    { code: "12", name: "Cuentas por Cobrar Comerciales – Terceros", type: "activo" as const, level: 1, nature: "deudora" as const, acceptsMovements: false },
    { code: "121", name: "Facturas, Boletas y Otros Comprobantes por Cobrar", type: "activo" as const, level: 2, nature: "deudora" as const, parentCode: "12", acceptsMovements: false },
    { code: "1212", name: "Emitidas en Cartera", type: "activo" as const, level: 3, nature: "deudora" as const, parentCode: "121", acceptsMovements: true },

    // CLASE 14: CUENTAS POR COBRAR AL PERSONAL
    { code: "14", name: "Cuentas por Cobrar al Personal, Accionistas y Directores", type: "activo" as const, level: 1, nature: "deudora" as const, acceptsMovements: false },
    { code: "141", name: "Personal", type: "activo" as const, level: 2, nature: "deudora" as const, parentCode: "14", acceptsMovements: true },

    // CLASE 16: CUENTAS POR COBRAR DIVERSAS
    { code: "16", name: "Cuentas por Cobrar Diversas – Terceros", type: "activo" as const, level: 1, nature: "deudora" as const, acceptsMovements: false },
    { code: "162", name: "Reclamaciones a Terceros", type: "activo" as const, level: 2, nature: "deudora" as const, parentCode: "16", acceptsMovements: true },

    // CLASE 20: MERCADERÍAS (Inventario Hardware)
    { code: "20", name: "Mercaderías", type: "activo" as const, level: 1, nature: "deudora" as const, acceptsMovements: false },
    { code: "201", name: "Mercaderías Manufacturadas", type: "activo" as const, level: 2, nature: "deudora" as const, parentCode: "20", acceptsMovements: false },
    { code: "2011", name: "Equipos de Cómputo e Infraestructura", type: "activo" as const, level: 3, nature: "deudora" as const, parentCode: "201", acceptsMovements: true },

    // CLASE 33: INMUEBLE, MAQUINARIA Y EQUIPO
    { code: "33", name: "Inmuebles, Maquinaria y Equipo", type: "activo" as const, level: 1, nature: "deudora" as const, acceptsMovements: false },
    { code: "336", name: "Equipos Diversos", type: "activo" as const, level: 2, nature: "deudora" as const, parentCode: "33", acceptsMovements: false },
    { code: "3361", name: "Equipo para Procesamiento de Información", type: "activo" as const, level: 3, nature: "deudora" as const, parentCode: "336", acceptsMovements: true },

    // CLASE 37: ACTIVO DIFERIDO
    { code: "37", name: "Activo Diferido", type: "activo" as const, level: 1, nature: "deudora" as const, acceptsMovements: false },
    { code: "373", name: "Intereses Diferidos", type: "activo" as const, level: 2, nature: "deudora" as const, parentCode: "37", acceptsMovements: true },

    // CLASE 39: DEPRECIACIÓN Y AMORTIZACIÓN ACUMULADA
    { code: "39", name: "Depreciación, Amortización y Agotamiento Acumulados", type: "activo" as const, level: 1, nature: "acreedora" as const, acceptsMovements: false },
    { code: "391", name: "Depreciación Acumulada", type: "activo" as const, level: 2, nature: "acreedora" as const, parentCode: "39", acceptsMovements: false },
    { code: "3913", name: "Equipo para Procesamiento de Información - Depreciación", type: "activo" as const, level: 3, nature: "acreedora" as const, parentCode: "391", acceptsMovements: true },

    // CLASE 40: TRIBUTOS, CONTRAPRESTACIONES (IGV, IR)
    { code: "40", name: "Tributos, Contraprestaciones y Aportes al SPP y de Salud", type: "pasivo" as const, level: 1, nature: "acreedora" as const, acceptsMovements: false },
    { code: "401", name: "Gobierno Central", type: "pasivo" as const, level: 2, nature: "acreedora" as const, parentCode: "40", acceptsMovements: false },
    { code: "4011", name: "IGV – Cuenta Propia", type: "pasivo" as const, level: 3, nature: "acreedora" as const, parentCode: "401", acceptsMovements: false },
    { code: "40111", name: "IGV – Débito Fiscal", type: "pasivo" as const, level: 4, nature: "acreedora" as const, parentCode: "4011", acceptsMovements: true },
    { code: "40112", name: "IGV – Crédito Fiscal", type: "pasivo" as const, level: 4, nature: "deudora" as const, parentCode: "4011", acceptsMovements: true },
    { code: "4017", name: "Impuesto a la Renta", type: "pasivo" as const, level: 3, nature: "acreedora" as const, parentCode: "401", acceptsMovements: false },
    { code: "40171", name: "Renta de Tercera Categoría", type: "pasivo" as const, level: 4, nature: "acreedora" as const, parentCode: "4017", acceptsMovements: true },
    { code: "40173", name: "Pagos a Cuenta del IR", type: "pasivo" as const, level: 4, nature: "deudora" as const, parentCode: "4017", acceptsMovements: true },
    { code: "403", name: "Instituciones Públicas", type: "pasivo" as const, level: 2, nature: "acreedora" as const, parentCode: "40", acceptsMovements: false },
    { code: "4031", name: "EsSalud", type: "pasivo" as const, level: 3, nature: "acreedora" as const, parentCode: "403", acceptsMovements: true },
    { code: "4032", name: "ONP", type: "pasivo" as const, level: 3, nature: "acreedora" as const, parentCode: "403", acceptsMovements: true },
    { code: "407", name: "Administradoras de Fondo de Pensiones (AFP)", type: "pasivo" as const, level: 2, nature: "acreedora" as const, parentCode: "40", acceptsMovements: true },

    // CLASE 41: REMUNERACIONES Y PARTICIPACIONES POR PAGAR
    { code: "41", name: "Remuneraciones y Participaciones por Pagar", type: "pasivo" as const, level: 1, nature: "acreedora" as const, acceptsMovements: false },
    { code: "411", name: "Remuneraciones por Pagar", type: "pasivo" as const, level: 2, nature: "acreedora" as const, parentCode: "41", acceptsMovements: true },
    { code: "413", name: "Participaciones de los Trabajadores por Pagar", type: "pasivo" as const, level: 2, nature: "acreedora" as const, parentCode: "41", acceptsMovements: true },
    { code: "415", name: "Beneficios Sociales de los Trabajadores por Pagar", type: "pasivo" as const, level: 2, nature: "acreedora" as const, parentCode: "41", acceptsMovements: false },
    { code: "4151", name: "CTS", type: "pasivo" as const, level: 3, nature: "acreedora" as const, parentCode: "415", acceptsMovements: true },
    { code: "419", name: "Otras Remuneraciones y Participaciones por Pagar", type: "pasivo" as const, level: 2, nature: "acreedora" as const, parentCode: "41", acceptsMovements: true },

    // CLASE 42: CUENTAS POR PAGAR COMERCIALES
    { code: "42", name: "Cuentas por Pagar Comerciales – Terceros", type: "pasivo" as const, level: 1, nature: "acreedora" as const, acceptsMovements: false },
    { code: "421", name: "Facturas, Boletas y Otros Comprobantes por Pagar", type: "pasivo" as const, level: 2, nature: "acreedora" as const, parentCode: "42", acceptsMovements: false },
    { code: "4212", name: "Emitidas", type: "pasivo" as const, level: 3, nature: "acreedora" as const, parentCode: "421", acceptsMovements: true },

    // CLASE 45: OBLIGACIONES FINANCIERAS
    { code: "45", name: "Obligaciones Financieras", type: "pasivo" as const, level: 1, nature: "acreedora" as const, acceptsMovements: false },
    { code: "451", name: "Préstamos de Instituciones Financieras", type: "pasivo" as const, level: 2, nature: "acreedora" as const, parentCode: "45", acceptsMovements: true },

    // CLASE 46: CUENTAS POR PAGAR DIVERSAS
    { code: "46", name: "Cuentas por Pagar Diversas – Terceros", type: "pasivo" as const, level: 1, nature: "acreedora" as const, acceptsMovements: false },
    { code: "469", name: "Otras Cuentas por Pagar Diversas", type: "pasivo" as const, level: 2, nature: "acreedora" as const, parentCode: "46", acceptsMovements: true },

    // CLASE 50: CAPITAL
    { code: "50", name: "Capital", type: "patrimonio" as const, level: 1, nature: "acreedora" as const, acceptsMovements: false },
    { code: "501", name: "Capital Social", type: "patrimonio" as const, level: 2, nature: "acreedora" as const, parentCode: "50", acceptsMovements: true },

    // CLASE 58: RESERVAS
    { code: "58", name: "Reservas", type: "patrimonio" as const, level: 1, nature: "acreedora" as const, acceptsMovements: false },
    { code: "582", name: "Reserva Legal", type: "patrimonio" as const, level: 2, nature: "acreedora" as const, parentCode: "58", acceptsMovements: true },

    // CLASE 59: RESULTADOS ACUMULADOS
    { code: "59", name: "Resultados Acumulados", type: "patrimonio" as const, level: 1, nature: "acreedora" as const, acceptsMovements: false },
    { code: "591", name: "Utilidades No Distribuidas", type: "patrimonio" as const, level: 2, nature: "acreedora" as const, parentCode: "59", acceptsMovements: true },
    { code: "592", name: "Pérdidas Acumuladas", type: "patrimonio" as const, level: 2, nature: "deudora" as const, parentCode: "59", acceptsMovements: true },

    // CLASE 60: COMPRAS
    { code: "60", name: "Compras", type: "gasto" as const, level: 1, nature: "deudora" as const, acceptsMovements: false },
    { code: "601", name: "Mercaderías", type: "gasto" as const, level: 2, nature: "deudora" as const, parentCode: "60", acceptsMovements: false },
    { code: "6011", name: "Mercaderías Manufacturadas", type: "gasto" as const, level: 3, nature: "deudora" as const, parentCode: "601", acceptsMovements: true },

    // CLASE 62: GASTOS DE PERSONAL
    { code: "62", name: "Gastos de Personal, Directores y Gerentes", type: "gasto" as const, level: 1, nature: "deudora" as const, acceptsMovements: false },
    { code: "621", name: "Remuneraciones", type: "gasto" as const, level: 2, nature: "deudora" as const, parentCode: "62", acceptsMovements: false },
    { code: "6211", name: "Sueldos y Salarios", type: "gasto" as const, level: 3, nature: "deudora" as const, parentCode: "621", acceptsMovements: true },
    { code: "627", name: "Seguridad, Previsión Social y Otras Contribuciones", type: "gasto" as const, level: 2, nature: "deudora" as const, parentCode: "62", acceptsMovements: false },
    { code: "6271", name: "Régimen de Prestaciones de Salud (EsSalud)", type: "gasto" as const, level: 3, nature: "deudora" as const, parentCode: "627", acceptsMovements: true },
    { code: "629", name: "Beneficios Sociales de los Trabajadores", type: "gasto" as const, level: 2, nature: "deudora" as const, parentCode: "62", acceptsMovements: false },
    { code: "6291", name: "CTS", type: "gasto" as const, level: 3, nature: "deudora" as const, parentCode: "629", acceptsMovements: true },

    // CLASE 63: GASTOS DE SERVICIOS
    { code: "63", name: "Gastos de Servicios Prestados por Terceros", type: "gasto" as const, level: 1, nature: "deudora" as const, acceptsMovements: false },
    { code: "631", name: "Transporte, Correos y Gastos de Viaje", type: "gasto" as const, level: 2, nature: "deudora" as const, parentCode: "63", acceptsMovements: false },
    { code: "6311", name: "Transporte", type: "gasto" as const, level: 3, nature: "deudora" as const, parentCode: "631", acceptsMovements: true },
    { code: "6313", name: "Alojamiento y Viáticos", type: "gasto" as const, level: 3, nature: "deudora" as const, parentCode: "631", acceptsMovements: true },
    { code: "635", name: "Alquileres", type: "gasto" as const, level: 2, nature: "deudora" as const, parentCode: "63", acceptsMovements: false },
    { code: "6352", name: "Alquiler de Oficinas / Locales", type: "gasto" as const, level: 3, nature: "deudora" as const, parentCode: "635", acceptsMovements: true },
    { code: "636", name: "Servicios Básicos", type: "gasto" as const, level: 2, nature: "deudora" as const, parentCode: "63", acceptsMovements: false },
    { code: "6361", name: "Energía Eléctrica", type: "gasto" as const, level: 3, nature: "deudora" as const, parentCode: "636", acceptsMovements: true },
    { code: "6362", name: "Agua", type: "gasto" as const, level: 3, nature: "deudora" as const, parentCode: "636", acceptsMovements: true },
    { code: "6363", name: "Telefonía e Internet", type: "gasto" as const, level: 3, nature: "deudora" as const, parentCode: "636", acceptsMovements: true },
    { code: "637", name: "Publicidad, Publicaciones, Relaciones Públicas", type: "gasto" as const, level: 2, nature: "deudora" as const, parentCode: "63", acceptsMovements: false },
    { code: "6371", name: "Publicidad y Marketing", type: "gasto" as const, level: 3, nature: "deudora" as const, parentCode: "637", acceptsMovements: true },
    { code: "638", name: "Servicios de Contratistas", type: "gasto" as const, level: 2, nature: "deudora" as const, parentCode: "63", acceptsMovements: false },
    { code: "6381", name: "Servicios de Cloud Computing", type: "gasto" as const, level: 3, nature: "deudora" as const, parentCode: "638", acceptsMovements: true },
    { code: "6382", name: "Licencias de Software", type: "gasto" as const, level: 3, nature: "deudora" as const, parentCode: "638", acceptsMovements: true },

    // CLASE 65: OTROS GASTOS DE GESTIÓN
    { code: "65", name: "Otros Gastos de Gestión", type: "gasto" as const, level: 1, nature: "deudora" as const, acceptsMovements: false },
    { code: "651", name: "Seguros", type: "gasto" as const, level: 2, nature: "deudora" as const, parentCode: "65", acceptsMovements: true },
    { code: "656", name: "Suministros", type: "gasto" as const, level: 2, nature: "deudora" as const, parentCode: "65", acceptsMovements: true },
    { code: "659", name: "Otros Gastos de Gestión", type: "gasto" as const, level: 2, nature: "deudora" as const, parentCode: "65", acceptsMovements: true },

    // CLASE 67: GASTOS FINANCIEROS
    { code: "67", name: "Gastos Financieros", type: "gasto" as const, level: 1, nature: "deudora" as const, acceptsMovements: false },
    { code: "671", name: "Gastos en Operaciones de Endeudamiento", type: "gasto" as const, level: 2, nature: "deudora" as const, parentCode: "67", acceptsMovements: true },
    { code: "676", name: "Diferencia de Cambio", type: "gasto" as const, level: 2, nature: "deudora" as const, parentCode: "67", acceptsMovements: true },

    // CLASE 68: DEPRECIACIÓN
    { code: "68", name: "Valuación y Deterioro de Activos y Provisiones", type: "gasto" as const, level: 1, nature: "deudora" as const, acceptsMovements: false },
    { code: "681", name: "Depreciación", type: "gasto" as const, level: 2, nature: "deudora" as const, parentCode: "68", acceptsMovements: true },

    // CLASE 69: COSTO DE VENTAS
    { code: "69", name: "Costo de Ventas", type: "costo" as const, level: 1, nature: "deudora" as const, acceptsMovements: false },
    { code: "691", name: "Mercaderías", type: "costo" as const, level: 2, nature: "deudora" as const, parentCode: "69", acceptsMovements: false },
    { code: "6911", name: "Mercaderías Manufacturadas", type: "costo" as const, level: 3, nature: "deudora" as const, parentCode: "691", acceptsMovements: true },

    // CLASE 70: VENTAS
    { code: "70", name: "Ventas", type: "ingreso" as const, level: 1, nature: "acreedora" as const, acceptsMovements: false },
    { code: "701", name: "Mercaderías", type: "ingreso" as const, level: 2, nature: "acreedora" as const, parentCode: "70", acceptsMovements: false },
    { code: "7011", name: "Mercaderías Manufacturadas", type: "ingreso" as const, level: 3, nature: "acreedora" as const, parentCode: "701", acceptsMovements: true },
    { code: "704", name: "Prestación de Servicios", type: "ingreso" as const, level: 2, nature: "acreedora" as const, parentCode: "70", acceptsMovements: false },
    { code: "7041", name: "Servicios Digitales", type: "ingreso" as const, level: 3, nature: "acreedora" as const, parentCode: "704", acceptsMovements: true },
    { code: "7042", name: "Desarrollo de Software", type: "ingreso" as const, level: 3, nature: "acreedora" as const, parentCode: "704", acceptsMovements: true },
    { code: "7043", name: "Servicios de Infraestructura", type: "ingreso" as const, level: 3, nature: "acreedora" as const, parentCode: "704", acceptsMovements: true },
    { code: "7044", name: "Suscripciones SaaS", type: "ingreso" as const, level: 3, nature: "acreedora" as const, parentCode: "704", acceptsMovements: true },

    // CLASE 73: DESCUENTOS, REBAJAS
    { code: "73", name: "Descuentos, Rebajas y Bonificaciones Obtenidos", type: "ingreso" as const, level: 1, nature: "acreedora" as const, acceptsMovements: false },
    { code: "731", name: "Descuentos, Rebajas y Bonificaciones Obtenidos", type: "ingreso" as const, level: 2, nature: "acreedora" as const, parentCode: "73", acceptsMovements: true },

    // CLASE 77: INGRESOS FINANCIEROS
    { code: "77", name: "Ingresos Financieros", type: "ingreso" as const, level: 1, nature: "acreedora" as const, acceptsMovements: false },
    { code: "772", name: "Rendimientos Ganados", type: "ingreso" as const, level: 2, nature: "acreedora" as const, parentCode: "77", acceptsMovements: true },
    { code: "776", name: "Diferencia de Cambio", type: "ingreso" as const, level: 2, nature: "acreedora" as const, parentCode: "77", acceptsMovements: true },

    // CLASE 79: CARGAS IMPUTABLES (enlace con destino)
    { code: "79", name: "Cargas Imputables a Cuentas de Costos y Gastos", type: "ingreso" as const, level: 1, nature: "acreedora" as const, acceptsMovements: false },
    { code: "791", name: "Cargas Imputables a Cuentas de Costos y Gastos", type: "ingreso" as const, level: 2, nature: "acreedora" as const, parentCode: "79", acceptsMovements: true },

    // CLASE 94: GASTOS ADMINISTRATIVOS (Destino)
    { code: "94", name: "Gastos Administrativos", type: "gasto" as const, level: 1, nature: "deudora" as const, acceptsMovements: true },
    // CLASE 95: GASTOS DE VENTAS (Destino)
    { code: "95", name: "Gastos de Ventas", type: "gasto" as const, level: 1, nature: "deudora" as const, acceptsMovements: true },
];

// =============================================
// SEED: Pre-cargar Plan de Cuentas
// =============================================

export const seedChartOfAccounts = mutation({
    handler: async (ctx) => {
        // Verificar si ya hay cuentas cargadas
        const existing = await ctx.db.query("accountingAccounts").first();
        if (existing) {
            throw new Error("El Plan de Cuentas ya está cargado. Elimínelo primero si desea reinicializar.");
        }

        for (const acc of PCGE_BASE_ACCOUNTS) {
            await ctx.db.insert("accountingAccounts", {
                ...acc,
                isActive: true,
            });
        }

        return { inserted: PCGE_BASE_ACCOUNTS.length };
    }
});

// =============================================
// QUERIES: Plan de Cuentas
// =============================================

export const getChartOfAccounts = query({
    handler: async (ctx) => {
        return await ctx.db.query("accountingAccounts")
            .collect();
    }
});

export const getAccountsByType = query({
    args: { type: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db.query("accountingAccounts")
            .withIndex("by_type", q => q.eq("type", args.type as any))
            .filter(q => q.eq(q.field("isActive"), true))
            .collect();
    }
});

export const getMovementAccounts = query({
    handler: async (ctx) => {
        const all = await ctx.db.query("accountingAccounts")
            .filter(q => q.and(
                q.eq(q.field("acceptsMovements"), true),
                q.eq(q.field("isActive"), true)
            ))
            .collect();
        return all;
    }
});

export const getAccountByCode = query({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db.query("accountingAccounts")
            .withIndex("by_code", q => q.eq("code", args.code))
            .first();
    }
});

// =============================================
// MUTATIONS: Plan de Cuentas
// =============================================

export const createAccount = mutation({
    args: {
        code: v.string(),
        name: v.string(),
        type: v.union(v.literal("activo"), v.literal("pasivo"), v.literal("patrimonio"), v.literal("ingreso"), v.literal("gasto"), v.literal("costo"), v.literal("cuentas_orden")),
        parentCode: v.optional(v.string()),
        level: v.number(),
        acceptsMovements: v.boolean(),
        nature: v.union(v.literal("deudora"), v.literal("acreedora")),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Verificar unicidad del código
        const existing = await ctx.db.query("accountingAccounts")
            .withIndex("by_code", q => q.eq("code", args.code))
            .first();
        if (existing) {
            throw new Error(`Ya existe una cuenta con el código ${args.code}.`);
        }

        return await ctx.db.insert("accountingAccounts", {
            ...args,
            isActive: true,
        });
    }
});

export const updateAccount = mutation({
    args: {
        id: v.id("accountingAccounts"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const filtered = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
        await ctx.db.patch(id, filtered);
    }
});

// =============================================
// PERIODOS CONTABLES
// =============================================

export const getAccountingPeriods = query({
    handler: async (ctx) => {
        return await ctx.db.query("accountingPeriods").order("desc").collect();
    }
});

export const createAccountingPeriod = mutation({
    args: {
        year: v.number(),
        month: v.number(),
    },
    handler: async (ctx, args) => {
        // Verificar que no exista ya el periodo
        const existing = await ctx.db.query("accountingPeriods")
            .withIndex("by_year_month", q => q.eq("year", args.year).eq("month", args.month))
            .first();
        if (existing) {
            throw new Error(`El período ${args.month}/${args.year} ya existe.`);
        }

        return await ctx.db.insert("accountingPeriods", {
            year: args.year,
            month: args.month,
            status: "abierto",
        });
    }
});

export const closeAccountingPeriod = mutation({
    args: {
        periodId: v.id("accountingPeriods"),
        closedBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Verificar que no hay asientos en borrador
        const drafts = await ctx.db.query("journalEntries")
            .withIndex("by_period", q => q.eq("periodId", args.periodId))
            .filter(q => q.eq(q.field("status"), "borrador"))
            .collect();

        if (drafts.length > 0) {
            throw new Error(`No se puede cerrar el período. Hay ${drafts.length} asiento(s) en borrador.`);
        }

        await ctx.db.patch(args.periodId, {
            status: "cerrado",
            closedBy: args.closedBy,
            closedAt: Date.now(),
        });
    }
});

// =============================================
// CENTROS DE COSTO
// =============================================

export const getCostCenters = query({
    handler: async (ctx) => {
        return await ctx.db.query("costCenters").collect();
    }
});

export const createCostCenter = mutation({
    args: {
        code: v.string(),
        name: v.string(),
        type: v.union(v.literal("administrativo"), v.literal("operativo"), v.literal("proyecto")),
        projectId: v.optional(v.id("projects")),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("costCenters")
            .withIndex("by_code", q => q.eq("code", args.code))
            .first();
        if (existing) {
            throw new Error(`Ya existe un centro de costo con código ${args.code}.`);
        }

        return await ctx.db.insert("costCenters", {
            ...args,
            isActive: true,
        });
    }
});

// =============================================
// BALANCE DE COMPROBACIÓN (Trial Balance)
// =============================================

export const getTrialBalance = query({
    args: {
        periodId: v.optional(v.id("accountingPeriods")),
    },
    handler: async (ctx, args) => {
        // Obtener todas las líneas de asientos contabilizados
        let entries;
        if (args.periodId) {
            entries = await ctx.db.query("journalEntries")
                .withIndex("by_period", q => q.eq("periodId", args.periodId!))
                .filter(q => q.eq(q.field("status"), "contabilizado"))
                .collect();
        } else {
            entries = await ctx.db.query("journalEntries")
                .filter(q => q.eq(q.field("status"), "contabilizado"))
                .collect();
        }

        const entryIds = entries.map(e => e._id);

        // Sumar débitos y créditos por cuenta
        const balances: Record<string, { accountCode: string; accountName: string; type: string; totalDebit: number; totalCredit: number }> = {};

        for (const entryId of entryIds) {
            const lines = await ctx.db.query("journalEntryLines")
                .withIndex("by_entry", q => q.eq("entryId", entryId))
                .collect();

            for (const line of lines) {
                if (!balances[line.accountCode]) {
                    const account = await ctx.db.get(line.accountId);
                    balances[line.accountCode] = {
                        accountCode: line.accountCode,
                        accountName: account?.name || "Desconocida",
                        type: account?.type || "gasto",
                        totalDebit: 0,
                        totalCredit: 0,
                    };
                }
                balances[line.accountCode].totalDebit += line.debit;
                balances[line.accountCode].totalCredit += line.credit;
            }
        }

        const rows = Object.values(balances).sort((a, b) => a.accountCode.localeCompare(b.accountCode));
        const totalDebits = rows.reduce((sum, r) => sum + r.totalDebit, 0);
        const totalCredits = rows.reduce((sum, r) => sum + r.totalCredit, 0);

        return {
            rows,
            totalDebits: Math.round(totalDebits * 100) / 100,
            totalCredits: Math.round(totalCredits * 100) / 100,
            isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
        };
    }
});
