"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { CustomVideoCall } from "@/components/video/CustomVideoCall";
import { ChevronLeft, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminMeetingRoomPage() {
    const params = useParams();
    const router = useRouter();
    const messageId = params.messageId as Id<"clientMessages">;

    const message = useQuery(api.clientPortal.getMessageById, { messageId });

    if (message === undefined) {
        return (
            <div className="flex h-screen w-full items-center justify-center text-zinc-400 bg-zinc-50">
                <Activity className="w-8 h-8 animate-pulse text-indigo-500" />
            </div>
        );
    }

    if (!message || !message.meetingLink) {
        return (
            <div className="flex flex-col h-screen w-full items-center justify-center text-zinc-500 gap-4 bg-zinc-50">
                <p>La sala no existe o no se provisto el enlace correctamente.</p>
                <Button onClick={() => router.push(`/crm/comunicaciones`)} variant="outline">
                    Volver a Comunicaciones
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full bg-zinc-100">
            <div className="h-16 px-6 border-b border-zinc-200 flex items-center bg-white shadow-sm z-10">
                <Button onClick={() => router.push(`/crm/comunicaciones`)} variant="ghost" className="text-zinc-500 hover:text-indigo-600 p-0 pr-4 -ml-2">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Volver al Inbox
                </Button>
                <div className="w-px h-6 bg-zinc-200 mx-4" />
                <h2 className="font-semibold text-zinc-900">Sala de Videollamada Segura</h2>
            </div>

            <div className="flex-1 p-6 w-full max-w-7xl mx-auto flex flex-col justify-center">
                <div className="w-full rounded-2xl overflow-hidden ring-1 ring-zinc-200 shadow-sm h-full max-h-[85vh]">
                    <CustomVideoCall
                        roomUrl={message.meetingLink}
                        onLeave={() => router.push(`/crm/comunicaciones`)}
                    />
                </div>
            </div>
        </div>
    );
}
