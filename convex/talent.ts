import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// ATS: JOB POSTINGS
// ==========================================

export const getJobPostings = query({
    handler: async (ctx) => {
        const postings = await ctx.db.query("jobPostings").order("desc").collect();
        return await Promise.all(postings.map(async (posting) => {
            const department = posting.departmentId ? await ctx.db.get(posting.departmentId) : null;
            return {
                ...posting,
                departmentName: department?.name ?? "General",
            };
        }));
    }
});

export const createJobPosting = mutation({
    args: {
        title: v.string(),
        departmentId: v.optional(v.id("departments")),
        requirements: v.string(),
        openings: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("jobPostings", {
            ...args,
            status: "draft",
            createdAt: Date.now(),
        });
    }
});

export const updateJobStatus = mutation({
    args: {
        postingId: v.id("jobPostings"),
        status: v.union(v.literal("open"), v.literal("closed"), v.literal("draft")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.patch(args.postingId, { status: args.status });
    }
});


// ==========================================
// ATS: CANDIDATES
// ==========================================

export const getCandidates = query({
    args: { postingId: v.optional(v.id("jobPostings")) },
    handler: async (ctx, args) => {
        const candidates = args.postingId
            ? await ctx.db.query("candidates").withIndex("by_posting", q => q.eq("jobPostingId", args.postingId!)).order("desc").collect()
            : await ctx.db.query("candidates").order("desc").collect();

        return await Promise.all(candidates.map(async (candidate) => {
            const posting = await ctx.db.get(candidate.jobPostingId);
            return {
                ...candidate,
                jobTitle: posting?.title ?? "Unknown Position",
            };
        }));
    }
});

export const addCandidate = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        jobPostingId: v.id("jobPostings"),
        resumeUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("candidates", {
            ...args,
            status: "new",
            appliedAt: Date.now(),
        });
    }
});

export const updateCandidateStatus = mutation({
    args: {
        candidateId: v.id("candidates"),
        status: v.union(v.literal("new"), v.literal("screening"), v.literal("interview"), v.literal("offer"), v.literal("hired"), v.literal("rejected")),
        score: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const prevCandidate = await ctx.db.get(args.candidateId);

        const updated = await ctx.db.patch(args.candidateId, {
            status: args.status,
            ...(args.score !== undefined ? { score: args.score } : {})
        });

        // Trigger: Automate Employee Profile creation on 'hired'
        if (args.status === "hired" && prevCandidate?.status !== "hired") {
            // Check if user already exists
            const existingUsers = await ctx.db.query("users").filter(q => q.eq(q.field("email"), prevCandidate?.email)).collect();
            let userId;

            if (existingUsers.length === 0) {
                // Generate a dummy user since Auth isn't triggered here natively, or we can just create the user record
                userId = await ctx.db.insert("users", {
                    name: prevCandidate!.name,
                    email: prevCandidate!.email!,
                    // Arbitrary image to satisfy schema if needed, but not strictly required
                });
            } else {
                userId = existingUsers[0]._id;
            }

            // Create HR Employee Profile
            const existingProfiles = await ctx.db.query("employeeProfiles").withIndex("by_user", q => q.eq("userId", userId)).collect();
            if (existingProfiles.length === 0) {
                await ctx.db.insert("employeeProfiles", {
                    userId: userId,
                    contractType: "planilla",
                    baseSalary: 0,
                    status: "activo",
                    hireDate: Date.now(),
                    createdAt: Date.now()
                });
            }
        }

        return updated;
    }
});


// ==========================================
// EVALUATIONS
// ==========================================

export const getEvaluations = query({
    args: { userId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        const evals = args.userId
            ? await ctx.db.query("evaluations").withIndex("by_user", q => q.eq("userId", args.userId!)).order("desc").collect()
            : await ctx.db.query("evaluations").order("desc").collect();

        return await Promise.all(evals.map(async (evalRecord) => {
            const evaluator = await ctx.db.get(evalRecord.evaluatorId);
            return {
                ...evalRecord,
                evaluatorName: evaluator?.name ?? "Unknown",
            };
        }));
    }
});

export const addEvaluation = mutation({
    args: {
        userId: v.id("users"),
        evaluatorId: v.id("users"),
        period: v.string(),
        type: v.union(v.literal("360"), v.literal("peer"), v.literal("manager")),
        score: v.number(),
        feedback: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("evaluations", {
            ...args,
            createdAt: Date.now(),
        });
    }
});


// ==========================================
// SKILLS MATRIX
// ==========================================

export const getSkills = query({
    args: { userId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        const skillsCollection = args.userId
            ? await ctx.db.query("skills").withIndex("by_user", q => q.eq("userId", args.userId!)).collect()
            : await ctx.db.query("skills").collect();
        return await Promise.all(skillsCollection.map(async (sk) => {
            const user = await ctx.db.get(sk.userId);
            return {
                ...sk,
                userName: user?.name ?? "Unknown User",
            };
        }));
    }
});

export const addOrUpdateSkill = mutation({
    args: {
        userId: v.id("users"),
        skillName: v.string(),
        proficiencyLevel: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"), v.literal("expert")),
        isCertified: v.boolean(),
    },
    handler: async (ctx, args) => {
        // Check if skill already exists for user
        const existing = await ctx.db.query("skills")
            .withIndex("by_user", q => q.eq("userId", args.userId))
            .filter(q => q.eq(q.field("skillName"), args.skillName))
            .first();

        if (existing) {
            return await ctx.db.patch(existing._id, {
                proficiencyLevel: args.proficiencyLevel,
                isCertified: args.isCertified
            });
        }

        return await ctx.db.insert("skills", {
            ...args,
        });
    }
});


// ==========================================
// TRAININGS
// ==========================================

export const getTrainings = query({
    handler: async (ctx) => {
        return await ctx.db.query("trainings").order("desc").collect();
    }
});

export const getTrainingAttendees = query({
    args: { trainingId: v.id("trainings") },
    handler: async (ctx, args) => {
        const attendees = await ctx.db.query("trainingAttendees")
            .withIndex("by_training", q => q.eq("trainingId", args.trainingId))
            .collect();

        return await Promise.all(attendees.map(async (att) => {
            const user = await ctx.db.get(att.userId);
            return {
                ...att,
                userName: user?.name ?? "Unknown",
            };
        }));
    }
});

export const addTraining = mutation({
    args: {
        title: v.string(),
        provider: v.string(),
        cost: v.number(),
        date: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("trainings", {
            ...args,
            status: "planned",
        });
    }
});

export const enrollUser = mutation({
    args: {
        trainingId: v.id("trainings"),
        userId: v.id("users")
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("trainingAttendees", {
            trainingId: args.trainingId,
            userId: args.userId,
        });
    }
});
