"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { OpportunityFormDialog } from "./OpportunityFormDialog";
import { Pencil } from "lucide-react";

// Columnas del Kanban basadas en el esquema
const COLUMNS = [
    { id: "lead", title: "Prospecto / Lead" },
    { id: "presentation", title: "Presentación" },
    { id: "negotiation", title: "En Negociación" },
    { id: "won", title: "Ganado (Won)" },
    { id: "lost", title: "Perdido (Lost)" }
];

export default function OportunidadesPage() {
    const opportunities = useQuery(api.opportunities.getOpportunities, {});
    const updateOpportunity = useMutation(api.opportunities.updateOpportunity);

    const [localOpps, setLocalOpps] = useState<any[] | null>(null);

    // Sincronizar datos locales para el arrastre optimista
    if (opportunities && localOpps === null) {
        setLocalOpps(opportunities);
    }

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Actualización optimista local
        if (!localOpps) return;

        const newStatus = destination.droppableId as "lead" | "presentation" | "negotiation" | "won" | "lost";
        const updatedLocal = localOpps.map(opp =>
            opp._id === draggableId ? { ...opp, status: newStatus } as any : opp
        );

        setLocalOpps(updatedLocal);

        // Enviar cambio a Convex backend
        try {
            await updateOpportunity({
                id: draggableId as Id<"opportunities">,
                status: newStatus
            });
        } catch (error) {
            console.error("Error al mover oportunidad:", error);
            // Revertir en caso de fallo
            setLocalOpps(opportunities || []);
        }
    };

    const getUnitBadgeColor = (unit: string) => {
        switch (unit) {
            case 'digital': return 'bg-purple-100 text-purple-700 hover:bg-purple-200';
            case 'solutions': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
            case 'infra': return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Pipeline de Ventas</h1>
                    <p className="text-zinc-500 mt-2">Gestiona el progreso de las oportunidades comerciales.</p>
                </div>
                <OpportunityFormDialog />
            </div>

            <div className="flex-1 overflow-x-auto">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-4 h-full min-h-[500px]">
                        {COLUMNS.map(column => {
                            const columnOpps = (localOpps || []).filter(opp => opp.status === column.id);

                            return (
                                <div key={column.id} className="flex-shrink-0 w-80 flex flex-col bg-zinc-100 rounded-xl">
                                    <div className="p-4 flex items-center justify-between border-b border-zinc-200">
                                        <h3 className="font-semibold text-zinc-700">{column.title}</h3>
                                        <Badge variant="secondary" className="bg-white text-zinc-500 rounded-full px-2 py-0.5">
                                            {columnOpps.length}
                                        </Badge>
                                    </div>

                                    <Droppable droppableId={column.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`p-3 flex-1 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-zinc-200/50' : ''
                                                    }`}
                                            >
                                                {columnOpps.map((opp, index) => (
                                                    <Draggable key={opp._id} draggableId={opp._id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`bg-white p-4 rounded-lg shadow-sm border border-zinc-200 flex flex-col gap-2 ${snapshot.isDragging ? 'shadow-md rotate-[2deg] z-50' : ''
                                                                    }`}
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-xs font-medium text-zinc-500 truncate max-w-[150px]">
                                                                            {opp.clientName}
                                                                        </span>
                                                                        <OpportunityFormDialog
                                                                            initialData={opp as any}
                                                                            trigger={
                                                                                <Button variant="ghost" size="icon" className="h-5 w-5 text-zinc-400 hover:text-indigo-600 ml-1">
                                                                                    <Pencil className="w-3 h-3" />
                                                                                </Button>
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <Badge className={`${getUnitBadgeColor(opp.serviceUnit)} uppercase text-[10px] tracking-wider px-1.5 py-0`}>
                                                                        {opp.serviceUnit}
                                                                    </Badge>
                                                                </div>
                                                                <p className="font-medium text-sm text-zinc-900 line-clamp-2">
                                                                    {/* Idealmente aquí el nombre del paquete/oportunidad */}
                                                                    {opp.packageId.replace(/_/g, ' ').toUpperCase()}
                                                                </p>
                                                                <div className="mt-2 text-right">
                                                                    <span className="text-sm font-semibold text-emerald-600">
                                                                        S/ {opp.estimatedValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            );
                        })}
                    </div>
                </DragDropContext>
            </div>
        </div>
    );
}
