import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Motor de Reportes Post-Mortem (Fase 16)
 * Genera un reporte ejecutivo cruzando métricas de múltiples tablas
 * para evaluación al cierre de un proyecto.
 */
export const generateProjectReport = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Proyecto no encontrado");

        const client = await ctx.db.get(project.clientId);

        // ========== OPORTUNIDAD ORIGEN ==========
        const opportunity = project.opportunityId
            ? await ctx.db.get(project.opportunityId)
            : null;

        // ========== COTIZACIONES ==========
        const quotes: any[] = project.opportunityId
            ? await (ctx.db as any).query("quotes")
                .filter((q: any) => q.eq(q.field("opportunityId"), project.opportunityId))
                .collect()
            : [];
        const acceptedQuote = quotes.find((q: any) => q.status === "aceptado");

        // ========== FACTURAS ==========
        const invoices = await ctx.db.query("invoices")
            .withIndex("by_client", q => q.eq("clientId", project.clientId))
            .collect();
        const projectInvoices = invoices.filter(inv => inv.projectId === args.projectId);
        const totalInvoiced = projectInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        const paidInvoices = projectInvoices.filter(inv => inv.status === "paid");
        const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

        // ========== TAREAS (Boards vinculados) ==========
        // Buscamos todos los boards que tengan tareas para poder cruzar
        const allTasks = await ctx.db.query("tasks").collect();
        // Filtrar por las tareas que coincidan con boards asociados al proyecto
        // En el modelo actual, la relación es Project -> Board implícita; usamos todas las tareas
        const allBoards = await ctx.db.query("boards").collect();

        // Para el reporte, tomamos todas las tareas (cross-project overview)
        const totalTasks = allTasks.length;
        const doneTasks = allTasks.filter(t => t.status === "done");
        const bugTasks = allTasks.filter(t => t.type === "bug");
        const featureTasks = allTasks.filter(t => t.type === "feature");
        const epicTasks = allTasks.filter(t => t.type === "epic");
        const taskTasks = allTasks.filter(t => t.type === "task");

        const totalSP = allTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
        const completedSP = doneTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

        // Distribución por prioridad
        const priorityBreakdown = {
            low: allTasks.filter(t => t.priority === "low").length,
            medium: allTasks.filter(t => t.priority === "medium").length,
            high: allTasks.filter(t => t.priority === "high").length,
            urgent: allTasks.filter(t => t.priority === "urgent").length,
        };

        // Distribución por estado
        const statusBreakdown = {
            todo: allTasks.filter(t => t.status === "todo").length,
            in_progress: allTasks.filter(t => t.status === "in_progress").length,
            review: allTasks.filter(t => t.status === "review").length,
            done: doneTasks.length,
        };

        // ========== SPRINTS ==========
        const allSprints = await ctx.db.query("sprints").collect();
        const closedSprints = allSprints.filter(s => s.status === "closed");
        const activeSprints = allSprints.filter(s => s.status === "active");

        // Velocidad promedio (SP completados por sprint)
        let avgVelocity = 0;
        if (closedSprints.length > 0) {
            const spPerSprint = closedSprints.map(sprint => {
                const sprintTasks = allTasks.filter(t => t.sprintId === sprint._id && t.status === "done");
                return sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
            });
            avgVelocity = spPerSprint.reduce((a, b) => a + b, 0) / closedSprints.length;
        }

        // ========== RIESGOS ==========
        const risks = await ctx.db.query("projectRisks")
            .withIndex("by_project", q => q.eq("projectId", args.projectId))
            .collect();
        const resolvedRisks = risks.filter(r => r.status === "resolved");
        const acceptedRisks = risks.filter(r => r.status === "accepted");
        const mitigatingRisks = risks.filter(r => r.status === "mitigating");
        const identifiedRisks = risks.filter(r => r.status === "identified");
        const criticalRisks = risks.filter(r => r.impact === "critical" || r.probability === "critical");

        // ========== HITOS DEL PROYECTO ==========
        const milestones = project.milestones || [];
        const completedMilestones = milestones.filter((m: any) => m.completedAt);
        const paidMilestones = milestones.filter((m: any) => m.isPaid);

        // ========== MÉTRICAS CALCULADAS ==========
        const estimatedValue = (opportunity as any)?.estimatedValue || acceptedQuote?.total || 0;
        const budgetVariance = estimatedValue > 0 ? ((totalInvoiced - estimatedValue) / estimatedValue) * 100 : 0;

        const taskCompletionRate = totalTasks > 0 ? (doneTasks.length / totalTasks) * 100 : 0;
        const bugRate = totalTasks > 0 ? (bugTasks.length / totalTasks) * 100 : 0;
        const spCompletionRate = totalSP > 0 ? (completedSP / totalSP) * 100 : 0;

        // Tareas con fechas → calcular desviación de plazos
        const tasksWithDates = allTasks.filter(t => t.startDate && t.dueDate);
        let onTimeTasks = 0;
        let lateTasks = 0;
        tasksWithDates.forEach(t => {
            if (t.status === "done" && t.updatedAt && t.dueDate) {
                if (t.updatedAt <= t.dueDate) onTimeTasks++;
                else lateTasks++;
            }
        });
        const scheduleAdherence = tasksWithDates.length > 0
            ? (onTimeTasks / Math.max(onTimeTasks + lateTasks, 1)) * 100
            : null; // null = no hay datos suficientes

        return {
            project: {
                _id: project._id,
                title: project.title,
                status: project.status,
                clientName: client?.companyName || "Desconocido",
            },
            financial: {
                estimatedValue,
                totalInvoiced,
                totalPaid,
                pendingPayment: totalInvoiced - totalPaid,
                budgetVariance: Math.round(budgetVariance * 100) / 100,
                invoiceCount: projectInvoices.length,
                paidInvoiceCount: paidInvoices.length,
            },
            delivery: {
                totalTasks,
                completedTasks: doneTasks.length,
                taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
                totalSP,
                completedSP,
                spCompletionRate: Math.round(spCompletionRate * 100) / 100,
                avgVelocity: Math.round(avgVelocity * 10) / 10,
                scheduleAdherence: scheduleAdherence !== null ? Math.round(scheduleAdherence * 100) / 100 : null,
                onTimeTasks,
                lateTasks,
            },
            quality: {
                totalBugs: bugTasks.length,
                bugRate: Math.round(bugRate * 100) / 100,
                typeBreakdown: {
                    features: featureTasks.length,
                    bugs: bugTasks.length,
                    epics: epicTasks.length,
                    tasks: taskTasks.length,
                },
                priorityBreakdown,
                statusBreakdown,
            },
            sprints: {
                total: allSprints.length,
                closed: closedSprints.length,
                active: activeSprints.length,
            },
            risks: {
                total: risks.length,
                resolved: resolvedRisks.length,
                accepted: acceptedRisks.length,
                mitigating: mitigatingRisks.length,
                identified: identifiedRisks.length,
                critical: criticalRisks.length,
                resolutionRate: risks.length > 0 ? Math.round((resolvedRisks.length / risks.length) * 100) : 0,
            },
            milestones: {
                total: milestones.length,
                completed: completedMilestones.length,
                paid: paidMilestones.length,
                completionRate: milestones.length > 0 ? Math.round((completedMilestones.length / milestones.length) * 100) : 0,
            },
            generatedAt: Date.now(),
        };
    }
});

