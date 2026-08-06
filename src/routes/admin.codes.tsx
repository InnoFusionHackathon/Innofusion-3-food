import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, KeyRound, Loader2, Power, Share2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { GlassCard } from "@/components/common/GlassCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState, TableSkeleton } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { organiserApi } from "@/services";
import type { OrganiserCode } from "@/services/types";

export const Route = createFileRoute("/admin/codes")({
  head: () => ({
    meta: [
      { title: "Organiser Codes — QRFusion" },
      {
        name: "description",
        content: "Generate time-limited organiser access codes for the food distribution scanner.",
      },
      { property: "og:title", content: "Organiser Codes — QRFusion" },
      { property: "og:description", content: "Generate and revoke time-limited organiser codes." },
    ],
  }),
  component: CodesPage,
});

const durations = [1, 2, 5, 12, 24];

function CodesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["codes"], queryFn: organiserApi.listCodes });
  const [organiser, setOrganiser] = useState("");
  const [hours, setHours] = useState("5");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<OrganiserCode | null>(null);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const code = await organiserApi.createCode({ organiser, expiryHours: Number(hours) });
      setGenerated(code);
      setOrganiser("");
      toast.success("Organiser code generated");
      qc.invalidateQueries({ queryKey: ["codes"] });
    } finally {
      setLoading(false);
    }
  };

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const share = async (code: string) => {
    if (navigator.share) await navigator.share({ title: "Organiser code", text: code }).catch(() => {});
    else copy(code);
  };

  return (
    <AdminLayout title="Organiser Management" subtitle="Issue and revoke scanner access codes">
      <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-4">
          <GlassCard hover>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="text-base font-semibold">Create New Code</h2>
            </div>
            <form onSubmit={generate} className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organiser">Organiser Name</Label>
                <Input
                  id="organiser"
                  required
                  value={organiser}
                  onChange={(e) => setOrganiser(e.target.value)}
                  placeholder="Riya Sharma"
                  className="h-11 rounded-2xl bg-background/40"
                />
              </div>
              <div className="space-y-2">
                <Label>Expiry Duration</Label>
                <Select value={hours} onValueChange={setHours}>
                  <SelectTrigger className="h-11 rounded-2xl bg-background/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d} Hour{d > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-brand-gradient py-6 font-semibold text-primary-foreground"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Code"}
              </Button>
            </form>
          </GlassCard>

          <AnimatePresence>
            {generated && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                <GlassCard className="border-primary/40 text-center">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Code for {generated.organiser}
                  </p>
                  <p className="mt-3 font-mono text-3xl font-bold tracking-[0.2em] text-gradient">
                    {generated.code}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">Expires {generated.expiresAt}</p>
                  <div className="mt-5 flex justify-center gap-2">
                    <Button variant="secondary" className="rounded-2xl" onClick={() => copy(generated.code)}>
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                    <Button variant="secondary" className="rounded-2xl" onClick={() => share(generated.code)}>
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <GlassCard className="overflow-hidden p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={4} />
            </div>
          ) : !data || data.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={KeyRound} title="No organiser codes yet" description="Generate a code to give an organiser scanner access." />
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-slim">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Code</TableHead>
                    <TableHead>Organiser</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((c) => (
                    <TableRow key={c.id} className="border-border/50">
                      <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                      <TableCell>{c.organiser}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.createdAt}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.expiresAt}</TableCell>
                      <TableCell>
                        <StatusBadge tone={c.status === "active" ? "success" : c.status === "expired" ? "warning" : "muted"}>
                          {c.status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => copy(c.code)} aria-label="Copy">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-xl"
                            aria-label="Deactivate"
                            onClick={() => organiserApi.deactivateCode(c.id).then(() => toast.success("Deactivation requested"))}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-xl text-destructive"
                            aria-label="Delete"
                            onClick={() => organiserApi.deleteCode(c.id).then(() => toast.success("Delete requested"))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </GlassCard>
      </div>
    </AdminLayout>
  );
}
