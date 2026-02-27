"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Evitar errores de hidratación
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="p-2 ml-2 h-8 w-8" />;
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 ml-2 rounded-lg bg-zinc-200/50 hover:bg-zinc-300 dark:bg-zinc-800/50 dark:hover:bg-zinc-700 transition-colors text-zinc-600 dark:text-zinc-400 focus:outline-none flex items-center justify-center h-8 w-8 relative"
            aria-label="Toggle Dark Mode"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
