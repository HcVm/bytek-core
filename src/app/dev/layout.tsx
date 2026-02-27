import { DevSidebar } from "@/components/dev/DevSidebar";

export default function DevLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white">
            <DevSidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
