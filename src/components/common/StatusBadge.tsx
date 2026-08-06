import { cn } from "@/lib/utils";

type Tone = "success" | "danger" | "warning" | "muted" | "primary";

const tones: Record<Tone, string> = {
  success: "bg-success/15 text-success border-success/30",
  danger: "bg-destructive/15 text-destructive border-destructive/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  muted: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary/15 text-primary border-primary/30",
};

export function StatusBadge({
  tone = "muted",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export const mealTone = (status: string): Tone =>
  status === "collected" ? "success" : "danger";

export const scanTone = (status: string): Tone =>
  status === "success" ? "success" : status === "duplicate" ? "danger" : "warning";
