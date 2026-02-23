import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const saveDocument = mutation({
    args: {
        title: v.string(),
        fileId: v.string(), // Storage ID returned by generateUploadUrl upload
        uploadedBy: v.id("users"),
        departmentId: v.optional(v.id("departments")),
        category: v.union(v.literal("policy"), v.literal("manual"), v.literal("memo"), v.literal("other")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("documents", {
            title: args.title,
            fileId: args.fileId,
            uploadedBy: args.uploadedBy,
            departmentId: args.departmentId,
            category: args.category,
            createdAt: Date.now(),
        });
    },
});

export const getDocumentsQuery = query({
    args: {
        departmentId: v.optional(v.id("departments")), // If undefined, fetch public docs
    },
    handler: async (ctx, args) => {
        let docs;
        if (args.departmentId) {
            docs = await ctx.db
                .query("documents")
                .withIndex("by_department", (q) => q.eq("departmentId", args.departmentId))
                .order("desc")
                .collect();
        } else {
            // Fetch public docs (departmentId == undefined represents company-wide)
            docs = await ctx.db
                .query("documents")
                .filter((q) => q.eq(q.field("departmentId"), undefined))
                .order("desc")
                .collect();
        }

        // Map storage IDs to actual temporary URLs for download
        const docsWithUrls = await Promise.all(
            docs.map(async (doc) => {
                const url = await ctx.storage.getUrl(doc.fileId);
                return { ...doc, downloadUrl: url };
            })
        );
        return docsWithUrls;
    },
});
