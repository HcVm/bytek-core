import { ThemeToggle } from "@/components/ThemeToggle";

export default function TechnicianLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex justify-center">
            {/* Simulación de un viewport móvil en escritorio, expandido en móviles reales */}
            <div className="w-full max-w-md bg-white dark:bg-zinc-950 min-h-screen shadow-2xl overflow-hidden flex flex-col relative">
                <header className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white p-4 sticky top-0 z-10 flex justify-between items-center shadow-md border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-col">
                        <span className="font-bold text-lg leading-none tracking-tight">BYTEK Infra</span>
                        <span className="text-zinc-400 dark:text-zinc-500 text-xs">Field Service App</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                            <span className="text-xs font-medium">T1</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto pb-12">
                    {children}
                </main>
            </div>
        </div>
    );
}

