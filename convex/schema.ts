import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    ...authTables,
    // ==========================================
    // UNIDAD COMÚN (Gestión de Usuarios y Clientes)
    // ==========================================
    users: defineTable({
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        isAnonymous: v.optional(v.boolean()),
        role: v.optional(v.union(
            v.literal("admin"),
            v.literal("sales"),
            v.literal("technician"), // Unidad 3
            v.literal("developer"),  // Unidad 2
            v.literal("client")      // Portal autoservicio
        )),
        departmentId: v.optional(v.id("departments")),
        position: v.optional(v.string()), // Cargo (ej. Gerente General, Analista Contable)
        active: v.optional(v.boolean()),
    }).index("email", ["email"]),

    clients: defineTable({
        companyName: v.string(),
        taxId: v.string(), // RUC
        contactName: v.string(),
        phone: v.string(),
        status: v.string(), // "prospect", "active", "churned"
    }).index("taxId", ["taxId"]),

    // ==========================================
    // ESTRUCTURA ORGANIZACIONAL (ERP CORE)
    // ==========================================
    departments: defineTable({
        name: v.string(), // Ej: "Contabilidad", "Ventas", "Directorio"
        managerId: v.optional(v.id("users")), // Jefe del área
        description: v.optional(v.string()),
    }),

    documents: defineTable({
        title: v.string(),
        fileId: v.string(), // ID del archivo guardado en Convex Storage (o URL si es externo)
        uploadedBy: v.id("users"),
        departmentId: v.optional(v.id("departments")), // Si es undefined, es público para toda la empresa
        category: v.union(v.literal("policy"), v.literal("manual"), v.literal("memo"), v.literal("other")),
        createdAt: v.number(),
    }).index("by_department", ["departmentId"]),

    internalRequests: defineTable({ // Sistema de Tickets Internos (Workflows)
        title: v.string(),
        description: v.string(),
        fromUserId: v.id("users"),
        toDepartmentId: v.id("departments"), // Ticket asignado a un Área entera
        assignedTo: v.optional(v.id("users")), // Si algún técnico/analista ya tomó el ticket
        status: v.union(
            v.literal("pending_approval"), // <- Nuevo: Requiere Visto Bueno antes de ejecución
            v.literal("open"),
            v.literal("in_progress"),
            v.literal("resolved"),
            v.literal("rejected"),         // <- Nuevo: Gerencia denegó el ticket
            v.literal("closed")
        ),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
        createdAt: v.number(),
        resolvedAt: v.optional(v.number()),
        // Trazabilidad de Aprobación
        isApproved: v.optional(v.boolean()),
        approvedBy: v.optional(v.id("users")), // ID del Gerente que autorizó
    }).index("by_target_department", ["toDepartmentId"]).index("by_creator", ["fromUserId"]),

    requestComments: defineTable({ // Hilo de Conversación Interna de cada Ticket
        requestId: v.id("internalRequests"),
        authorId: v.id("users"),
        content: v.string(),
        isSystemMessage: v.optional(v.boolean()), // true para "Ticket derivado a Contabilidad", false para Chat
        createdAt: v.number(),
    }).index("by_request", ["requestId"]),

    // ==========================================
    // CATÁLOGO DE SERVICIOS Y PRODUCTOS
    // ==========================================
    packages: defineTable({
        name: v.string(),           // Ej: "Despegue Digital", "Servidor NAS"
        description: v.string(),
        unit: v.union(              // A qué unidad pertenece
            v.literal("digital"),   // U1
            v.literal("solutions"), // U2
            v.literal("infra")      // U3
        ),
        type: v.union(
            v.literal("service"),       // Servicio puntual
            v.literal("subscription"),  // Suscripción SaaS / Mantenimiento
            v.literal("hardware")       // Producto Físico
        ),
        basePrice: v.number(),      // Precio Base (PEN/USD)
        active: v.boolean(),        // Habilitado para venta
    }).index("unit", ["unit"]).index("type", ["type"]),


    // ==========================================
    // CRM Y VENTAS (Unidad 1 y Portafolio General)
    // ==========================================
    opportunities: defineTable({
        clientId: v.id("clients"),
        assignedTo: v.id("users"), // Ejecutivo de ventas
        serviceUnit: v.union(
            v.literal("digital"),   // U1
            v.literal("solutions"), // U2
            v.literal("infra")      // U3
        ),
        packageId: v.string(), // Identificador del Paquete ("despegue_digital", "ecommerce_total", etc.)
        estimatedValue: v.number(),
        status: v.union(
            v.literal("lead"),
            v.literal("presentation"),
            v.literal("negotiation"),
            v.literal("won"),
            v.literal("lost")
        ),
        expectedCloseDate: v.optional(v.number()), // Timestamp
    }).index("by_client", ["clientId"]),

    // ==========================================
    // OPERACIONES Y PROYECTOS (Cumplimiento U1 y U2)
    // ==========================================
    projects: defineTable({
        clientId: v.id("clients"),
        opportunityId: v.id("opportunities"),
        title: v.string(),
        status: v.union( // Control ágil
            v.literal("planning"),
            v.literal("in_progress"),
            v.literal("review"),
            v.literal("completed")
        ),
        milestones: v.array(v.object({
            name: v.string(),
            percentage: v.number(),      // Ej: 30%, 30%, 40%
            isPaid: v.boolean(),         // Condiciona el progreso del proyecto
            completedAt: v.optional(v.number()),
        })),
    }),

    // ==========================================
    // INVENTARIO Y ALMACÉN (Hardware)
    // ==========================================
    hardwareItems: defineTable({
        sku: v.string(),
        name: v.string(),
        brand: v.string(),
        costPrice: v.number(),
        salePrice: v.number(),
        minStockAlert: v.number(),
    }).index("sku", ["sku"]),

    serialNumbers: defineTable({
        hardwareId: v.id("hardwareItems"),
        serial: v.string(),
        status: v.union(
            v.literal("in_stock"),
            v.literal("installed"),
            v.literal("under_warranty"),
            v.literal("written_off")
        ),
        assignedProjectId: v.optional(v.id("projects")),
        dateAdded: v.number(),
    }).index("by_hardware", ["hardwareId"]).index("by_serial", ["serial"]),

    // ==========================================
    // MÓDULO DE DESARROLLO ÁGIL (Jira/Slack Clone)
    // ==========================================
    boards: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        ownerId: v.id("users"), // Líder de Proyecto / Scrum Master
        memberIds: v.array(v.id("users")), // Desarrolladores con acceso al board
        createdAt: v.number(),
    }).index("by_owner", ["ownerId"]),

    sprints: defineTable({
        boardId: v.id("boards"),
        name: v.string(), // Ej. "Sprint 1 - Foundation"
        goal: v.optional(v.string()),
        startDate: v.number(),
        endDate: v.number(),
        status: v.union(v.literal("planned"), v.literal("active"), v.literal("closed")),
        createdAt: v.number(),
    }).index("by_board", ["boardId"]).index("by_status", ["status"]),

    tasks: defineTable({
        boardId: v.id("boards"),
        sprintId: v.optional(v.id("sprints")), // Si está vacío, pertenece al Backlog global
        title: v.string(),
        description: v.optional(v.string()),
        status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("review"), v.literal("done")),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
        type: v.optional(v.union(v.literal("feature"), v.literal("bug"), v.literal("task"), v.literal("epic"))),
        storyPoints: v.optional(v.number()), // Fibonacci: 1, 2, 3, 5, 8, etc.
        assigneeId: v.optional(v.id("users")),
        githubPrLink: v.optional(v.string()), // Integración Dev
        // Planificación Temporal (Fase 15 — Gantt)
        startDate: v.optional(v.number()), // Timestamp de inicio planificado
        dueDate: v.optional(v.number()),   // Timestamp de entrega estimada
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    }).index("by_board", ["boardId"]).index("by_sprint", ["sprintId"]).index("by_assignee", ["assigneeId"]),

    // ==========================================
    // GESTIÓN DE RIESGOS DE PROYECTO (PMI)
    // ==========================================
    projectRisks: defineTable({
        projectId: v.id("projects"),
        title: v.string(),
        description: v.optional(v.string()),
        probability: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
        impact: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
        status: v.union(v.literal("identified"), v.literal("mitigating"), v.literal("resolved"), v.literal("accepted")),
        mitigation: v.optional(v.string()), // Plan de acción
        ownerId: v.id("users"), // Responsable del riesgo
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    }).index("by_project", ["projectId"]),

    boardMessages: defineTable({
        boardId: v.id("boards"),
        taskId: v.optional(v.id("tasks")), // Si el mensaje pertenece a la pizarra global o a un hilo de tarea específico
        authorId: v.id("users"),
        content: v.string(),
        createdAt: v.number(),
    }).index("by_board", ["boardId"]).index("by_task", ["taskId"]),

    // ==========================================
    // MÓDULO DE RECURSOS HUMANOS (HR CORE)
    // ==========================================
    employeeProfiles: defineTable({
        userId: v.id("users"), // Cada usuario del sistema tiene 1 o 0 perfiles de empleado

        // Ciclo de Vida
        status: v.optional(v.union(v.literal("activo"), v.literal("suspendido"), v.literal("vacaciones"), v.literal("licencia"), v.literal("cesado"))),
        terminationDate: v.optional(v.number()), // Fecha de cese/despido
        terminationReason: v.optional(v.string()), // Razón de la baja

        // Datos Demográficos / Legales
        documentId: v.optional(v.string()), // DNI, CE, Pasaporte
        birthDate: v.optional(v.number()),
        address: v.optional(v.string()),
        healthInsurance: v.optional(v.union(v.literal("essalud"), v.literal("eps"), v.literal("afp"), v.literal("onp"), v.literal("ninguno"))),

        // Contrato y Finanzas
        contractType: v.union(v.literal("planilla"), v.literal("honorarios"), v.literal("contratista")),
        baseSalary: v.number(), // Salario base en PEN o USD
        hireDate: v.number(), // Fecha de inicio de labores
        bankAccountDetails: v.optional(v.string()), // Número de cuenta y banco (Ej. BCP 193-xxxx-xxx)

        // Emergencia
        emergencyContact: v.optional(v.string()), // Nombre y teléfono de emergencia

        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    }).index("by_user", ["userId"]).index("by_status", ["status"]),

    employeeDocuments: defineTable({
        userId: v.id("users"),
        type: v.union(v.literal("contrato"), v.literal("memorandum"), v.literal("identidad"), v.literal("certificado"), v.literal("boleta"), v.literal("otro")),
        title: v.string(), // Ej: "Contrato Renovación 2026"
        fileId: v.id("_storage"), // Referencia nativa al Cloud Storage de Convex
        uploadDate: v.number(),
        uploadedBy: v.id("users"), // Quien subió el archivo (Admin HR)
    }).index("by_user", ["userId"]).index("by_type", ["type"]),

    attendances: defineTable({
        userId: v.id("users"),
        date: v.string(), // YYYY-MM-DD para fácil consulta
        clockInTime: v.number(), // Timestamp exacto de entrada
        clockOutTime: v.optional(v.number()), // Timestamp exacto de salida
        status: v.union(v.literal("presente"), v.literal("tardanza"), v.literal("ausente"), v.literal("justificado")),
        notes: v.optional(v.string()), // "Llegué tarde por tráfico"
    }).index("by_user_date", ["userId", "date"]).index("by_date", ["date"]),

    leaveRequests: defineTable({
        userId: v.id("users"),
        type: v.union(v.literal("vacaciones"), v.literal("enfermedad"), v.literal("personal"), v.literal("maternidad_paternidad")),
        startDate: v.number(),
        endDate: v.number(),
        reason: v.optional(v.string()),
        status: v.union(v.literal("pendiente"), v.literal("aprobado"), v.literal("rechazado")),
        managerId: v.optional(v.id("users")), // Quien aprobó/rechazó
        createdAt: v.number(),
    }).index("by_user", ["userId"]).index("by_status", ["status"]),

    payrollRuns: defineTable({
        periodMonth: v.number(), // 1 al 12
        periodYear: v.number(),
        totalAmount: v.number(), // Total liquidado en el mes
        status: v.union(v.literal("borrador"), v.literal("pagado")),
        createdAt: v.number(),
        executedBy: v.id("users"), // El administrador que corrió el motor
    }).index("by_period", ["periodYear", "periodMonth"]),

    // ==========================================
    // MÓDULO LEGAL Y COMPLIANCE (Gestor Doc)
    // ==========================================
    legalDocuments: defineTable({
        title: v.string(), // "Registro Marca BYTEK", "Contrato Cliente X"
        type: v.union(v.literal("marca"), v.literal("copia_literal"), v.literal("vigencia_poder"), v.literal("carta_garantia"), v.literal("contrato_cliente"), v.literal("nda"), v.literal("otro")),
        fileId: v.id("_storage"), // PDF firmado o escaneado en Convex

        status: v.union(v.literal("vigente"), v.literal("tramite"), v.literal("vencido")),
        expirationDate: v.optional(v.number()), // Fecha clave para el sistema de alertas

        // Relaciones comerciales
        targetClientId: v.optional(v.id("clients")), // Si es un contrato, a qué cliente pertenece
        targetProjectId: v.optional(v.id("projects")), // Si es un acta, a qué obra pertenece

        uploadedBy: v.id("users"),
        createdAt: v.number(),
    }).index("by_type", ["type"]).index("by_expiration", ["expirationDate"]).index("by_client", ["targetClientId"]),

    // ==========================================
    // SERVICIO DE CAMPO E INFRAESTRUCTURA (U3)
    // ==========================================
    fieldInterventions: defineTable({
        projectId: v.id("projects"),
        technicianId: v.id("users"),
        type: v.union(v.literal("installation"), v.literal("support"), v.literal("maintenance")),
        siteLocation: v.string(),
        status: v.union(
            v.literal("scheduled"),
            v.literal("en_route"),
            v.literal("working"),
            v.literal("completed")
        ),
        hardwareSerials: v.optional(v.array(v.string())), // Registro de Equipos (NAS, Racks, Biométricos)
        evidencePhotosUrl: v.optional(v.array(v.string())),
        closingSignatureUrl: v.optional(v.string()), // Acta de conformidad firmada
    }).index("by_technician", ["technicianId"]),

    // ==========================================
    // FINANZAS Y FACTURACIÓN
    // ==========================================
    invoices: defineTable({
        clientId: v.id("clients"),
        projectId: v.optional(v.id("projects")),
        amount: v.number(),
        billingType: v.union(
            v.literal("recurring"), // Mantenimientos, Hosting
            v.literal("one_time"),  // Hardware, Paquete Básico
            v.literal("milestone")  // Software a medida
        ),
        status: v.union(
            v.literal("pending"),
            v.literal("paid"),
            v.literal("overdue")
        ),
        dueDate: v.number(),
        paymentGatewayReference: v.optional(v.string()), // ID de Izipay/MercadoPago
    }).index("by_client", ["clientId"]),

    // ==========================================
    // GASTOS OPERATIVOS (OPEX)
    // ==========================================
    expenses: defineTable({
        title: v.string(),
        category: v.union(v.literal("nube"), v.literal("servicios"), v.literal("hardware"), v.literal("viaticos"), v.literal("alquiler"), v.literal("marketing"), v.literal("caja_chica"), v.literal("planilla"), v.literal("otro")),
        amount: v.number(),
        currency: v.union(v.literal("PEN"), v.literal("USD")),
        expenseDate: v.number(),
        status: v.union(v.literal("pendiente"), v.literal("pagado")),
        projectId: v.optional(v.id("projects")),
        providerName: v.optional(v.string()),
        registeredBy: v.id("users"),
        costCenterId: v.optional(v.id("costCenters")),
        journalEntryId: v.optional(v.id("journalEntries")),
        createdAt: v.number(),
    }).index("by_status", ["status"]).index("by_date", ["expenseDate"]),

    // ==========================================
    // SISTEMA CONTABLE COMPLETO
    // ==========================================

    // Plan Contable General Empresarial (PCGE Perú)
    accountingAccounts: defineTable({
        code: v.string(),           // "10", "1011", "101101" (jerárquico)
        name: v.string(),           // "Efectivo y equivalentes de efectivo"
        type: v.union(
            v.literal("activo"),
            v.literal("pasivo"),
            v.literal("patrimonio"),
            v.literal("ingreso"),
            v.literal("gasto"),
            v.literal("costo"),
            v.literal("cuentas_orden")
        ),
        parentCode: v.optional(v.string()),   // Código padre para jerarquía
        level: v.number(),                     // 1=clase, 2=rubro, 3=cuenta, 4=subcuenta, 5=divisionaria
        isActive: v.boolean(),
        acceptsMovements: v.boolean(),         // Solo cuentas de detalle aceptan movimientos
        nature: v.union(v.literal("deudora"), v.literal("acreedora")),
        description: v.optional(v.string()),
    }).index("by_code", ["code"]).index("by_type", ["type"]).index("by_parent", ["parentCode"]),

    // Periodos Contables
    accountingPeriods: defineTable({
        year: v.number(),
        month: v.number(),              // 1-12, 13 = cierre anual
        status: v.union(v.literal("abierto"), v.literal("cerrado")),
        closedBy: v.optional(v.id("users")),
        closedAt: v.optional(v.number()),
    }).index("by_year_month", ["year", "month"]),

    // Asientos Contables (Journal Entries) — Partida Doble
    journalEntries: defineTable({
        entryNumber: v.string(),        // "ASIENTO-2026-000001"
        date: v.string(),               // "2026-02-25"
        periodId: v.id("accountingPeriods"),
        description: v.string(),
        type: v.union(
            v.literal("apertura"),       // Asiento de apertura
            v.literal("operacion"),      // Operaciones normales
            v.literal("ajuste"),         // Ajustes contables
            v.literal("cierre"),         // Cierre de periodo
            v.literal("reclasificacion") // Reclasificaciones
        ),
        status: v.union(v.literal("borrador"), v.literal("contabilizado"), v.literal("anulado")),
        sourceModule: v.optional(v.string()),    // "invoices", "expenses", "payroll"
        sourceId: v.optional(v.string()),        // ID del documento origen
        createdBy: v.id("users"),
        approvedBy: v.optional(v.id("users")),
        totalDebit: v.number(),          // Suma total debe
        totalCredit: v.number(),         // Suma total haber
        createdAt: v.number(),
    }).index("by_period", ["periodId"]).index("by_date", ["date"]).index("by_number", ["entryNumber"]),

    // Líneas de Asiento (Detalle Debe/Haber)
    journalEntryLines: defineTable({
        entryId: v.id("journalEntries"),
        accountCode: v.string(),         // Código de cuenta contable
        accountId: v.id("accountingAccounts"),
        description: v.optional(v.string()),
        debit: v.number(),               // Monto al DEBE
        credit: v.number(),              // Monto al HABER
        costCenterId: v.optional(v.id("costCenters")),
        documentReference: v.optional(v.string()), // "FAC-001-000234"
    }).index("by_entry", ["entryId"]).index("by_account", ["accountId"]),

    // Centros de Costo
    costCenters: defineTable({
        code: v.string(),           // "CC-ADMIN", "CC-U1-DIGITAL"
        name: v.string(),           // "Administración", "Unidad Digital"
        type: v.union(v.literal("administrativo"), v.literal("operativo"), v.literal("proyecto")),
        projectId: v.optional(v.id("projects")),
        isActive: v.boolean(),
    }).index("by_code", ["code"]),

    // Cuentas Bancarias
    bankAccounts: defineTable({
        bankName: v.string(),       // "BCP", "Interbank", "BBVA"
        accountNumber: v.string(),  // "193-xxxxxxx-xxx"
        accountType: v.union(v.literal("corriente"), v.literal("ahorros"), v.literal("detraccion"), v.literal("caja_chica")),
        currency: v.union(v.literal("PEN"), v.literal("USD")),
        currentBalance: v.number(),
        accountingAccountId: v.id("accountingAccounts"), // Vinculado al plan de cuentas
        isActive: v.boolean(),
    }).index("by_bank", ["bankName"]),

    // Movimientos Bancarios
    bankTransactions: defineTable({
        bankAccountId: v.id("bankAccounts"),
        date: v.string(),
        type: v.union(v.literal("ingreso"), v.literal("egreso"), v.literal("transferencia")),
        description: v.string(),
        amount: v.number(),
        reference: v.optional(v.string()),     // Nro operación bancaria
        reconciled: v.boolean(),               // Ya conciliado
        journalEntryId: v.optional(v.id("journalEntries")),
        createdAt: v.number(),
    }).index("by_account", ["bankAccountId"]).index("by_date", ["date"]).index("by_reconciled", ["reconciled"]),

    // Cuentas por Cobrar (Accounts Receivable)
    accountsReceivable: defineTable({
        clientId: v.id("clients"),
        invoiceId: v.optional(v.id("invoices")),
        documentType: v.union(v.literal("factura"), v.literal("boleta"), v.literal("nota_debito"), v.literal("otro")),
        documentNumber: v.string(),
        issueDate: v.string(),
        dueDate: v.string(),
        originalAmount: v.number(),
        pendingAmount: v.number(),
        currency: v.union(v.literal("PEN"), v.literal("USD")),
        status: v.union(v.literal("pendiente"), v.literal("parcial"), v.literal("cobrado"), v.literal("vencido"), v.literal("incobrable")),
        journalEntryId: v.optional(v.id("journalEntries")),
    }).index("by_client", ["clientId"]).index("by_status", ["status"]).index("by_due", ["dueDate"]),

    // Cuentas por Pagar (Accounts Payable)
    accountsPayable: defineTable({
        providerName: v.string(),
        documentType: v.union(v.literal("factura"), v.literal("recibo"), v.literal("nota_credito"), v.literal("otro")),
        documentNumber: v.string(),
        issueDate: v.string(),
        dueDate: v.string(),
        originalAmount: v.number(),
        pendingAmount: v.number(),
        currency: v.union(v.literal("PEN"), v.literal("USD")),
        category: v.string(),        // nube, hardware, servicios, etc.
        status: v.union(v.literal("pendiente"), v.literal("parcial"), v.literal("pagado"), v.literal("vencido")),
        journalEntryId: v.optional(v.id("journalEntries")),
        expenseId: v.optional(v.string()),  // Vinculado al gasto original
    }).index("by_status", ["status"]).index("by_due", ["dueDate"]),

    // Pagos y Cobros
    payments: defineTable({
        type: v.union(v.literal("cobro"), v.literal("pago")),
        receivableId: v.optional(v.id("accountsReceivable")),
        payableId: v.optional(v.id("accountsPayable")),
        bankAccountId: v.id("bankAccounts"),
        amount: v.number(),
        paymentDate: v.string(),
        paymentMethod: v.union(v.literal("transferencia"), v.literal("cheque"), v.literal("efectivo"), v.literal("yape_plin"), v.literal("tarjeta")),
        reference: v.optional(v.string()),
        journalEntryId: v.optional(v.id("journalEntries")),
        createdAt: v.number(),
    }).index("by_receivable", ["receivableId"]).index("by_payable", ["payableId"]),

    // Obligaciones Tributarias
    taxObligations: defineTable({
        period: v.string(),            // "2026-02"
        type: v.union(v.literal("igv"), v.literal("renta_mensual"), v.literal("renta_anual"), v.literal("essalud"), v.literal("onp"), v.literal("afp"), v.literal("detraccion")),
        baseAmount: v.number(),        // Base imponible
        taxAmount: v.number(),         // Monto del impuesto
        creditAmount: v.optional(v.number()),  // Crédito fiscal (IGV compras)
        netPayable: v.number(),        // Monto neto a pagar
        dueDate: v.string(),
        status: v.union(v.literal("por_declarar"), v.literal("declarado"), v.literal("pagado")),
        pdtReference: v.optional(v.string()),  // Nro de orden PDT/SUNAT
    }).index("by_period", ["period"]).index("by_type", ["type"]),

    // Presupuestos
    budgets: defineTable({
        name: v.string(),              // "Presupuesto Operativo Q1 2026"
        year: v.number(),
        costCenterId: v.optional(v.id("costCenters")),
        accountId: v.id("accountingAccounts"),  // A qué cuenta aplica
        budgetedAmount: v.number(),
        actualAmount: v.number(),       // Se actualiza automáticamente
        variance: v.number(),           // Diferencia
        status: v.union(v.literal("activo"), v.literal("cerrado")),
    }).index("by_year", ["year"]).index("by_center", ["costCenterId"]),
});
