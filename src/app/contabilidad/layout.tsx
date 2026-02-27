import ContabilidadSidebar from "@/components/ContabilidadSidebar";

export default function ContabilidadLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950">
            <ContabilidadSidebar />
            <main className="flex-1 overflow-y-auto w-full">
                {children}
            </main>
        </div>
    );
}