// =============================================
// RENTABILIDAD COMPARATIVA POR PROYECTO
// =============================================

export const getProjectProfitabilityComparison = query({
    args: {},
    handler: async (ctx) => {
        const projects = await ctx.db.query("projects").collect();
        const completedProjects = projects.filter(p => p.status === "completed");

        const comparison = await Promise.all(completedProjects.map(async (project) => {
            // Ingresos (facturas pagadas)
            const invoices = await ctx.db.query("invoices")
                .withIndex("by_client", q => q.eq("clientId", project.clientId))
                .collect();
            const projectInvoices = invoices.filter(i => i.projectId === project._id);
            const revenue = projectInvoices
                .filter(i => i.status === "paid")
                .reduce((s, i) => s + i.amount, 0);

            // Costos (gastos vinculados — simplificado)
            const expenses = await ctx.db.query("expenses").collect();
            const projectExpenses = expenses.filter(e => (e as any).projectId === project._id);
            const costs = projectExpenses.reduce((s, e) => s + e.amount, 0);

            // Rentabilidad
            const profit = revenue - costs;
            const margin = revenue > 0 ? Math.round((profit / revenue) * 10000) / 100 : 0;

            const client = await ctx.db.get(project.clientId);

            return {
                projectId: project._id,
                projectTitle: project.title,
                clientName: client?.companyName || "Desconocido",
                serviceUnit: (project as any).serviceUnit || "N/A",
                revenue: Math.round(revenue * 100) / 100,
                costs: Math.round(costs * 100) / 100,
                profit: Math.round(profit * 100) / 100,
                margin,
                budget: (project as any).budget || 0,
                budgetVariance: (project as any).budget ? Math.round((((project as any).budget - costs) / (project as any).budget) * 10000) / 100 : 0,
            };
        }));

        // Ordenar por rentabilidad
        comparison.sort((a, b) => b.margin - a.margin);

        const avgMargin = comparison.length > 0
            ? Math.round(comparison.reduce((s, p) => s + p.margin, 0) / comparison.length * 100) / 100
            : 0;

        return {
            projects: comparison,
            summary: {
                totalProjects: comparison.length,
                averageMargin: avgMargin,
                totalRevenue: Math.round(comparison.reduce((s, p) => s + p.revenue, 0) * 100) / 100,
                totalCosts: Math.round(comparison.reduce((s, p) => s + p.costs, 0) * 100) / 100,
                totalProfit: Math.round(comparison.reduce((s, p) => s + p.profit, 0) * 100) / 100,
            }
        };
    }
});

