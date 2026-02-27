"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import {
    DailyProvider,
    useLocalSessionId,
    useParticipantIds,
    useVideoTrack,
    useAudioTrack,
    useDaily
} from "@daily-co/daily-react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CustomVideoCall({ roomUrl, onLeave }: { roomUrl: string, onLeave: () => void }) {
    const [callObject, setCallObject] = useState<DailyCall | null>(null);
    const [joinState, setJoinState] = useState<"idle" | "joining" | "joined" | "error">("idle");

    useEffect(() => {
        if (!roomUrl) return;

        // Prevent React 18 Strict Mode from crashing by re-using the existing DailyIframe instance 
        let co = DailyIframe.getCallInstance();
        if (!co) {
            co = DailyIframe.createCallObject();
        }

        setCallObject(co);
        setJoinState("joining");

        co.join({ url: roomUrl })
            .then(() => setJoinState("joined"))
            .catch(err => {
                console.error("Error joining daily info", err);
                setJoinState("error");
            });

        return () => {
            // We only leave the call in cleanup. Destroying the object breaks Strict Mode's second mount.
            co?.leave();
        };
    }, [roomUrl]);

    if (!callObject || joinState === "joining") {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl">
                <div className="text-zinc-400 flex flex-col items-center gap-6">
                    <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                    <span className="font-medium tracking-wide">Conectando a sala segura...</span>
                </div>
            </div>
        );
    }

    if (joinState === "error") {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center bg-zinc-950 rounded-2xl border border-red-900/50 shadow-2xl">
                <div className="text-red-400 flex flex-col items-center gap-6 p-8 bg-red-950/20 rounded-xl">
                    <p className="font-semibold text-lg">Error al conectar a la videollamada.</p>
                    <p className="text-sm text-red-400/70 text-center max-w-sm mb-4">Verifique su conexión a internet o los permisos de cámara y micrófono de su navegador.</p>
                    <Button onClick={onLeave} variant="outline" className="text-zinc-900 bg-white hover:bg-zinc-200 font-bold px-8">Regresar</Button>
                </div>
            </div>
        );
    }

    return (
        <DailyProvider callObject={callObject}>
            <div className="flex flex-col h-[80vh] w-full bg-zinc-950 text-white relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-5 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-white tracking-widest text-lg">BYTEK</span>
                        <span className="bg-red-500 text-white text-[10px] px-2.5 py-0.5 rounded-full animate-pulse uppercase font-bold tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.5)]">En vivo</span>
                    </div>
                </div>

                {/* Video Grid */}
                <div className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-zinc-950">
                    <VideoGrid />
                </div>

                {/* Call Controls */}
                <div className="h-24 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800/50 flex items-center justify-center gap-6 px-6 relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                    <CallControls onLeave={onLeave} />
                </div>
            </div>
        </DailyProvider>
    );
}

function VideoGrid() {
    const localSessionId = useLocalSessionId();
    const remoteParticipantIds = useParticipantIds({ filter: "remote" });

    if (!localSessionId) return null;

    return (
        <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 md:p-6 pt-20 pb-6 items-center justify-center overflow-hidden">
            {/* Local Video */}
            <div className={`relative ${remoteParticipantIds.length === 0 ? 'w-full max-w-4xl max-h-[70vh]' : 'w-full lg:w-1/2'} aspect-video rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl border border-zinc-800/80 transition-all duration-700 ease-in-out`}>
                <ParticipantTile participantId={localSessionId} isLocal />
            </div>

            {/* Remote Videos */}
            {remoteParticipantIds.length === 0 ? (
                <div className="w-full lg:w-1/2 aspect-video flex flex-col items-center justify-center rounded-3xl bg-zinc-900/40 border border-zinc-800/50 border-dashed backdrop-blur-sm">
                    <Users className="w-16 h-16 text-zinc-700 mb-6" />
                    <p className="text-zinc-500 font-medium text-lg tracking-wide">Esperando al otro participante...</p>
                    <p className="text-zinc-600 text-sm mt-2">La sala está abierta y segura.</p>
                </div>
            ) : (
                remoteParticipantIds.map(id => (
                    <div key={id} className="relative aspect-video max-h-full rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl ring-2 ring-indigo-500/30 w-full lg:w-1/2 transition-all duration-700 ease-in-out">
                        <ParticipantTile participantId={id} />
                    </div>
                ))
            )}
        </div>
    );
}

