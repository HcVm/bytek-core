// Esquema conceptual de Tablas en Convex (schema.ts)
// Este documento sirve como guía para entender cómo se relacionan los datos de las distintas Unidades de Negocio.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ==========================================
  // UNIDAD COMÚN (Gestión de Usuarios y Clientes)
  // ==========================================
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("admin"), 
      v.literal("sales"), 
      v.literal("technician"), // Unidad 3
      v.literal("developer"),  // Unidad 2
      v.literal("client")      // Portal autoservicio
    ),
    active: v.boolean(),
  }).index("by_email", ["email"]),

  clients: defineTable({
    companyName: v.string(),
    taxId: v.string(), // RUC (Perú, por ejemplo)
    contactName: v.string(),
    phone: v.string(),
    status: v.string(), // "prospect", "active", "churned"
  }).index("by_taxId", ["taxId"]),

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
});
