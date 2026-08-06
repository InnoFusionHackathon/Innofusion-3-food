import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  hint?: string;
  progress?: number;
  index?: number;
  accent?: "primary" | "accent" | "danger" | "chart2";
}

const accents = {
  primary: "text-primary",
  accent: "text-accent",
  danger: "text-destructive",
  chart2: "text-chart-2",
};

function Ring({ value, className }: { value: number; className?: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
      <circle cx="28" cy="28" r={r} className="stroke-border" strokeWidth="5" fill="none" />
      <motion.circle
        cx="28"
        cy="28"
        r={r}
        className={cn("stroke-current", className)}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (c * Math.min(value, 100)) / 100 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  progress,
  index = 0,
  accent = "primary",
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: "easeOut" }}
    >
      <GlassCard hover className="relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
            <AnimatedCounter
              value={value}
              className="mt-2 block font-display text-3xl font-bold tracking-tight"
            />
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
          {progress !== undefined ? (
            <div className="relative shrink-0">
              <Ring value={progress} className={accents[accent]} />
              <span className="absolute inset-0 grid place-items-center text-[11px] font-bold">
                {Math.round(progress)}%
              </span>
            </div>
          ) : (
            <div
              className={cn(
                "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10",
                accents[accent],
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
