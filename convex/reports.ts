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
