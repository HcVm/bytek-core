import { query } from "./_generated/server";

// =============================================
// MÉTRICAS EJECUTIVAS COMPLETAS
// =============================================

export const getDashboardMetrics = query({
    args: {},
    handler: async (ctx) => {
        // 1. OPORTUNIDADES (Ventas)
        const opportunities = await ctx.db.query("opportunities").collect();
        const wonCount = opportunities.filter(o => o.status === "won").length;
        const wonValue = opportunities
            .filter(o => o.status === "won" && o.estimatedValue)
            .reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
        const openOpps = opportunities.filter(o => o.status !== "won" && o.status !== "lost").length;
        const closedOpps = opportunities.filter(o => o.status === "won" || o.status === "lost").length;

        // Distribución de Oportunidades por Unidad
        const oppsByUnit = {
            digital: opportunities.filter(o => o.serviceUnit === "digital").length,
            solutions: opportunities.filter(o => o.serviceUnit === "solutions").length,
            infra: opportunities.filter(o => o.serviceUnit === "infra").length,
        };

        // Tasa de conversión
        const conversionRate = closedOpps > 0 ? Math.round((wonCount / closedOpps) * 10000) / 100 : 0;

        // 2. PROYECTOS (Cumplimiento)
        const projects = await ctx.db.query("projects").collect();
        const activeProjects = projects.filter(p => p.status !== "completed").length;
        const completedProjects = projects.filter(p => p.status === "completed").length;
        const backlogValue = projects
            .filter(p => p.status !== "completed")
            .reduce((sum, p) => sum + ((p as any).budget || 0), 0);

        // 3. FACTURACIÓN (Financiero)
        const invoices = await ctx.db.query("invoices").collect();
        const paidValue = invoices
            .filter(i => i.status === "paid")
            .reduce((sum, i) => sum + i.amount, 0);
        const pendingValue = invoices
            .filter(i => i.status === "pending" || i.status === "overdue")
            .reduce((sum, i) => sum + i.amount, 0);

        // 4. INVENTARIO & CAMPO (U3)
        const interventions = await ctx.db.query("fieldInterventions").collect();
        const pendingInterventions = interventions.filter(i => i.status !== "completed").length;

        const hardware = await ctx.db.query("hardwareItems").collect();
        const serials = await ctx.db.query("serialNumbers").collect();

        let inventoryValue = 0;
        let lowStockCount = 0;

        hardware.forEach(item => {
            const inStock = serials.filter(s => s.hardwareId === item._id && s.status === "in_stock").length;
            inventoryValue += inStock * item.costPrice;
            if (inStock <= item.minStockAlert) lowStockCount++;
        });

        // 5. MÉTRICAS FINANCIERAS AVANZADAS
        // EBITDA simplificado: ingresos facturados pagados - gastos operativos
        const expenses = await ctx.db.query("expenses").collect();
        const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
        const ebitda = Math.round((paidValue - totalExpenses) * 100) / 100;

        // DSO (Days Sales Outstanding)
        const receivables = await ctx.db.query("accountsReceivable").collect();
        const totalPendingAR = receivables
            .filter(r => r.status !== "cobrado")
            .reduce((s, r) => s + r.pendingAmount, 0);
        const last30DaysRevenue = invoices
            .filter(i => i.status === "paid")
            .reduce((s, i) => s + i.amount, 0);
        const dailyRevenue = last30DaysRevenue / 30;
        const dso = dailyRevenue > 0 ? Math.round((totalPendingAR / dailyRevenue) * 100) / 100 : 0;

        // Cash burn rate (promedio de egresos mensuales)
        const bankTransactions = await ctx.db.query("bankTransactions").collect();
        const outflows = bankTransactions.filter(t => t.type === "egreso");
        const cashBurnRate = outflows.length > 0
            ? Math.round((outflows.reduce((s, t) => s + t.amount, 0) / Math.max(1, Math.ceil(outflows.length / 30))) * 100) / 100
            : 0;

        // Bank balances
        const bankAccounts = await ctx.db.query("bankAccounts").collect();
        const totalCash = bankAccounts.reduce((s, a) => s + a.currentBalance, 0);

        // Retención de clientes
        const clients = await ctx.db.query("clients").collect();
        const activeClients = clients.filter(c => c.status === "active").length;
        const totalClients = clients.length;
        const retentionRate = totalClients > 0 ? Math.round((activeClients / totalClients) * 10000) / 100 : 0;

        // 6. HR
        const employees = await ctx.db.query("employeeProfiles").collect();
        const activeEmployees = employees.filter(e => e.status === "activo").length;

        return {
            sales: {
                wonCount,
                wonValue,
                openOpps,
                conversionRate,
                distribution: [
                    { name: 'U1: Digital', value: oppsByUnit.digital },
                    { name: 'U2: Software', value: oppsByUnit.solutions },
                    { name: 'U3: Infra', value: oppsByUnit.infra },
                ]
            },
            operations: {
                activeProjects,
                completedProjects,
                pendingInterventions,
                backlogValue: Math.round(backlogValue * 100) / 100,
            },
            finance: {
                paidValue,
                pendingValue,
                ebitda,
                dso,
                cashBurnRate,
                totalCash: Math.round(totalCash * 100) / 100,
                totalPendingAR: Math.round(totalPendingAR * 100) / 100,
            },
            inventory: {
                value: inventoryValue,
                lowStockCount
            },
            clients: {
                total: totalClients,
                active: activeClients,
                retentionRate,
            },
            hr: {
                activeEmployees,
                totalEmployees: employees.length,
            }
        };
    },
});

