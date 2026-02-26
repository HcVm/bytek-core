import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =============================================
// PLANTILLAS DE CONTRATO PREDEFINIDAS
// =============================================

const CONTRACT_TEMPLATES: Record<string, {
    title: string;
    sections: { heading: string; body: string }[];
}> = {
    "digital-service": {
        title: "CONTRATO DE PRESTACIÓN DE SERVICIOS DIGITALES",
        sections: [
            { heading: "PRIMERA: OBJETO DEL CONTRATO", body: "EL PROVEEDOR se compromete a prestar a EL CLIENTE el servicio de {{SERVICE_NAME}} conforme a las especificaciones técnicas descritas en la cotización {{QUOTE_REF}}, la cual forma parte integrante del presente contrato." },
            { heading: "SEGUNDA: ALCANCE DE LOS SERVICIOS", body: "El servicio incluye: {{SERVICE_DESCRIPTION}}. El alcance técnico detallado se encuentra definido en el Anexo A del presente contrato. Cualquier requerimiento fuera del alcance será considerado como adicional y cotizado por separado." },
            { heading: "TERCERA: PLAZO DE EJECUCIÓN", body: "El plazo de ejecución del servicio será de {{DURATION}} días calendario, contados a partir de la fecha de firma del presente contrato y recepción del adelanto indicado en la cláusula quinta." },
            { heading: "CUARTA: ENTREGABLES Y ACEPTACIÓN", body: "EL PROVEEDOR entregará los siguientes productos/entregables: {{MILESTONES}}. EL CLIENTE tendrá un plazo de cinco (5) días hábiles posteriores a cada entrega para realizar observaciones. Si no se reciben observaciones, se dará por aceptado el entregable automáticamente." },
            { heading: "QUINTA: CONTRAPRESTACIÓN Y FORMA DE PAGO", body: "EL CLIENTE pagará al PROVEEDOR la suma total de {{CURRENCY}} {{TOTAL_AMOUNT}} ({{AMOUNT_WORDS}}), conforme al siguiente esquema: {{PAYMENT_SCHEDULE}}." },
            { heading: "SEXTA: PROPIEDAD INTELECTUAL", body: "Los derechos de propiedad intelectual sobre los entregables serán transferidos a EL CLIENTE una vez efectuado el pago total. EL PROVEEDOR se reserva el derecho de uso de metodologías, herramientas y conocimientos genéricos que no constituyan información confidencial de EL CLIENTE." },
            { heading: "SÉPTIMA: CONFIDENCIALIDAD", body: "Ambas partes se comprometen a mantener en absoluta reserva toda la información confidencial a la que tengan acceso con motivo de la ejecución del presente contrato, por un periodo de dos (2) años posteriores a la terminación del mismo." },
            { heading: "OCTAVA: GARANTÍA", body: "EL PROVEEDOR otorga una garantía de treinta (30) días sobre los entregables, periodo durante el cual se corregirán sin costo adicional los defectos atribuibles a la ejecución del servicio." },
            { heading: "NOVENA: RESOLUCIÓN DEL CONTRATO", body: "Cualquiera de las partes podrá resolver el contrato de manera anticipada mediante comunicación escrita con quince (15) días de anticipación. En caso de resolución por parte de EL CLIENTE, este pagará los servicios efectivamente realizados hasta la fecha." },
            { heading: "DÉCIMA: SOLUCIÓN DE CONTROVERSIAS", body: "Las partes acuerdan resolver cualquier controversia de buena fe. De no llegar a un acuerdo, se someterán a la jurisdicción de los Juzgados y Tribunales de la ciudad de {{CITY}}, República del Perú." },
        ]
    },
    "digital-subscription": {
        title: "CONTRATO DE SUSCRIPCIÓN DE SERVICIOS DIGITALES",
        sections: [
            { heading: "PRIMERA: OBJETO DEL CONTRATO", body: "EL PROVEEDOR se compromete a brindar a EL CLIENTE el servicio recurrente de {{SERVICE_NAME}}, bajo la modalidad de suscripción {{BILLING_CYCLE}}, conforme a las características descritas en la cotización {{QUOTE_REF}}." },
            { heading: "SEGUNDA: ALCANCE DEL SERVICIO RECURRENTE", body: "El servicio incluye: {{SERVICE_DESCRIPTION}}. Las actualizaciones y mantenimientos menores están incluidos dentro de la tarifa mensual. Las modificaciones mayores se cotizarán por separado." },
            { heading: "TERCERA: VIGENCIA", body: "El presente contrato tendrá una vigencia de {{DURATION}} meses, renovable automáticamente por períodos iguales salvo notificación escrita de cualquiera de las partes con treinta (30) días de anticipación al vencimiento." },
            { heading: "CUARTA: NIVELES DE SERVICIO (SLA)", body: "EL PROVEEDOR garantiza una disponibilidad mínima del 99.5% del servicio. El tiempo máximo de respuesta ante incidencias será de cuatro (4) horas hábiles para incidencias críticas y veinticuatro (24) horas para incidencias menores." },
            { heading: "QUINTA: CONTRAPRESTACIÓN", body: "EL CLIENTE pagará la suma de {{CURRENCY}} {{MONTHLY_AMOUNT}} mensuales, con facturación al inicio de cada período. El pago deberá realizarse dentro de los cinco (5) días hábiles siguientes a la emisión de la factura." },
            { heading: "SEXTA: PROPIEDAD DE DATOS", body: "Todos los datos ingresados y generados por EL CLIENTE durante el uso del servicio son de propiedad exclusiva de EL CLIENTE. EL PROVEEDOR se compromete a facilitar la exportación de datos en caso de terminación del contrato." },
            { heading: "SÉPTIMA: CONFIDENCIALIDAD Y PROTECCIÓN DE DATOS", body: "EL PROVEEDOR se compromete a tratar los datos personales conforme a la Ley N° 29733, Ley de Protección de Datos Personales del Perú, y su reglamento. Se mantiene la obligación de confidencialidad por dos (2) años post-terminación." },
            { heading: "OCTAVA: TERMINACIÓN ANTICIPADA", body: "Cualquiera de las partes podrá dar por terminado el contrato con treinta (30) días de preaviso. No se realizarán reembolsos por períodos parciales no utilizados." },
            { heading: "NOVENA: SOLUCIÓN DE CONTROVERSIAS", body: "Las partes se someten a la jurisdicción de los Juzgados y Tribunales de {{CITY}}, Perú." },
        ]
    },
    "solutions-service": {
        title: "CONTRATO DE DESARROLLO DE SOFTWARE A MEDIDA",
        sections: [
            { heading: "PRIMERA: OBJETO DEL CONTRATO", body: "EL PROVEEDOR se compromete a desarrollar para EL CLIENTE el sistema/solución denominado \"{{SERVICE_NAME}}\", conforme al documento de requerimientos técnicos adjunto como Anexo A y la cotización {{QUOTE_REF}}." },
            { heading: "SEGUNDA: METODOLOGÍA DE DESARROLLO", body: "El desarrollo se ejecutará bajo metodología ágil (Scrum), con sprints de dos (2) semanas y revisiones periódicas con EL CLIENTE para validar el avance. EL CLIENTE designará un Product Owner para la toma de decisiones." },
            { heading: "TERCERA: PLAZO DE DESARROLLO", body: "El proyecto se ejecutará en un plazo estimado de {{DURATION}} días calendario, distribuidos en las fases definidas en el cronograma del Anexo B. Los cambios de alcance podrán impactar el plazo." },
            { heading: "CUARTA: ENTREGABLES POR FASE", body: "El proyecto se divide en las siguientes fases con hitos de entrega: {{MILESTONES}}. Cada entrega será validada por EL CLIENTE en un plazo máximo de cinco (5) días hábiles." },
            { heading: "QUINTA: CONTRAPRESTACIÓN Y ESQUEMA DE PAGOS", body: "La inversión total del proyecto es de {{CURRENCY}} {{TOTAL_AMOUNT}} ({{AMOUNT_WORDS}}). El esquema de pagos está vinculado a los hitos: {{PAYMENT_SCHEDULE}}." },
            { heading: "SEXTA: PROPIEDAD INTELECTUAL Y CÓDIGO FUENTE", body: "Una vez completado el pago total, EL CLIENTE recibirá la propiedad del código fuente desarrollado específicamente para el proyecto. Las librerías y frameworks de terceros mantienen sus licencias originales. EL PROVEEDOR conserva el derecho de usar frameworks, módulos y metodologías propias reutilizables." },
            { heading: "SÉPTIMA: GARANTÍA Y SOPORTE POST-ENTREGA", body: "EL PROVEEDOR otorga garantía de sesenta (60) días sobre el software desarrollado. La garantía cubre corrección de bugs y defectos funcionales. Mejoras, nuevas funcionalidades y cambios de alcance no están cubiertos por la garantía." },
            { heading: "OCTAVA: CAMBIOS DE ALCANCE", body: "Cualquier cambio de alcance respecto al documento de requerimientos original deberá ser formalizado por escrito y podrá generar un ajuste en el costo y plazo del proyecto, previa cotización adicional." },
            { heading: "NOVENA: CONFIDENCIALIDAD", body: "Las partes mantienen un acuerdo de confidencialidad bidireccional sobre toda la información técnica y comercial compartida, vigente por tres (3) años post-terminación." },
            { heading: "DÉCIMA: RESOLUCIÓN Y CONTROVERSIAS", body: "Las controversias se resolverán ante los Juzgados y Tribunales de {{CITY}}, Perú. En caso de resolución anticipada, EL CLIENTE pagará el trabajo efectivamente realizado." },
        ]
    },
    "infra-service": {
        title: "CONTRATO DE SERVICIOS DE INFRAESTRUCTURA TECNOLÓGICA",
        sections: [
            { heading: "PRIMERA: OBJETO DEL CONTRATO", body: "EL PROVEEDOR se compromete a proveer e instalar la infraestructura tecnológica descrita en la cotización {{QUOTE_REF}}, que incluye: {{SERVICE_NAME}}." },
            { heading: "SEGUNDA: ALCANCE DE LOS TRABAJOS", body: "El servicio comprende: {{SERVICE_DESCRIPTION}}. Incluye suministro de equipos, instalación, configuración, pruebas y puesta en marcha. La capacitación básica del personal de EL CLIENTE está incluida." },
            { heading: "TERCERA: PLAZO DE EJECUCIÓN", body: "Los trabajos de instalación se realizarán en un plazo de {{DURATION}} días calendario desde la recepción del adelanto y la confirmación de disponibilidad del sitio por parte de EL CLIENTE." },
            { heading: "CUARTA: EQUIPOS Y MATERIALES", body: "Los equipos incluidos son de marca y modelo especificados en la cotización. EL PROVEEDOR garantiza que los equipos son nuevos y cuentan con garantía de fábrica. Los números de serie serán registrados en el acta de entrega." },
            { heading: "QUINTA: CONTRAPRESTACIÓN", body: "El valor total del servicio es {{CURRENCY}} {{TOTAL_AMOUNT}} ({{AMOUNT_WORDS}}), distribuido conforme al cronograma: {{PAYMENT_SCHEDULE}}." },
            { heading: "SEXTA: GARANTÍA", body: "EL PROVEEDOR otorga garantía de {{WARRANTY_MONTHS}} meses sobre la instalación y configuración. Los equipos de hardware mantienen la garantía de fábrica. La garantía no cubre daños por mal uso, fluctuaciones eléctricas no protegidas o desastres naturales." },
            { heading: "SÉPTIMA: SOPORTE TÉCNICO", body: "EL PROVEEDOR brindará soporte técnico por los primeros treinta (30) días sin costo adicional. Posterior a dicho periodo, se ofrecerá un plan de soporte o mantenimiento bajo cotización separada." },
            { heading: "OCTAVA: ACTA DE CONFORMIDAD", body: "Al finalizar la instalación, se suscribirá un Acta de Conformidad firmada por ambas partes, la cual certificará que los trabajos fueron realizados conforme a lo pactado." },
            { heading: "NOVENA: RESOLUCIÓN Y CONTROVERSIAS", body: "Ante cualquier controversia, las partes se someten a la jurisdicción de los Juzgados de {{CITY}}, Perú." },
        ]
    },
    "infra-hardware": {
        title: "CONTRATO DE COMPRAVENTA DE EQUIPOS TECNOLÓGICOS",
        sections: [
            { heading: "PRIMERA: OBJETO DEL CONTRATO", body: "EL PROVEEDOR se compromete a vender a EL CLIENTE los equipos tecnológicos detallados en la cotización {{QUOTE_REF}}: {{SERVICE_NAME}}." },
            { heading: "SEGUNDA: ESPECIFICACIONES TÉCNICAS", body: "Los equipos cumplen con las especificaciones indicadas en el Anexo A. Marcas, modelos y números de serie serán documentados en la guía de remisión y acta de entrega." },
            { heading: "TERCERA: ENTREGA", body: "La entrega se realizará en un plazo máximo de {{DURATION}} días hábiles desde la confirmación del pedido y recepción del pago correspondiente. El lugar de entrega será: {{DELIVERY_ADDRESS}}." },
            { heading: "CUARTA: PRECIO Y FORMA DE PAGO", body: "El precio total de los equipos es de {{CURRENCY}} {{TOTAL_AMOUNT}} ({{AMOUNT_WORDS}}). Forma de pago: {{PAYMENT_SCHEDULE}}." },
            { heading: "QUINTA: GARANTÍA", body: "Los equipos cuentan con garantía de fábrica de {{WARRANTY_MONTHS}} meses. La garantía cubre defectos de fabricación y funcionamiento bajo uso normal. No cubre daños por mal uso, golpes, humedad o manipulaciones no autorizadas." },
            { heading: "SEXTA: TRANSFERENCIA DE PROPIEDAD", body: "La propiedad de los equipos se transferirá a EL CLIENTE una vez efectuado el pago total del precio pactado." },
            { heading: "SÉPTIMA: CONTROVERSIAS", body: "Las partes se someten a la jurisdicción de los Juzgados de {{CITY}}, Perú." },
        ]
    }
};

