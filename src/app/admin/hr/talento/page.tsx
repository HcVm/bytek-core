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
        <div className="flex-1 overflow-y-auto bg-slate-50">
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <Briefcase className="w-8 h-8 text-emerald-500" />
                            Talento Humano
                        </h1>
                        <p className="text-slate-500 mt-2">Reclutamiento (ATS), Matriz de Habilidades, Evaluaciones Desempeño y Capacitación.</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-200 space-x-8">
                    <button
                        onClick={() => setActiveTab("ats")}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "ats" ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
                    >
                        Reclutamiento (ATS)
                    </button>
                    <button
                        onClick={() => setActiveTab("evaluaciones")}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "evaluaciones" ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
                    >
                        Evaluaciones
                    </button>
                    <button
                        onClick={() => setActiveTab("skills")}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "skills" ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
                    >
                        Matriz Habilidades
                    </button>
                    <button
                        onClick={() => setActiveTab("trainings")}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "trainings" ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
                    >
                        Capacitaciones
                    </button>
                </div>

                {/* Tab: ATS */}
                {activeTab === "ats" && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-slate-500" />
                                Vacantes Abiertas (Job Postings)
                            </h2>
                            <button onClick={() => setIsAddJobOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">
                                <Plus className="w-4 h-4" /> Nueva Vacante
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {postings.map((job) => (
                                <div key={job._id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                                <Building className="w-4 h-4" /> {job.departmentName}
                                            </p>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${job.status === "open" ? "bg-emerald-50 text-emerald-600" : job.status === "closed" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
                                            {job.status === "open" ? "Abierta" : job.status === "closed" ? "Cerrada" : "Borrador"}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                                        <div className="text-sm"><span className="text-slate-500">Vacantes: </span><span className="text-slate-900 font-medium">{job.openings}</span></div>
                                        <div className="text-sm"><span className="text-slate-500">Candidatos: </span><span className="text-slate-900 font-medium">{candidates.filter((c: any) => c.jobPostingId === job._id).length}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Kanban ATS para Candidatos */}
                        <div className="mt-12">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-indigo-500" />
                                    Pipeline de Candidatos (Kanban)
                                </h2>
                                <button onClick={() => setIsAddCandidateOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                                    <Plus className="w-4 h-4" /> Agregar Candidato
                                </button>
                            </div>

                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {[
                                    { id: "new", title: "Nuevos", color: "border-blue-500" },
                                    { id: "screening", title: "Filtrado", color: "border-amber-500" },
                                    { id: "interview", title: "Entrevistas", color: "border-purple-500" },
                                    { id: "offer", title: "Oferta", color: "border-indigo-500" },
                                    { id: "hired", title: "Contratados", color: "border-emerald-500" }
                                ].map((column) => (
                                    <div key={column.id} className="min-w-[300px] w-[300px] bg-white rounded-xl flex flex-col max-h-[600px] border border-slate-200">
                                        <div className={`p-4 border-b border-slate-200 font-semibold text-slate-900 flex items-center justify-between border-t-2 rounded-t-xl ${column.color}`}>
                                            <span>{column.title}</span>
                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{(candidates as any[]).filter(c => c.status === column.id).length}</span>
                                        </div>
                                        <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                                            {(candidates as any[]).filter(c => c.status === column.id).map(candidate => (
                                                <div key={candidate._id} className="bg-slate-50 border border-slate-200 p-4 rounded-lg cursor-grab active:cursor-grabbing hover:border-slate-300">
                                                    <h4 className="font-medium text-slate-900">{candidate.name}</h4>
                                                    <p className="text-xs text-slate-500 mt-1 mb-3">{candidate.jobTitle}</p>
                                                    <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                                                        <span className="text-xs font-medium text-slate-500">Score: {candidate.score ?? "N/A"}</span>
                                                        <select
                                                            className="text-xs bg-white text-slate-900 rounded border border-slate-200 outline-none px-2 py-1"
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Evaluaciones */}
                {activeTab === "evaluaciones" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500" />
                                Evaluaciones de Desempeño
                            </h2>
                            <button onClick={() => setIsAddEvalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">
                                <Plus className="w-4 h-4" /> Nueva Evaluación
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {evaluations.map((ev: any) => (
                                <div key={ev._id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">Periodo {ev.period}</h3>
                                            <p className="text-sm text-slate-500 mt-1">Evaluador: {ev.evaluatorName}</p>
                                        </div>
                                        <div className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <Star className="w-3 h-3" /> {ev.score}/5
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md mb-4 line-clamp-3">
                                        "{ev.feedback}"
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs text-slate-500">
                                        <span>Tipo: {ev.type.toUpperCase()}</span>
                                        <span>ID Evaluado: ...{ev.userId.slice(-4)}</span>
                                    </div>
                                </div>
                            ))}
                            {evaluations.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                                    No hay evaluaciones registradas.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab: Skills */}
                {activeTab === "skills" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-500" />
                                Matriz de Habilidades
                            </h2>
                            <button onClick={() => setIsAddSkillOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">
                                <Plus className="w-4 h-4" /> Registrar Habilidad
                            </button>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-sm">
                                        <th className="p-4 font-medium text-slate-500">Empleado</th>
                                        <th className="p-4 font-medium text-slate-500">Habilidad</th>
                                        <th className="p-4 font-medium text-slate-500">Nivel</th>
                                        <th className="p-4 font-medium text-slate-500">Certificado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {skills.map((sk: any, idx: number) => (
                                        <tr key={sk._id} className={idx !== skills.length - 1 ? "border-b border-slate-100" : ""}>
                                            <td className="p-4 text-slate-900 font-medium">{sk.userName}</td>
                                            <td className="p-4 text-slate-700">{sk.skillName}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${sk.proficiencyLevel === "expert" ? "bg-purple-100 text-purple-700" : sk.proficiencyLevel === "advanced" ? "bg-indigo-100 text-indigo-700" : sk.proficiencyLevel === "intermediate" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                                                    {sk.proficiencyLevel.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {sk.isCertified ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <span className="text-slate-300">-</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    {skills.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-500">
                                                No hay habilidades registradas en la matriz.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab: Trainings */}
                {activeTab === "trainings" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-500" />
                                Capacitaciones Activas
                            </h2>
                            <button onClick={() => setIsAddTrainingOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">
                                <Plus className="w-4 h-4" /> Nueva Capacitación
                            </button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {trainings.map((tr: any) => (
                                <div key={tr._id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-slate-900">{tr.title}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${tr.status === "planned" ? "bg-blue-50 text-blue-600" : tr.status === "in_progress" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                                            {tr.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-500 mb-4">{tr.provider}</div>
                                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-700">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(tr.date).toLocaleDateString()}
                                        </div>
                                        <div className="font-semibold">
                                            Pen {tr.cost.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {trainings.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                                    No hay capacitaciones programadas.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modals ATS (Vacante y Candidato) */}
                {isAddJobOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Nueva Vacante</h2>
                            <form onSubmit={handleCreateJob} className="space-y-4">
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Título</label><input type="text" required value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900" /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Requisitos</label><textarea required value={newJob.requirements} onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 h-24" /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Vacantes</label><input type="number" min="1" required value={newJob.openings} onChange={(e) => setNewJob({ ...newJob, openings: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900" /></div>
                                <div className="flex gap-3 mt-6"><button type="button" onClick={() => setIsAddJobOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancelar</button><button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg">Guardar</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {isAddCandidateOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Nuevo Candidato</h2>
                            <form onSubmit={handleAddCandidate} className="space-y-4">
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label><input type="text" required value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900" /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" required value={newCandidate.email} onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900" /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Vacante Seleccionada</label>
                                    <select required value={newCandidate.jobPostingId} onChange={(e) => setNewCandidate({ ...newCandidate, jobPostingId: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900">
                                        <option value="">Seleccione...</option>
                                        {postings.filter((p: any) => p.status === "open").map((listing: any) => (
                                            <option key={listing._id} value={listing._id}>{listing.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 mt-6"><button type="button" onClick={() => setIsAddCandidateOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancelar</button><button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg">Guardar</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modals Evaluaciones */}
                {isAddEvalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Registrar Evaluación</h2>
                            <form onSubmit={handleAddEval} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Empleado a Evaluar</label>
                                    <select required value={newEval.userId} onChange={(e) => setNewEval({ ...newEval, userId: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900">
                                        <option value="">Seleccione empleado...</option>
                                        {users.map((u: any) => <option key={u._id} value={u._id}>{u.name ?? u.email}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Evaluador</label>
                                    <select required value={newEval.evaluatorId} onChange={(e) => setNewEval({ ...newEval, evaluatorId: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900">
                                        <option value="">Seleccione evaluador...</option>
                                        {users.map((u: any) => <option key={u._id} value={u._id}>{u.name ?? u.email}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Periodo</label><input type="text" required value={newEval.period} onChange={(e) => setNewEval({ ...newEval, period: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900" placeholder="Ej: 2026-Q1" /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Puntaje (1-5)</label><input type="number" min="1" max="5" required value={newEval.score} onChange={(e) => setNewEval({ ...newEval, score: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900" /></div>
                                </div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Comentarios / Feedback</label><textarea required value={newEval.feedback} onChange={(e) => setNewEval({ ...newEval, feedback: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 h-24" /></div>
                                <div className="flex gap-3 mt-6"><button type="button" onClick={() => setIsAddEvalOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancelar</button><button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg">Guardar</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modals Skills */}
                {isAddSkillOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Agregar Habilidad</h2>
                            <form onSubmit={handleAddSkill} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Empleado</label>
                                    <select required value={newSkill.userId} onChange={(e) => setNewSkill({ ...newSkill, userId: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900">
                                        <option value="">Seleccione empleado...</option>
                                        {users.map((u: any) => <option key={u._id} value={u._id}>{u.name ?? u.email}</option>)}
                                    </select>
                                </div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Habilidad</label><input type="text" required value={newSkill.skillName} onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900" placeholder="Ej: React Native" /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Nivel</label>
                                    <select required value={newSkill.proficiencyLevel} onChange={(e) => setNewSkill({ ...newSkill, proficiencyLevel: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900">
                                        <option value="beginner">Principiante</option>
                                        <option value="intermediate">Intermedio</option>
                                        <option value="advanced">Avanzado</option>
                                        <option value="expert">Experto</option>
                                    </select>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer mt-4">
                                    <input type="checkbox" checked={newSkill.isCertified} onChange={(e) => setNewSkill({ ...newSkill, isCertified: e.target.checked })} className="w-4 h-4 text-emerald-600 border-slate-300 rounded" />
                                    <span className="text-sm font-medium text-slate-700">Cuenta con certificación oficial</span>
                                </label>
                                <div className="flex gap-3 mt-6"><button type="button" onClick={() => setIsAddSkillOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancelar</button><button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg">Guardar</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modals Capacitaciones */}
                {isAddTrainingOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Programar Capacitación</h2>
                            <form onSubmit={handleAddTraining} className="space-y-4">
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Título / Tema</label><input type="text" required value={newTraining.title} onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900" /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Proveedor / Instructor</label><input type="text" required value={newTraining.provider} onChange={(e) => setNewTraining({ ...newTraining, provider: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Costo Total (PEN)</label><input type="number" required value={newTraining.cost} onChange={(e) => setNewTraining({ ...newTraining, cost: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900" /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label><input type="date" required value={newTraining.date} onChange={(e) => setNewTraining({ ...newTraining, date: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900" /></div>
                                </div>
                                <div className="flex gap-3 mt-6"><button type="button" onClick={() => setIsAddTrainingOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancelar</button><button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Programar</button></div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