// =============================================
// SEMÁFOROS DE SALUD EMPRESARIAL
// =============================================

export const getHealthIndicators = query({
    args: {},
    handler: async (ctx) => {
        const indicators: Array<{
            name: string;
            category: string;
            value: number;
            unit: string;
            status: "verde" | "amarillo" | "rojo";
            message: string;
        }> = [];

        // 1. CxC vencidas
        const receivables = await ctx.db.query("accountsReceivable").collect();
        const pendingAR = receivables.filter(r => r.status !== "cobrado");
        const today = new Date().toISOString().split("T")[0];
        const overdueAR = pendingAR.filter(r => r.dueDate < today);
        const overdueAmount = overdueAR.reduce((s, r) => s + r.pendingAmount, 0);
        const totalAR = pendingAR.reduce((s, r) => s + r.pendingAmount, 0);
        const overduePercent = totalAR > 0 ? (overdueAmount / totalAR) * 100 : 0;

        indicators.push({
            name: "CxC Vencidas",
            category: "finanzas",
            value: Math.round(overduePercent * 100) / 100,
            unit: "%",
            status: overduePercent < 20 ? "verde" : overduePercent < 50 ? "amarillo" : "rojo",
            message: overduePercent < 20 ? "Cobranzas al día" : overduePercent < 50 ? "Atención: revisar CxC vencidas" : "URGENTE: Alto nivel de morosidad",
        });

        // 2. Liquidez (saldo bancario vs. CxP pendientes)
        const bankAccounts = await ctx.db.query("bankAccounts").collect();
        const totalCash = bankAccounts.reduce((s, a) => s + a.currentBalance, 0);
        const payables = await ctx.db.query("accountsPayable").collect();
        const totalAP = payables.filter(p => p.status !== "pagado").reduce((s, p) => s + p.pendingAmount, 0);
        const liquidityRatio = totalAP > 0 ? totalCash / totalAP : 10;

        indicators.push({
            name: "Ratio de Liquidez",
            category: "finanzas",
            value: Math.round(liquidityRatio * 100) / 100,
            unit: "x",
            status: liquidityRatio >= 1.5 ? "verde" : liquidityRatio >= 1 ? "amarillo" : "rojo",
            message: liquidityRatio >= 1.5 ? "Liquidez saludable" : liquidityRatio >= 1 ? "Liquidez ajustada" : "ALERTA: Fondos insuficientes para CxP",
        });

        // 3. Proyectos en riesgo
        const risks = await ctx.db.query("projectRisks").collect();
        const activeRisks = risks.filter(r => r.status === "identified" || r.status === "mitigating");
        const criticalRisks = activeRisks.filter(r => r.impact === "critical" || r.probability === "critical");

        indicators.push({
            name: "Riesgos Críticos",
            category: "operaciones",
            value: criticalRisks.length,
            unit: "riesgos",
            status: criticalRisks.length === 0 ? "verde" : criticalRisks.length <= 2 ? "amarillo" : "rojo",
            message: criticalRisks.length === 0 ? "Sin riesgos críticos" : `${criticalRisks.length} riesgos críticos activos`,
        });

        // 4. Inventario bajo
        const hardware = await ctx.db.query("hardwareItems").collect();
        const serials = await ctx.db.query("serialNumbers").collect();
        let lowStockItems = 0;
        hardware.forEach(item => {
            const inStock = serials.filter(s => s.hardwareId === item._id && s.status === "in_stock").length;
            if (inStock <= item.minStockAlert) lowStockItems++;
        });

        indicators.push({
            name: "Inventario Bajo",
            category: "inventario",
            value: lowStockItems,
            unit: "items",
            status: lowStockItems === 0 ? "verde" : lowStockItems <= 3 ? "amarillo" : "rojo",
            message: lowStockItems === 0 ? "Stock óptimo" : `${lowStockItems} productos con stock bajo`,
        });

        // 5. Tickets de soporte abiertos
        const tickets = await ctx.db.query("supportTickets").collect();
        const openTickets = tickets.filter(t => t.status === "abierto" || t.status === "en_progreso");
        const criticalTickets = openTickets.filter(t => t.priority === "critica");

        indicators.push({
            name: "Tickets de Soporte",
            category: "clientes",
            value: openTickets.length,
            unit: "abiertos",
            status: criticalTickets.length === 0 && openTickets.length <= 5 ? "verde"
                : criticalTickets.length > 0 ? "rojo" : "amarillo",
            message: criticalTickets.length > 0 ? `${criticalTickets.length} tickets críticos` : `${openTickets.length} tickets abiertos`,
        });

        return indicators;
    }
});
