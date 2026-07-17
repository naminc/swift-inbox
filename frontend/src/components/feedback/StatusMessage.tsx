import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatusMessageProps = {
  tone?: "error" | "success" | "warning" | "neutral";
  children: ReactNode;
  className?: string;
};

const toneClass = {
  error: "border-destructive/30 bg-destructive/10 text-destructive",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  neutral: "border-border bg-muted/50 text-muted-foreground",
};

export function StatusMessage({ tone = "neutral", children, className }: StatusMessageProps) {
  return (
    <div className={cn("rounded-md border px-4 py-3 text-sm", toneClass[tone], className)}>
      {children}
    </div>
  );
}
