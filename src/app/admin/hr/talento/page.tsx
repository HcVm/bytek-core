"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Briefcase, Plus, Users, Award, Star, BookOpen, Building, ChevronRight, CheckCircle2, MoreHorizontal, Target, Calendar } from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function TalentoPage() {
    // Data Queries
    const postings = useQuery(api.talent.getJobPostings) || [];
    const candidates = useQuery(api.talent.getCandidates, {}) || [];
    const users = useQuery(api.users.getAllUsers) || [];
    const evaluations = useQuery(api.talent.getEvaluations, {}) || [];
    const skills = useQuery(api.talent.getSkills, {}) || [];
    const trainings = useQuery(api.talent.getTrainings) || [];

    // UI State
    const [activeTab, setActiveTab] = useState<"ats" | "evaluaciones" | "skills" | "trainings">("ats");

    // Modals ATS
    const [isAddJobOpen, setIsAddJobOpen] = useState(false);
    const [newJob, setNewJob] = useState({ title: "", requirements: "", openings: 1, departmentId: "" });
    const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
    const [newCandidate, setNewCandidate] = useState({ name: "", email: "", phone: "", jobPostingId: "" });

    // Modals HR Tabs
    const [isAddEvalOpen, setIsAddEvalOpen] = useState(false);
    const [newEval, setNewEval] = useState({ userId: "", evaluatorId: "", period: "2026-Q1", type: "360", score: 5, feedback: "" });

    const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
    const [newSkill, setNewSkill] = useState({ userId: "", skillName: "", proficiencyLevel: "intermediate", isCertified: false });

    const [isAddTrainingOpen, setIsAddTrainingOpen] = useState(false);
    const [newTraining, setNewTraining] = useState({ title: "", provider: "", cost: 0, date: "" });

    // Mutations
    const createJob = useMutation(api.talent.createJobPosting);
    const addCandidate = useMutation(api.talent.addCandidate);
    const updateCandidateStatus = useMutation(api.talent.updateCandidateStatus);
    const updateJobStatus = useMutation(api.talent.updateJobStatus);
    const addEvaluation = useMutation(api.talent.addEvaluation);
    const addOrUpdateSkill = useMutation(api.talent.addOrUpdateSkill);
    const addTraining = useMutation(api.talent.addTraining);

    // Handlers
    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        await createJob({
            title: newJob.title,
            requirements: newJob.requirements,
            openings: Number(newJob.openings),
            departmentId: newJob.departmentId ? newJob.departmentId as Id<"departments"> : undefined
        });
        setIsAddJobOpen(false);
        setNewJob({ title: "", requirements: "", openings: 1, departmentId: "" });
    };

    const handleAddCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        await addCandidate({
            name: newCandidate.name,
            email: newCandidate.email,
            phone: newCandidate.phone,
            jobPostingId: newCandidate.jobPostingId as Id<"jobPostings">,
            resumeUrl: ""
        });
        setIsAddCandidateOpen(false);
        setNewCandidate({ name: "", email: "", phone: "", jobPostingId: "" });
    };

    const handleAddEval = async (e: React.FormEvent) => {
        e.preventDefault();
        await addEvaluation({
            userId: newEval.userId as Id<"users">,
            evaluatorId: newEval.evaluatorId as Id<"users">,
            period: newEval.period,
            type: newEval.type as any,
            score: Number(newEval.score),
            feedback: newEval.feedback
        });
        setIsAddEvalOpen(false);
    };

    const handleAddSkill = async (e: React.FormEvent) => {
        e.preventDefault();
        await addOrUpdateSkill({
            userId: newSkill.userId as Id<"users">,
            skillName: newSkill.skillName,
            proficiencyLevel: newSkill.proficiencyLevel as any,
            isCertified: newSkill.isCertified
        });
        setIsAddSkillOpen(false);
    };

    const handleAddTraining = async (e: React.FormEvent) => {
        e.preventDefault();
        await addTraining({
            title: newTraining.title,
            provider: newTraining.provider,
            cost: Number(newTraining.cost),
            date: new Date(newTraining.date).getTime()
        });
        setIsAddTrainingOpen(false);
    };

    return (
        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                            <Briefcase className="w-8 h-8 text-emerald-500" />
                            Talento Humano
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Reclutamiento (ATS), Matriz de Habilidades, Evaluaciones Desempeño y Capacitación.</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-800 space-x-8">
                    <button
                        onClick={() => setActiveTab("ats")}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "ats" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
                    >
                        Reclutamiento (ATS)
                    </button>
                    <button
                        onClick={() => setActiveTab("evaluaciones")}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "evaluaciones" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
                    >
                        Evaluaciones
                    </button>
                    <button
                        onClick={() => setActiveTab("skills")}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "skills" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
                    >
                        Matriz Habilidades
                    </button>
                    <button
                        onClick={() => setActiveTab("trainings")}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "trainings" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
                    >
                        Capacitaciones
                    </button>
                </div>

                {/* Tab: ATS */}
                {activeTab === "ats" && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                                Vacantes Abiertas (Job Postings)
                            </h2>
                            <button onClick={() => setIsAddJobOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-500/10 active:scale-95">
                                <Plus className="w-4 h-4" /> Nueva Vacante
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {postings.map((job) => (
                                <div key={job._id} className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all group shadow-sm hover:shadow-xl hover:shadow-emerald-500/5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{job.title}</h3>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-1">
                                                <Building className="w-4 h-4" /> {job.departmentName}
                                            </p>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${job.status === "open" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : job.status === "closed" ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                                            {job.status === "open" ? "Abierta" : job.status === "closed" ? "Cerrada" : "Borrador"}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <div className="text-sm"><span className="text-zinc-500 dark:text-zinc-400">Vacantes: </span><span className="text-zinc-900 dark:text-white font-medium">{job.openings}</span></div>
                                        <div className="text-sm"><span className="text-zinc-500 dark:text-zinc-400">Candidatos: </span><span className="text-zinc-900 dark:text-white font-medium">{candidates.filter((c: any) => c.jobPostingId === job._id).length}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Kanban ATS para Candidatos */}
                        <div className="mt-12">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                    <Target className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                                    Pipeline de Candidatos (Kanban)
                                </h2>
                                <button onClick={() => setIsAddCandidateOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/10 active:scale-95">
                                    <Plus className="w-4 h-4" /> Agregar Candidato
                                </button>
                            </div>

                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {[
                                    { id: "new", title: "Nuevos", color: "border-blue-500/50" },
                                    { id: "screening", title: "Filtrado", color: "border-amber-500/50" },
                                    { id: "interview", title: "Entrevistas", color: "border-purple-500/50" },
                                    { id: "offer", title: "Oferta", color: "border-indigo-500/50" },
                                    { id: "hired", title: "Contratados", color: "border-emerald-500/50" }
                                ].map((column) => (
                                    <div key={column.id} className="min-w-[300px] w-[300px] bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-xl flex flex-col max-h-[600px] border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                                        <div className={`p-4 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-white flex items-center justify-between border-t-2 rounded-t-xl ${column.color}`}>
                                            <span>{column.title}</span>
                                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full text-xs">{(candidates as any[]).filter(c => c.status === column.id).length}</span>
                                        </div>
                                        <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                                            {(candidates as any[]).filter(c => c.status === column.id).map(candidate => (
                                                <div key={candidate._id} className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg cursor-grab active:cursor-grabbing hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all group shadow-sm">
                                                    <h4 className="font-medium text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{candidate.name}</h4>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-3">{candidate.jobTitle}</p>
                                                    <div className="flex justify-between items-center pt-3 border-t border-zinc-200 dark:border-zinc-800">
                                                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Score: {candidate.score ?? "N/A"}</span>
                                                        <select
                                                            className="text-xs bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded border border-zinc-200 dark:border-zinc-800 outline-none px-2 py-1 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                                            value={candidate.status}
                                                            onChange={(e) => updateCandidateStatus({ candidateId: candidate._id, status: e.target.value as any })}
                                                        >
                                                            <option value="new">Nuevos</option>
                                                            <option value="screening">Filtrado</option>
                                                            <option value="interview">Entrevistas</option>
                                                            <option value="offer">Oferta</option>
                                                            <option value="hired">Contratado</option>
                                                            <option value="rejected">Rechazado</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}
                                            {(candidates as any[]).filter(c => c.status === column.id).length === 0 && (
                                                <div className="h-20 flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-400 dark:text-zinc-600">
                                                    Vacío
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Evaluaciones */}
                {activeTab === "evaluaciones" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                Evaluaciones de Desempeño
                            </h2>
                            <button onClick={() => setIsAddEvalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-500/10 active:scale-95">
                                <Plus className="w-4 h-4" /> Nueva Evaluación
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {evaluations.map((ev: any) => (
                                <div key={ev._id} className="bg-white dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-6 hover:border-amber-500/30 dark:hover:border-amber-500/50 transition-all shadow-sm hover:shadow-xl hover:shadow-amber-500/10 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Star className="w-16 h-16 text-amber-500" />
                                    </div>
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Periodo {ev.period}</h3>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5" /> Evaluador: {ev.evaluatorName}
                                            </p>
                                        </div>
                                        <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 border border-amber-100 dark:border-amber-500/20">
                                            <Star className="w-4 h-4 fill-amber-500" /> {ev.score}/5
                                        </div>
                                    </div>
                                    <div className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl mb-6 min-h-[80px] line-clamp-3 italic border border-zinc-100 dark:border-zinc-800/50 relative z-10">
                                        "{ev.feedback}"
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800/50 text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase relative z-10">
                                        <span className="flex items-center gap-1">
                                            <Target className="w-3 h-3" /> TIPO: {ev.type}
                                        </span>
                                        <span>ID: ...{ev.userId.slice(-6)}</span>
                                    </div>
                                </div>
                            ))}
                            {evaluations.length === 0 && (
                                <div className="col-span-full py-20 text-center text-zinc-500 dark:text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800/50 rounded-2xl bg-white dark:bg-zinc-900/20 backdrop-blur-sm">
                                    <Star className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                                    <p className="text-lg font-medium">No hay evaluaciones registradas</p>
                                    <p className="text-sm mt-1">Comienza agregando la primera evaluación de desempeño.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab: Skills */}
                {activeTab === "skills" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                                Matriz de Habilidades
                            </h2>
                            <button onClick={() => setIsAddSkillOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-500/10 active:scale-95">
                                <Plus className="w-4 h-4" /> Registrar Habilidad
                            </button>
                        </div>
                        <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-50/50 dark:bg-zinc-800/30 border-b border-zinc-200 dark:border-zinc-800/50">
                                            <th className="p-5 font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-[10px]">Empleado</th>
                                            <th className="p-5 font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-[10px]">Habilidad</th>
                                            <th className="p-5 font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-[10px]">Nivel</th>
                                            <th className="p-5 font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-[10px]">Certificación</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                        {skills.map((sk: any) => (
                                            <tr key={sk._id} className="group transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-xs border border-indigo-500/20">
                                                            {sk.userName?.charAt(0) || "U"}
                                                        </div>
                                                        <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{sk.userName}</span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-zinc-600 dark:text-zinc-400 font-medium">{sk.skillName}</td>
                                                <td className="p-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${sk.proficiencyLevel === "expert" ? "bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20" :
                                                        sk.proficiencyLevel === "advanced" ? "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20" :
                                                            sk.proficiencyLevel === "intermediate" ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" :
                                                                "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                                                        }`}>
                                                        {sk.proficiencyLevel}
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    {sk.isCertified ? (
                                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                                            <CheckCircle2 className="w-4 h-4" /> SI
                                                        </div>
                                                    ) : (
                                                        <span className="text-zinc-300 dark:text-zinc-700 text-xs font-bold uppercase">No</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {skills.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-20 text-center">
                                                    <Award className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                                                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">No hay habilidades registradas</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Trainings */}
                {activeTab === "trainings" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                Plan de Capacitación
                            </h2>
                            <button onClick={() => setIsAddTrainingOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-500/10 active:scale-95">
                                <Plus className="w-4 h-4" /> Nueva Capacitación
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {trainings.map((tr: any) => (
                                <div key={tr._id} className="bg-white dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-6 hover:border-blue-500/30 dark:hover:border-blue-500/50 transition-all flex flex-col shadow-sm group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{tr.title}</h3>
                                            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-2 font-medium">
                                                <Building className="w-3.5 h-3.5" /> {tr.provider}
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${tr.status === "planned" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20" :
                                            tr.status === "in_progress" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20" :
                                                "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                                            }`}>
                                            {tr.status === "planned" ? "Planificado" : tr.status === "in_progress" ? "En curso" : "Completado"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Fecha Inicio</span>
                                            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm">
                                                <Calendar className="w-4 h-4 text-blue-500" />
                                                {new Date(tr.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Inversión</span>
                                            <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                                S/ {tr.cost.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {trainings.length === 0 && (
                                <div className="col-span-full py-24 text-center text-zinc-500 dark:text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800/50 rounded-2xl bg-white dark:bg-zinc-900/20 backdrop-blur-sm">
                                    <BookOpen className="w-16 h-16 text-zinc-200 dark:text-zinc-800 mx-auto mb-4 opacity-50" />
                                    <p className="text-xl font-bold">No hay capacitaciones programadas</p>
                                    <p className="text-sm mt-1">Coordina y registra nuevas capacitaciones para el equipo.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modals ATS (Vacante y Candidato) */}
                {isAddJobOpen && (
                    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                                <Briefcase className="w-6 h-6 text-emerald-500" />
                                Nueva Vacante
                            </h2>
                            <form onSubmit={handleCreateJob} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Título del Puesto</label>
                                    <input type="text" required value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium" placeholder="Ex: Senior Fullstack Developer" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Requisitos Detallados</label>
                                    <textarea required value={newJob.requirements} onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium h-32 resize-none" placeholder="Lista de habilidades, experiencia..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Número de Vacantes</label>
                                    <input type="number" min="1" required value={newJob.openings} onChange={(e) => setNewJob({ ...newJob, openings: Number(e.target.value) })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium" />
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setIsAddJobOpen(false)} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">Cancelar</button>
                                    <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Publicar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isAddCandidateOpen && (
                    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                                <Plus className="w-6 h-6 text-indigo-500" />
                                Nuevo Candidato
                            </h2>
                            <form onSubmit={handleAddCandidate} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                                    <input type="text" required value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium" placeholder="Ex: Juan Perez" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                                    <input type="email" required value={newCandidate.email} onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium" placeholder="juan.perez@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Vacante Seleccionada</label>
                                    <select required value={newCandidate.jobPostingId} onChange={(e) => setNewCandidate({ ...newCandidate, jobPostingId: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium appearance-none">
                                        <option value="">Seleccione...</option>
                                        {postings.filter((p: any) => p.status === "open").map((listing: any) => (
                                            <option key={listing._id} value={listing._id}>{listing.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setIsAddCandidateOpen(false)} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">Cancelar</button>
                                    <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">Agregar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modals Evaluaciones */}
                {isAddEvalOpen && (
                    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                                <Star className="w-6 h-6 text-amber-500" />
                                Registrar Evaluación
                            </h2>
                            <form onSubmit={handleAddEval} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Empleado a Evaluar</label>
                                    <select required value={newEval.userId} onChange={(e) => setNewEval({ ...newEval, userId: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all font-medium appearance-none">
                                        <option value="">Seleccione empleado...</option>
                                        {users.map((u: any) => <option key={u._id} value={u._id}>{u.name ?? u.email}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Evaluador</label>
                                    <select required value={newEval.evaluatorId} onChange={(e) => setNewEval({ ...newEval, evaluatorId: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all font-medium appearance-none">
                                        <option value="">Seleccione evaluador...</option>
                                        {users.map((u: any) => <option key={u._id} value={u._id}>{u.name ?? u.email}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Periodo</label>
                                        <input type="text" required value={newEval.period} onChange={(e) => setNewEval({ ...newEval, period: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all font-medium" placeholder="Ex: 2026-Q1" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Puntaje (1-5)</label>
                                        <input type="number" min="1" max="5" required value={newEval.score} onChange={(e) => setNewEval({ ...newEval, score: Number(e.target.value) })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Feedback / Comentarios</label>
                                    <textarea required value={newEval.feedback} onChange={(e) => setNewEval({ ...newEval, feedback: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all font-medium h-24 resize-none" />
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setIsAddEvalOpen(false)} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">Cancelar</button>
                                    <button type="submit" className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-500 shadow-lg shadow-amber-500/20 active:scale-95 transition-all">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modals Skills */}
                {isAddSkillOpen && (
                    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                                <Award className="w-6 h-6 text-indigo-500" />
                                Registrar Habilidad
                            </h2>
                            <form onSubmit={handleAddSkill} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Empleado</label>
                                    <select required value={newSkill.userId} onChange={(e) => setNewSkill({ ...newSkill, userId: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium appearance-none">
                                        <option value="">Seleccione empleado...</option>
                                        {users.map((u: any) => <option key={u._id} value={u._id}>{u.name ?? u.email}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Nombre de la Habilidad</label>
                                    <input type="text" required value={newSkill.skillName} onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium" placeholder="Ex: React, UX/UI, Python..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Nivel Proficiencia</label>
                                    <select required value={newSkill.proficiencyLevel} onChange={(e) => setNewSkill({ ...newSkill, proficiencyLevel: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium appearance-none">
                                        <option value="beginner">Principiante</option>
                                        <option value="intermediate">Intermedio</option>
                                        <option value="advanced">Avanzado</option>
                                        <option value="expert">Experto</option>
                                    </select>
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer group p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900">
                                    <div className="relative flex items-center">
                                        <input type="checkbox" checked={newSkill.isCertified} onChange={(e) => setNewSkill({ ...newSkill, isCertified: e.target.checked })} className="peer w-5 h-5 opacity-0 absolute cursor-pointer" />
                                        <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-700 rounded peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Cuenta con certificación oficial</span>
                                </label>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setIsAddSkillOpen(false)} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">Cancelar</button>
                                    <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">Registrar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modals Capacitaciones */}
                {isAddTrainingOpen && (
                    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                                <BookOpen className="w-6 h-6 text-blue-500" />
                                Programar Capacitación
                            </h2>
                            <form onSubmit={handleAddTraining} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Título / Tema</label>
                                    <input type="text" required value={newTraining.title} onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium" placeholder="Ex: Workshop Arquitectura Cloud" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Proveedor / Instructor</label>
                                    <input type="text" required value={newTraining.provider} onChange={(e) => setNewTraining({ ...newTraining, provider: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium" placeholder="Ex: AWS Academy, Platzi, etc." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Inversión (S/)</label>
                                        <input type="number" required value={newTraining.cost} onChange={(e) => setNewTraining({ ...newTraining, cost: Number(e.target.value) })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Fecha</label>
                                        <input type="date" required value={newTraining.date} onChange={(e) => setNewTraining({ ...newTraining, date: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium" />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setIsAddTrainingOpen(false)} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">Cancelar</button>
                                    <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Programar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