function ParticipantTile({ participantId, isLocal = false }: { participantId: string, isLocal?: boolean }) {
    const videoState = useVideoTrack(participantId);
    const audioState = useAudioTrack(participantId);
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Attach tracks to DOM elements
    useEffect(() => {
        if (videoRef.current && videoState.track) {
            videoRef.current.srcObject = new MediaStream([videoState.track]);
        }
    }, [videoState.track]);

    useEffect(() => {
        if (audioRef.current && audioState.track && !isLocal) {
            audioRef.current.srcObject = new MediaStream([audioState.track]);
        }
    }, [audioState.track, isLocal]);

    return (
        <div className="w-full h-full relative bg-zinc-900 flex items-center justify-center overflow-hidden group">
            <video
                ref={videoRef}
                autoPlay
                muted={isLocal}
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-500 ${!videoState.track ? 'opacity-0 absolute scale-105' : 'opacity-100 scale-100'} ${isLocal ? 'scale-x-[-1]' : ''}`}
            />

            {!videoState.track && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-zinc-800 flex items-center justify-center mb-4 border-2 border-zinc-700 shadow-inner">
                        <Users className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-600" />
                    </div>
                </div>
            )}

            {!isLocal && <audio ref={audioRef} autoPlay />}

            {/* In-Call Overlays */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 flex gap-3 z-10 transition-transform duration-300 group-hover:translate-y-[-4px]">
                <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg border border-white/5 tracking-wide">
                    {isLocal ? "Tú" : "Participante"}
                </div>
            </div>

            {audioState.isOff && (
                <div className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-red-500/90 backdrop-blur-md p-3 rounded-2xl text-white shadow-xl border border-red-400/50 z-10 flex items-center justify-center">
                    <MicOff className="w-5 h-5" />
                </div>
            )}
        </div>
    );
}

function CallControls({ onLeave }: { onLeave: () => void }) {
    const daily = useDaily();
    const videoState = useVideoTrack("local");
    const audioState = useAudioTrack("local");

    // Default to true assuming we haven't explicitely turned it off, 
    // real implementation checks the track state reliably
    const isMicOn = !audioState.isOff;
    const isCamOn = !videoState.isOff;

    const toggleMic = useCallback(() => {
        if (!daily) return;
        daily.setLocalAudio(!isMicOn);
    }, [daily, isMicOn]);

    const toggleCam = useCallback(() => {
        if (!daily) return;
        daily.setLocalVideo(!isCamOn);
    }, [daily, isCamOn]);

    return (
        <div className="flex items-center gap-4 sm:gap-6">
            <Button
                variant={isMicOn ? "secondary" : "destructive"}
                size="icon"
                title={isMicOn ? "Silenciar micrófono" : "Activar micrófono"}
                className={`rounded-2xl shadow-xl transition-all duration-300 ${isMicOn ? 'w-14 h-14 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700' : 'w-14 h-14 bg-amber-500 hover:bg-amber-600 text-zinc-950'}`}
                onClick={toggleMic}
            >
                {isMicOn ? <Mic className="w-6 h-6 text-zinc-300" /> : <MicOff className="w-6 h-6 text-zinc-900" />}
            </Button>

            <Button
                variant="destructive"
                className="rounded-2xl px-6 sm:px-10 h-14 gap-3 font-bold bg-red-600 hover:bg-red-700 shadow-xl shadow-red-500/20 hover:shadow-red-500/40 transition-all text-white border border-red-500 tracking-wide text-base w-full sm:w-auto"
                onClick={onLeave}
            >
                <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" /> <span className="hidden sm:inline">Salir de la Sala</span>
            </Button>

            <Button
                variant={isCamOn ? "secondary" : "destructive"}
                size="icon"
                title={isCamOn ? "Apagar video" : "Encender video"}
                className={`rounded-2xl shadow-xl transition-all duration-300 ${isCamOn ? 'w-14 h-14 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700' : 'w-14 h-14 bg-amber-500 hover:bg-amber-600 text-zinc-950'}`}
                onClick={toggleCam}
            >
                {isCamOn ? <Video className="w-6 h-6 text-zinc-300" /> : <VideoOff className="w-6 h-6 text-zinc-900" />}
            </Button>
        </div>
    );
}
