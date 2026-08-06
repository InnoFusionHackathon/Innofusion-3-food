import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/common/GlassCard";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Page not found — QRFusion" },
      { name: "description", content: "This page does not exist in the QRFusion console." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 app-glow" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-accent/15 text-accent">
            <Compass className="h-7 w-7" />
          </div>
          <p className="mt-6 font-display text-6xl font-bold text-gradient">404</p>
          <h1 className="mt-3 text-xl font-semibold">This counter doesn&apos;t exist</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The page you scanned for has been moved or never existed.
          </p>
          <Button
            asChild
            className="mt-7 rounded-2xl bg-brand-gradient px-6 py-6 font-semibold text-primary-foreground"
          >
            <Link to="/">
              <Home className="mr-1 h-4 w-4" /> Back to login
            </Link>
          </Button>
        </GlassCard>
      </motion.div>
    </main>
  );
}
