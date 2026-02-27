import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto w-full">
                {children}
            </main>
        </div>
    );
}
