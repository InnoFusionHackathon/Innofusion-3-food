import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, KeyRound, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/common/GlassCard";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { authApi } from "@/services";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — QRFusion | Powered by HackOS" },
      {
        name: "description",
        content:
          "Sign in as an admin or organiser to manage QR-based event operations — identity, meals, goodies, entry and analytics.",
      },
      { property: "og:title", content: "Sign in — QRFusion | Powered by HackOS" },
      {
        property: "og:description",
        content: "Admin and organiser access for smart QR-based event management.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"admin" | "organiser">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "admin") {
        const res = await authApi.adminLogin({ email, password });
        window.localStorage.setItem("sfqr_token", res.token);
        toast.success("Welcome back, admin");
        navigate({ to: "/admin" });
      } else {
        const res = await authApi.validateOrganiser({ code });
        window.localStorage.setItem("sfqr_token", res.token);
        window.localStorage.setItem("sfqr_organiser", res.organiser);
        toast.success(`Code verified — ${res.organiser}`);
        navigate({ to: "/scanner" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 app-glow" />
      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-accent/20 blur-[120px]" />

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl overflow-hidden shadow-lg bg-transparent">
            <img src="/QRFusion.png" alt="QRFusion Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
            <span className="text-gradient">QRFusion</span>
          </h1>
          <p className="mt-1.5 text-sm font-medium text-foreground/80">
            Smart QR-Based Event Management
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            One QR. One Identity. Complete Event Control.
          </p>
          <div className="mt-3 flex items-center gap-1.5 rounded-full border border-border/40 bg-foreground/5 px-3 py-1">
            <img src="/HackOS_Logo.png" alt="HackOS" className="h-4 w-4 object-contain" />
            <span className="text-[10px] font-medium tracking-wide text-muted-foreground">Powered by HackOS</span>
          </div>
        </div>

        <GlassCard className="p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-foreground/5 p-1">
            {(["admin", "organiser"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="relative rounded-xl px-3 py-2.5 text-sm font-semibold capitalize transition-colors"
              >
                {mode === m && (
                  <motion.span
                    layoutId="login-pill"
                    className="absolute inset-0 rounded-xl bg-brand-gradient"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span
                  className={
                    mode === m ? "relative text-primary-foreground" : "relative text-muted-foreground"
                  }
                >
                  {m} login
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-5">
            <AnimatePresence mode="wait">
              {mode === "admin" ? (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@hackathon.dev"
                        className="h-12 rounded-2xl bg-background/40 pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 rounded-2xl bg-background/40 pl-10"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="organiser"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-2"
                >
                  <Label htmlFor="code">Organiser Code</Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="code"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="ORG-7F2K9A"
                      className="h-12 rounded-2xl bg-background/40 pl-10 font-mono tracking-widest"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Codes are issued by the admin and expire automatically.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={loading}
              className="h-13 w-full rounded-2xl bg-brand-gradient py-6 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.015]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Continue <ArrowRight className="ml-1 h-4.5 w-4.5" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Every scan is verified, logged, and tracked in real time.
          </p>
        </GlassCard>
      </motion.div>
    </main>
  );
}