// =============================================
// QUERIES
// =============================================

export const getContractTemplateTypes = query({
    handler: async () => {
        return Object.entries(CONTRACT_TEMPLATES).map(([key, tmpl]) => ({
            key,
            title: tmpl.title,
            sectionCount: tmpl.sections.length,
        }));
    }
});

// Generate a contract preview with dynamic data interpolation
export const generateContract = query({
    args: {
        templateKey: v.string(),
        clientId: v.id("clients"),
        opportunityId: v.optional(v.id("opportunities")),
        customFields: v.optional(v.object({
            duration: v.optional(v.string()),
            city: v.optional(v.string()),
            warrantyMonths: v.optional(v.string()),
            deliveryAddress: v.optional(v.string()),
            billingCycle: v.optional(v.string()),
            paymentSchedule: v.optional(v.string()),
            monthlyAmount: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const template = CONTRACT_TEMPLATES[args.templateKey];
        if (!template) throw new Error("Plantilla no encontrada");

        const client = await ctx.db.get(args.clientId);
        if (!client) throw new Error("Cliente no encontrado");

        let opportunity: any = null;
        let packageInfo: any = null;
        let quoteRef = "N/A";
        let totalAmount = 0;

        if (args.opportunityId) {
            opportunity = await ctx.db.get(args.opportunityId);
            // Try to find the accepted quote
            const quotes: any[] = await (ctx.db as any).query("quotes")
                .filter((q: any) => q.eq(q.field("opportunityId"), args.opportunityId))
                .collect();
            const acceptedQuote = quotes.find((q: any) => q.status === "aceptado");
            if (acceptedQuote) {
                quoteRef = `COT-${acceptedQuote._id.substring(acceptedQuote._id.length - 6).toUpperCase()}`;
                totalAmount = acceptedQuote.total || 0;
            } else {
                totalAmount = opportunity?.estimatedValue || 0;
            }

            // Get package details
            if (opportunity?.packageId) {
                const packages = await ctx.db.query("packages").collect();
                packageInfo = packages.find(p => p.name === opportunity.packageId || p._id === opportunity.packageId);
            }
        }

        // Get project milestones if exists
        let milestonesText = "Según cronograma adjunto.";
        if (args.opportunityId) {
            const projects = await ctx.db.query("projects")
                .filter(q => q.eq(q.field("opportunityId"), args.opportunityId!))
                .collect();
            if (projects.length > 0 && projects[0].milestones.length > 0) {
                milestonesText = projects[0].milestones
                    .map((m, i) => `${i + 1}. ${m.name} (${m.percentage}%)`)
                    .join("; ");
            }
        }

        const cf = args.customFields || {};

        // Interpolation map
        const vars: Record<string, string> = {
            "{{CLIENT_NAME}}": client.companyName,
            "{{CLIENT_TAX_ID}}": client.taxId,
            "{{CLIENT_CONTACT}}": client.contactName,
            "{{SERVICE_NAME}}": packageInfo?.name || opportunity?.packageId || "[Nombre del Servicio]",
            "{{SERVICE_DESCRIPTION}}": packageInfo?.description || "[Descripción del servicio según cotización]",
            "{{QUOTE_REF}}": quoteRef,
            "{{TOTAL_AMOUNT}}": totalAmount.toLocaleString("es-PE", { minimumFractionDigits: 2 }),
            "{{AMOUNT_WORDS}}": "[monto en letras]",
            "{{CURRENCY}}": "S/",
            "{{MILESTONES}}": milestonesText,
            "{{PAYMENT_SCHEDULE}}": cf.paymentSchedule || "50% de adelanto a la firma del contrato y 50% contra entrega final.",
            "{{DURATION}}": cf.duration || "30",
            "{{CITY}}": cf.city || "Lima",
            "{{WARRANTY_MONTHS}}": cf.warrantyMonths || "12",
            "{{DELIVERY_ADDRESS}}": cf.deliveryAddress || "[Dirección de entrega]",
            "{{BILLING_CYCLE}}": cf.billingCycle || "mensual",
            "{{MONTHLY_AMOUNT}}": cf.monthlyAmount || totalAmount.toLocaleString("es-PE", { minimumFractionDigits: 2 }),
            "{{DATE}}": new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" }),
            "{{PROVIDER_NAME}}": "BYTEK S.A.C.S.",
            "{{PROVIDER_TAX_ID}}": "20XXXXXXXXX",
        };

        // Interpolate template
        const sections = template.sections.map(section => ({
            heading: section.heading,
            body: Object.entries(vars).reduce(
                (text, [key, value]) => text.replaceAll(key, value),
                section.body
            ),
        }));

        return {
            title: template.title,
            templateKey: args.templateKey,
            client: {
                name: client.companyName,
                taxId: client.taxId,
                contact: client.contactName,
            },
            sections,
            vars,
            generatedAt: Date.now(),
        };
    }
});

// =============================================
// SLAs DE CONTRATOS
// =============================================

export const createContractSLA = mutation({
    args: {
        contractDocumentId: v.id("legalDocuments"),
        metricName: v.string(),
        targetValue: v.number(),
        unit: v.union(v.literal("horas"), v.literal("porcentaje"), v.literal("minutos")),
        measurementPeriod: v.union(v.literal("mensual"), v.literal("trimestral"), v.literal("anual")),
        penaltyClause: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("contractSLAs", {
            ...args,
            currentValue: undefined,
            isCompliant: undefined,
        });
    }
});

export const getContractSLAs = query({
    args: { contractDocumentId: v.id("legalDocuments") },
    handler: async (ctx, args) => {
        return await ctx.db.query("contractSLAs")
            .withIndex("by_contract", q => q.eq("contractDocumentId", args.contractDocumentId))
            .collect();
    }
});

export const updateSLACompliance = mutation({
    args: {
        slaId: v.id("contractSLAs"),
        currentValue: v.number(),
    },
    handler: async (ctx, args) => {
        const sla = await ctx.db.get(args.slaId);
        if (!sla) throw new Error("SLA no encontrado.");

        let isCompliant = false;
        if (sla.unit === "porcentaje") {
            isCompliant = args.currentValue >= sla.targetValue;
        } else {
            // Para horas/minutos, menor es mejor (tiempo de respuesta)
            isCompliant = args.currentValue <= sla.targetValue;
        }

        await ctx.db.patch(args.slaId, {
            currentValue: args.currentValue,
            isCompliant,
        });

        return { isCompliant };
    }
});

export const getSLADashboard = query({
    args: {},
    handler: async (ctx) => {
        const allSLAs = await ctx.db.query("contractSLAs").collect();

        const withContract = await Promise.all(allSLAs.map(async (sla) => {
            const contract = await ctx.db.get(sla.contractDocumentId);
            return {
                ...sla,
                contractTitle: contract?.title || "Desconocido",
            };
        }));

        const total = withContract.length;
        const compliant = withContract.filter(s => s.isCompliant === true).length;
        const nonCompliant = withContract.filter(s => s.isCompliant === false).length;
        const pending = withContract.filter(s => s.isCompliant === undefined).length;

        return {
            slas: withContract,
            summary: {
                total,
                compliant,
                nonCompliant,
                pending,
                complianceRate: total > 0 ? Math.round((compliant / (total - pending)) * 10000) / 100 : 0,
            }
        };
    }
});

export const deleteContractSLA = mutation({
    args: { slaId: v.id("contractSLAs") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.slaId);
    }
});
