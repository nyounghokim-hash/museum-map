import { cn } from "@/lib/utils";
import React from "react";

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    intensity?: "light" | "medium" | "heavy";
}

export function GlassPanel({ className, intensity = "medium", children, ...props }: GlassPanelProps) {
    const intensityClass = {
        light: "bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-white/20 dark:border-neutral-700/20",
        medium: "bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-white/40 dark:border-neutral-700/40 shadow-xl",
        heavy: "bg-white/90 dark:bg-neutral-900/90 backdrop-blur-2xl border-white/50 dark:border-neutral-700/50 shadow-2xl",
    };

    return (
        <div className={cn(`border rounded-2xl ${intensityClass[intensity]}`, className)} {...props}>
            {children}
        </div>
    );
}

export function FilterChip({ active, children, onClick }: { active?: boolean, children: React.ReactNode, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm whitespace-nowrap",
                active
                    ? "bg-black text-white shadow-md shadow-black/20"
                    : "bg-white/80 backdrop-blur-md border border-gray-200 text-gray-700 hover:bg-white"
            )}
        >
            {children}
        </button>
    );
}