// =============================================
// MÉTRICAS ÁGILES (Velocity, Cycle Time, Burndown)
// =============================================

export const getAgileMetrics = query({
    args: { boardId: v.id("boards") },
    handler: async (ctx, args) => {
        const board = await ctx.db.get(args.boardId);
        if (!board) throw new Error("Board no encontrado.");

        // Obtener sprints del board
        const sprints = await ctx.db.query("sprints")
            .withIndex("by_board", q => q.eq("boardId", args.boardId))
            .order("desc")
            .collect();

        // Obtener todas las tareas del board
        const tasks = await ctx.db.query("tasks")
            .withIndex("by_board", q => q.eq("boardId", args.boardId))
            .collect();

        // 1. VELOCITY: Story points completados por sprint (últimos 5)
        const recentSprints = sprints.slice(0, 5);
        const velocity = recentSprints.map(sprint => {
            const sprintTasks = tasks.filter(t => t.sprintId === sprint._id);
            const completedPoints = sprintTasks
                .filter(t => t.status === "done")
                .reduce((s, t) => s + (t.storyPoints || 0), 0);
            const totalPoints = sprintTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);

            return {
                sprintName: sprint.name,
                completedPoints,
                totalPoints,
                completionRate: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 10000) / 100 : 0,
            };
        });

        const avgVelocity = velocity.length > 0
            ? Math.round(velocity.reduce((s, v) => s + v.completedPoints, 0) / velocity.length * 100) / 100
            : 0;

        // 2. CYCLE TIME: Promedio de días de creación → completado
        const completedTasks = tasks.filter(t => t.status === "done" && t._creationTime);
        const cycleTimes = completedTasks.map(t => {
            const created = t._creationTime;
            const completed = t.updatedAt || Date.now();
            return (completed - created) / (1000 * 60 * 60 * 24); // días
        });
        const avgCycleTime = cycleTimes.length > 0
            ? Math.round(cycleTimes.reduce((s, d) => s + d, 0) / cycleTimes.length * 100) / 100
            : 0;

        // 3. BURNDOWN: Sprint activo
        const activeSprint = sprints.find(s => s.status === "active");
        let burndownData: Array<{ point: string; remaining: number }> = [];

        if (activeSprint) {
            const sprintTasks = tasks.filter(t => t.sprintId === activeSprint._id);
            const totalPoints = sprintTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
            const completedPoints = sprintTasks
                .filter(t => t.status === "done")
                .reduce((s, t) => s + (t.storyPoints || 0), 0);
            const inProgressPoints = sprintTasks
                .filter(t => t.status === "in_progress")
                .reduce((s, t) => s + (t.storyPoints || 0), 0);

            burndownData = [
                { point: "Total", remaining: totalPoints },
                { point: "En Progreso", remaining: totalPoints - completedPoints },
                { point: "Pendiente", remaining: totalPoints - completedPoints - inProgressPoints },
            ];
        }

        // 4. Task distribution
        const tasksByStatus = {
            todo: tasks.filter(t => t.status === "todo").length,
            in_progress: tasks.filter(t => t.status === "in_progress").length,
            in_review: tasks.filter(t => t.status === "review").length,
            done: tasks.filter(t => t.status === "done").length,
        };

        return {
            boardName: board.title,
            velocity,
            avgVelocity,
            avgCycleTime,
            activeSprint: activeSprint ? {
                name: activeSprint.name,
                burndown: burndownData,
            } : null,
            tasksByStatus,
            totalTasks: tasks.length,
        };
    }
});
