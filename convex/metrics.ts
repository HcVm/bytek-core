import { query } from "./_generated/server";

export const getDashboardMetrics = query({
    args: {},
    handler: async (ctx) => {
        // Obtenemos un panorama general sin saturar con reads innecesarios
        // En producción a gran escala, estas lógicas se mueven a acciones o jobs en background (crons)

        // 1. OPORTUNIDADES (Ventas)
        const opportunities = await ctx.db.query("opportunities").collect();
        const wonCount = opportunities.filter(o => o.status === "won").length;
        const wonValue = opportunities
            .filter(o => o.status === "won" && o.estimatedValue)
            .reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
        const openOpps = opportunities.filter(o => o.status !== "won" && o.status !== "lost").length;

        // Distribución de Oportunidades por Unidad
        const oppsByUnit = {
            digital: opportunities.filter(o => o.serviceUnit === "digital").length,
            solutions: opportunities.filter(o => o.serviceUnit === "solutions").length,
            infra: opportunities.filter(o => o.serviceUnit === "infra").length,
        };

        // 2. PROYECTOS (Cumplimiento)
        const projects = await ctx.db.query("projects").collect();
        const activeProjects = projects.filter(p => p.status !== "completed").length;

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

        // Retorno estructurado para los Hooks del Frontend
        return {
            sales: {
                wonCount,
                wonValue,
                openOpps,
                distribution: [
                    { name: 'U1: Digital', value: oppsByUnit.digital },
                    { name: 'U2: Software', value: oppsByUnit.solutions },
                    { name: 'U3: Infra', value: oppsByUnit.infra },
                ]
            },
            operations: {
                activeProjects,
                pendingInterventions
            },
            finance: {
                paidValue,
                pendingValue
            },
            inventory: {
                value: inventoryValue,
                lowStockCount
            }
        };
    },
});
