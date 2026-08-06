import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = false, ...props }: GlassCardProps) {
  return (
    <div
      className={cn("glass rounded-3xl p-6", hover && "glass-hover", className)}
      {...props}
    >
      {children}
    </div>
  );
}
