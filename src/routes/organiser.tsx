import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { KeyRound, Loader2, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/common/GlassCard";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { authApi } from "@/services";

export const Route = createFileRoute("/organiser")({
  head: () => ({
    meta: [
      { title: "Organiser Login — QRFusion Scanner" },
      {
        name: "description",
        content: "Validate your organiser code to open the QRFusion event scanner.",
      },
      { property: "og:title", content: "Organiser Login — QRFusion Scanner" },
      {
        property: "og:description",
        content: "Validate your organiser code to open the QRFusion event scanner.",
      },
    ],
  }),
  component: OrganiserLogin,
});

function OrganiserLogin() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.validateOrganiser({ code });
      window.localStorage.setItem("sfqr_token", res.token);
      window.localStorage.setItem("sfqr_organiser", res.organiser);
      toast.success(`Code verified — ${res.organiser}`);
      navigate({ to: "/scanner" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 app-glow" />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <GlassCard className="p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-brand-gradient text-primary-foreground">
            <ScanLine className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold">QRFusion Scanner</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the code shared by the admin to begin your shift.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="ocode">Organiser Code</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="ocode"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ORG-7F2K9A"
                  className="h-12 rounded-2xl bg-background/40 pl-10 text-center font-mono tracking-[0.3em]"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-gradient py-6 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.015]"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Validate Code"}
            </Button>
          </form>
        </GlassCard>
      </motion.div>
    </main>
  );
}
