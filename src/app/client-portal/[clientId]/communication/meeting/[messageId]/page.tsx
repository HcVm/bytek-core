"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { CustomVideoCall } from "@/components/video/CustomVideoCall";
import { ChevronLeft, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClientMeetingRoomPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.clientId as Id<"clients">;
    const messageId = params.messageId as Id<"clientMessages">;

    const message = useQuery(api.clientPortal.getMessageById, { messageId });

    if (message === undefined) {
        return (
            <div className="flex h-[80vh] items-center justify-center text-zinc-400">
                <Activity className="w-6 h-6 animate-pulse mr-2" />
                <span>Verificando sala de reuniones...</span>
            </div>
        );
    }

    if (!message || !message.meetingLink) {
        return (
            <div className="flex flex-col h-[80vh] items-center justify-center text-zinc-400 gap-4">
                <p>La sala de reuniones no existe o el enlace no es válido.</p>
                <Button onClick={() => router.push(`/client-portal/${clientId}/communication`)} variant="outline">
                    Regresar
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 h-[calc(100vh-80px)] flex flex-col gap-4 max-w-7xl mx-auto w-full">
            <div className="flex items-center">
                <Button onClick={() => router.push(`/client-portal/${clientId}/communication`)} variant="ghost" className="text-zinc-500 hover:text-indigo-600 p-0 pr-4">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Volver al canal
                </Button>
            </div>

            <div className="flex-1 w-full rounded-2xl overflow-hidden ring-1 ring-zinc-200">
                <CustomVideoCall
                    roomUrl={message.meetingLink}
                    onLeave={() => router.push(`/client-portal/${clientId}/communication`)}
                />
            </div>
        </div>
    );
}
