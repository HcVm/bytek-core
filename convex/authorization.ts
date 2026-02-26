import { QueryCtx, MutationCtx } from "./_generated/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

// =============================================
// RBAC — Control de Acceso Basado en Roles
// =============================================

type UserRole = "admin" | "sales" | "technician" | "developer" | "client";
type Module = "accounting" | "hr" | "crm" | "projects" | "inventory" | "contracts" | "legal" | "field_service" | "dev" | "client_portal" | "settings";
type Action = "read" | "write" | "delete" | "approve";

// Mapa de permisos: rol → módulo → acciones permitidas
const ROLE_PERMISSIONS: Record<UserRole, Record<Module, Action[]>> = {
    admin: {
        accounting: ["read", "write", "delete", "approve"],
        hr: ["read", "write", "delete", "approve"],
        crm: ["read", "write", "delete", "approve"],
        projects: ["read", "write", "delete", "approve"],
        inventory: ["read", "write", "delete", "approve"],
        contracts: ["read", "write", "delete", "approve"],
        legal: ["read", "write", "delete", "approve"],
        field_service: ["read", "write", "delete", "approve"],
        dev: ["read", "write", "delete", "approve"],
        client_portal: ["read", "write", "delete", "approve"],
        settings: ["read", "write", "delete", "approve"],
    },
    sales: {
        accounting: ["read"],
        hr: [],
        crm: ["read", "write", "delete"],
        projects: ["read"],
        inventory: ["read"],
        contracts: ["read", "write"],
        legal: ["read"],
        field_service: [],
        dev: [],
        client_portal: ["read"],
        settings: [],
    },
    developer: {
        accounting: [],
        hr: [],
        crm: ["read"],
        projects: ["read"],
        inventory: [],
        contracts: [],
        legal: [],
        field_service: [],
        dev: ["read", "write", "delete"],
        client_portal: [],
        settings: [],
    },
    technician: {
        accounting: [],
        hr: [],
        crm: ["read"],
        projects: ["read"],
        inventory: ["read", "write"],
        contracts: [],
        legal: [],
        field_service: ["read", "write"],
        dev: [],
        client_portal: [],
        settings: [],
    },
    client: {
        accounting: [],
        hr: [],
        crm: [],
        projects: [],
        inventory: [],
        contracts: [],
        legal: [],
        field_service: [],
        dev: [],
        client_portal: ["read", "write"],
        settings: [],
    },
};

/**
 * Helper: Obtener el usuario autenticado y verificar su rol
 * Uso: const user = await assertRole(ctx, ["admin", "sales"]);
 */
export async function assertRole(
    ctx: QueryCtx | MutationCtx,
    allowedRoles: UserRole[]
): Promise<{ _id: any; role: UserRole; name: string | undefined }> {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("No autorizado: Sesión no válida.");
    }

    // Buscar usuario por email
    const user = await ctx.db.query("users")
        .withIndex("email", q => q.eq("email", identity.email))
        .unique();

    if (!user) {
        throw new Error("No autorizado: Usuario no encontrado en el sistema.");
    }

    const userRole = (user.role || "client") as UserRole;

    if (!allowedRoles.includes(userRole)) {
        throw new Error(`Acceso denegado: Tu rol (${userRole}) no tiene permiso para esta acción. Roles permitidos: ${allowedRoles.join(", ")}.`);
    }

    return { _id: user._id, role: userRole, name: user.name };
}

/**
 * Helper: Verificar permiso específico por módulo y acción
 * Uso: await assertPermission(ctx, "accounting", "write");
 */
export async function assertPermission(
    ctx: QueryCtx | MutationCtx,
    module: Module,
    action: Action
): Promise<{ _id: any; role: UserRole; name: string | undefined }> {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("No autorizado: Sesión no válida.");
    }

    const user = await ctx.db.query("users")
        .withIndex("email", q => q.eq("email", identity.email))
        .unique();

    if (!user) {
        throw new Error("No autorizado: Usuario no encontrado.");
    }

    const userRole = (user.role || "client") as UserRole;
    const permissions = ROLE_PERMISSIONS[userRole]?.[module] || [];

    if (!permissions.includes(action)) {
        throw new Error(`Acceso denegado: Tu rol (${userRole}) no puede realizar '${action}' en el módulo '${module}'.`);
    }

    return { _id: user._id, role: userRole, name: user.name };
}

// =============================================
// QUERY: Obtener permisos del usuario actual
// =============================================

export const getMyPermissions = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db.query("users")
            .withIndex("email", q => q.eq("email", identity.email))
            .unique();

        if (!user) return null;

        const userRole = (user.role || "client") as UserRole;
        return {
            role: userRole,
            permissions: ROLE_PERMISSIONS[userRole] || {},
        };
    }
});

export const getRolePermissions = query({
    args: { role: v.string() },
    handler: async (_ctx, args) => {
        const role = args.role as UserRole;
        return ROLE_PERMISSIONS[role] || {};
    }
});
