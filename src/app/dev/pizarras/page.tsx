"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Briefcase, KanbanSquare, Users } from "lucide-react";
import Link from "next/link";
import { BoardFormDialog } from "./BoardFormDialog";

export default function DevDashboardPage() {
    const allUsers = useQuery(api.users.getAllUsers);
    const userId = allUsers?.[0]?._id; // Mockeando el ID del usuario actual logueado

    // Asumiendo que tenemos getBoardsForUser
    const boards = useQuery(api.agile.getBoardsForUser, userId ? { userId } : "skip");

    if (boards === undefined || allUsers === undefined) {
        return (
            <div className="flex h-[80vh] items-center justify-center text-zinc-400">
                <KanbanSquare className="w-6 h-6 animate-pulse mr-2" />
                <span>Cargando Pizarras de Desarrollo...</span>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end border-b border-zinc-200 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Proyectos Ágiles</h1>
                    <p className="text-zinc-500 mt-1">Gestión de sprints y desarrollo de software interno/externo.</p>
                </div>
                {userId && <BoardFormDialog currentUserId={userId} />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {boards.map(board => {
                    const owner = allUsers.find(u => u._id === board.ownerId);

                    return (
                        <Link href={`/dev/pizarras/${board._id}`} key={board._id}>
                            <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <KanbanSquare className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-zinc-900 text-lg leading-tight">{board.title}</h3>
                                </div>
                                <p className="text-sm text-zinc-500 mb-4 line-clamp-2 flex-grow">
                                    {board.description || "Sin descripción proporcionada."}
                                </p>

                                <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-zinc-700">Líder:</span> {owner?.name}
                                    </div>
                                    <div className="flex items-center gap-1 bg-zinc-100 px-2 py-1 rounded">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>{board.memberIds.length}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}

                {boards.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-200 rounded-2xl">
                        <Briefcase className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-zinc-700">Sin Pizarras Activas</h3>
                        <p className="text-zinc-500 max-w-sm mx-auto mt-2">No estás asignado a ningún proyecto de desarrollo actual. Crea una nueva Pizarra Kanban para comenzar.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
