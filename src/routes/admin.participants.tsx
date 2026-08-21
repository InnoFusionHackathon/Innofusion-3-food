import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, FileSpreadsheet, Pencil, QrCode, RotateCcw, Trash2, Users, Plus, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { GlassCard } from "@/components/common/GlassCard";
import { SearchBox } from "@/components/common/SearchBox";
import { EmptyState, TableSkeleton } from "@/components/common/States";
import { StatusBadge, mealTone } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { participantsApi, entryApi } from "@/services";
import type { Participant } from "@/services/types";

export const Route = createFileRoute("/admin/participants")({
  head: () => ({
    meta: [
      { title: "Participants Management — QRFusion | HackOS" },
      {
        name: "description",
        content: "Import, search, filter and manage hackathon participants and their event status.",
      },
      { property: "og:title", content: "Participants Management — QRFusion | HackOS" },
      { property: "og:description", content: "Manage participants, QR IDs and event status." },
    ],
  }),
  component: ParticipantsPage,
});

function ParticipantsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["participants"], queryFn: () => participantsApi.list() });
  const [search, setSearch] = useState("");
  const [college, setCollege] = useState("all");
  const [team, setTeam] = useState("all");
  const [status, setStatus] = useState("all");
  const [viewing, setViewing] = useState<Participant | null>(null);
  const [deleting, setDeleting] = useState<Participant | null>(null);
  
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [editingDetails, setEditingDetails] = useState<Participant | null>(null);
  const [editingMeals, setEditingMeals] = useState<Participant | null>(null);
  
  const [showDeleteAllConfirm1, setShowDeleteAllConfirm1] = useState(false);
  const [showDeleteAllConfirm2, setShowDeleteAllConfirm2] = useState(false);
  const [deleteAllText, setDeleteAllText] = useState("");

  // Reset Column state
  const [showResetColumn, setShowResetColumn] = useState(false);
  const [resetColumnKeys, setResetColumnKeys] = useState<Set<string>>(new Set());
  const [resetColumnConfirmText, setResetColumnConfirmText] = useState("");
  const [isResettingColumn, setIsResettingColumn] = useState(false);
  
  const queryClient = useQueryClient();

  const participants = data ?? [];
  const colleges = useMemo(() => [...new Set(participants.map((p) => p.college))], [participants]);
  const teams = useMemo(() => [...new Set(participants.map((p) => p.team))], [participants]);

  const filtered = participants.filter((p) => {
    const q = search.toLowerCase();
    const matches =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.registrationId.toLowerCase().includes(q) ||
      p.qrId.toLowerCase().includes(q);
    const anyPending = Object.values(p.meals).some((m) => m === "pending");
    return (
      matches &&
      (college === "all" || p.college === college) &&
      (team === "all" || p.team === team) &&
      (status === "all" || (status === "pending" ? anyPending : !anyPending))
    );
  });

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    participantsApi.importExcel(file).then(() => toast.success("Import queued — backend will process the file"));
  };

  return (
    <>
    <AdminLayout title="Participants Management" subtitle={`${participants.length} registered participants`}>
      <GlassCard className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="default"
            className="rounded-2xl"
            onClick={() => setAddingParticipant(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Participant
          </Button>
          <Button asChild variant="secondary" className="rounded-2xl">
            <label className="cursor-pointer">
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Import Excel
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onImport} />
            </label>
          </Button>
          <Button
            variant="secondary"
            className="rounded-2xl"
            onClick={() => participantsApi.exportExcel().then(() => toast.success("Export requested"))}
          >
            <Download className="mr-2 h-4 w-4" /> Export Excel
          </Button>
          <Button
            variant="secondary"
            className="rounded-2xl"
            onClick={() => participantsApi.exportCsv().then(() => toast.success("Export requested"))}
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button
            className="rounded-2xl bg-brand-gradient font-semibold text-primary-foreground"
            onClick={() =>
              participantsApi
                .generateQr(filtered.map((p) => p.id))
                .then((r) => toast.success(`QR generation requested for ${r.generated} participants`))
            }
          >
            <QrCode className="mr-2 h-4 w-4" /> Generate QR
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl font-semibold"
            onClick={() => {
              toast.info("Generating PDF...");
              participantsApi.downloadAllQrPdf().then(() => toast.success("PDF Downloaded!"));
            }}
          >
            <Download className="mr-2 h-4 w-4" /> All QR (PDF)
          </Button>
          <Button
            variant="destructive"
            className="rounded-2xl font-semibold"
            onClick={() => setShowDeleteAllConfirm1(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete All
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl font-semibold border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
            onClick={() => { setResetColumnKeys(new Set()); setResetColumnConfirmText(""); setShowResetColumn(true); }}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Reset Column
          </Button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <SearchBox value={search} onChange={setSearch} placeholder="Search name, reg ID or QR ID" className="md:col-span-1" />
          <FilterSelect value={college} onChange={setCollege} placeholder="College" options={colleges} />
          <FilterSelect value={team} onChange={setTeam} placeholder="Team" options={teams} />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-11 rounded-2xl bg-background/40">
              <SelectValue placeholder="Meal Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All meal status</SelectItem>
              <SelectItem value="pending">Has pending meals</SelectItem>
              <SelectItem value="complete">All meals collected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Users} title="No participants found" description="Adjust your filters or import the participant sheet to get started." />
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-slim">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16">Photo</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>Reg ID</TableHead>
                  <TableHead>QR ID</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Goodies</TableHead>
                  <TableHead>D1-Snacks</TableHead>
                  <TableHead>D1-Lunch</TableHead>
                  <TableHead>D1-Eve</TableHead>
                  <TableHead>D1-Dinner</TableHead>
                  <TableHead>D2-Brkfast</TableHead>
                  <TableHead>D2-Lunch</TableHead>
                  <TableHead>D2-Snacks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="border-border/50">
                    <TableCell>
                      <img src={p.photo} alt={p.name} className="h-10 w-10 rounded-xl object-cover" loading="lazy" />
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.registrationId}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.qrId}</TableCell>
                    <TableCell className="text-sm">{p.college}</TableCell>
                    <TableCell className="text-sm">{p.team}</TableCell>
                    <TableCell>
                      <StatusBadge tone={p.entry?.checkedIn ? "success" : "danger"}>
                        {p.entry?.checkedIn ? "Checked In" : "Pending"}
                      </StatusBadge>
                    </TableCell>
                    {(["goodies", "day1_snacks", "day1_lunch", "day1_evening_snacks", "day1_dinner", "day2_breakfast", "day2_lunch", "day2_snacks"] as const).map((m) => (
                      <TableCell key={m}>
                        <StatusBadge tone={mealTone(p.meals[m])}>
                          {p.meals[m] === "collected" ? "Collected" : "Pending"}
                        </StatusBadge>
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="rounded-xl text-brand-500" onClick={() => {
                          toast.info("Downloading QR...");
                          participantsApi.downloadSingleQr(p.id).then(() => toast.success("Downloaded!"));
                        }} aria-label="Download QR">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => setViewing(p)} aria-label="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => setEditingMeals(p)} aria-label="Edit Meals">
                          <UtensilsCrossed className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => setEditingDetails(p)} aria-label="Edit Details">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-xl text-destructive" onClick={() => setDeleting(p)} aria-label="Delete">
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

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="glass max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle>Participant details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <img src={viewing.photo} alt={viewing.name} className="h-20 w-20 rounded-2xl object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-display text-xl font-bold">{viewing.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{viewing.registrationId}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Detail label="Phone" value={viewing.phone} />
                <Detail label="Email" value={viewing.email} />
                <Detail label="College" value={viewing.college} />
                <Detail label="Team" value={viewing.team} />
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-foreground/5 p-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(viewing.qrId)}`}
                  alt={`QR code for ${viewing.name}`}
                  className="h-24 w-24 rounded-xl bg-white p-1"
                />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">QR ID</p>
                  <p className="truncate font-mono text-sm">{viewing.qrId}</p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Meal history</p>
                {viewing.mealHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No meals collected yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {viewing.mealHistory.map((h, i) => (
                      <li key={i} className="flex items-center justify-between rounded-xl bg-foreground/5 px-3 py-2 text-sm">
                        <span className="capitalize">{h.meal}</span>
                        <span className="text-muted-foreground">
                          {h.time} · {h.organiser}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addingParticipant} onOpenChange={setAddingParticipant}>
        <DialogContent className="glass max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Add New Participant</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const data = Object.fromEntries(fd.entries()) as any;
              participantsApi.create(data).then(() => {
                toast.success("Participant added!");
                setAddingParticipant(false);
                queryClient.invalidateQueries({ queryKey: ["participants"] });
              });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="add-name">Name</Label>
              <Input id="add-name" name="name" required placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-college">College</Label>
              <Input id="add-college" name="college" placeholder="University Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-team">Team</Label>
              <Input id="add-team" name="team" placeholder="Team Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input id="add-email" name="email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-phone">Phone</Label>
              <Input id="add-phone" name="phone" placeholder="Phone Number" />
            </div>
            <Button type="submit" className="w-full rounded-2xl">Add Participant</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingDetails} onOpenChange={(o) => !o && setEditingDetails(null)}>
        <DialogContent className="glass max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Edit Participant Details</DialogTitle>
          </DialogHeader>
          {editingDetails && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const data = Object.fromEntries(fd.entries()) as any;
                participantsApi.update(editingDetails.id, data).then(() => {
                  toast.success("Details updated!");
                  setEditingDetails(null);
                  queryClient.invalidateQueries({ queryKey: ["participants"] });
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" name="name" defaultValue={editingDetails.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-college">College</Label>
                <Input id="edit-college" name="college" defaultValue={editingDetails.college} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-team">Team</Label>
                <Input id="edit-team" name="team" defaultValue={editingDetails.team} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" name="email" type="email" defaultValue={editingDetails.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" name="phone" defaultValue={editingDetails.phone} />
              </div>
              <Button type="submit" className="w-full rounded-2xl">Save Changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingMeals} onOpenChange={(o) => !o && setEditingMeals(null)}>
        <DialogContent className="glass max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Edit Meal Status for {editingMeals?.name}</DialogTitle>
          </DialogHeader>
          {editingMeals && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const meals = {
                  goodies: fd.get("goodies") === "on",
                  day1_snacks: fd.get("day1_snacks") === "on",
                  day1_lunch: fd.get("day1_lunch") === "on",
                  day1_evening_snacks: fd.get("day1_evening_snacks") === "on",
                  day1_dinner: fd.get("day1_dinner") === "on",
                  day2_breakfast: fd.get("day2_breakfast") === "on",
                  day2_lunch: fd.get("day2_lunch") === "on",
                  day2_snacks: fd.get("day2_snacks") === "on",
                };
                participantsApi.updateMeals(editingMeals.id, meals).then(() => {
                  toast.success("Meal statuses updated!");
                  setEditingMeals(null);
                  queryClient.invalidateQueries({ queryKey: ["participants"] });
                });
              }}
              className="space-y-4"
            >
              {(["goodies", "day1_snacks", "day1_lunch", "day1_evening_snacks", "day1_dinner", "day2_breakfast", "day2_lunch", "day2_snacks"] as const).map((m) => (
                <div key={m} className="flex items-center justify-between rounded-xl bg-foreground/5 p-3">
                  <Label htmlFor={`meal-${m}`} className="capitalize">{m.replace(/_/g, " ")}</Label>
                  <Switch id={`meal-${m}`} name={m} defaultChecked={editingMeals.meals[m] === "collected"} />
                </div>
              ))}
              <Button type="submit" className="w-full rounded-2xl">Save Meal Status</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="glass rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the participant and their QR from the event. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleting) {
                  participantsApi.remove(deleting.id).then(() => {
                    toast.success("Participant deleted");
                    queryClient.invalidateQueries({ queryKey: ["participants"] });
                  });
                }
                setDeleting(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Double Confirmation Modals for Delete All */}
      <AlertDialog open={showDeleteAllConfirm1} onOpenChange={setShowDeleteAllConfirm1}>
        <AlertDialogContent className="glass rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete ALL Participants?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete every participant in the system. This action cannot be undone. Are you absolutely sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={(e) => {
                e.preventDefault();
                setShowDeleteAllConfirm1(false);
                setDeleteAllText("");
                setShowDeleteAllConfirm2(true);
              }}
            >
              Yes, proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteAllConfirm2} onOpenChange={setShowDeleteAllConfirm2}>
        <AlertDialogContent className="glass rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Final Confirmation Required</AlertDialogTitle>
            <AlertDialogDescription>
              To confirm you want to delete all participants, type <strong>DELETE ALL</strong> below.
            </AlertDialogDescription>
            <div className="mt-4">
              <input 
                type="text" 
                value={deleteAllText} 
                onChange={(e) => setDeleteAllText(e.target.value)} 
                placeholder="DELETE ALL"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={deleteAllText !== "DELETE ALL"}
              onClick={() => {
                participantsApi.deleteAll().then((res) => {
                  toast.success(`Successfully deleted ${res.deleted_count} participants`);
                  setShowDeleteAllConfirm2(false);
                  // Trigger a re-fetch conceptually (if we had access to the queryClient, but tanstack query usually refetches on window focus or we can just let it refetch naturally)
                  window.location.reload(); 
                });
              }}
            >
              Permanently Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
      {/* ── Reset Column Dialog ── */}
      <AlertDialog open={showResetColumn} onOpenChange={(o) => { if (!o) { setShowResetColumn(false); setResetColumnKeys(new Set()); setResetColumnConfirmText(""); } }}>
        <AlertDialogContent className="glass rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-400 flex items-center gap-2">
              <RotateCcw className="h-5 w-5" /> Reset Columns to Pending
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <span className="block text-sm text-muted-foreground">
                Select <strong>one or more columns</strong> to reset to <strong>Pending</strong> for <strong>all participants</strong>.
                This writes directly to the database and cannot be undone.
              </span>

              {/* Multi-select column picker */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {([
                  { key: "entry",               label: "Entry (Check-In)" },
                  { key: "goodies",             label: "Goodies" },
                  { key: "day1_snacks",          label: "D1 – Snacks" },
                  { key: "day1_lunch",           label: "D1 – Lunch" },
                  { key: "day1_evening_snacks",  label: "D1 – Evening" },
                  { key: "day1_dinner",          label: "D1 – Dinner" },
                  { key: "day2_breakfast",       label: "D2 – Breakfast" },
                  { key: "day2_lunch",           label: "D2 – Lunch" },
                  { key: "day2_snacks",          label: "D2 – Snacks" },
                ] as { key: string; label: string }[]).map(({ key, label }) => {
                  const selected = resetColumnKeys.has(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setResetColumnKeys((prev) => {
                          const next = new Set(prev);
                          if (next.has(key)) next.delete(key);
                          else next.add(key);
                          return next;
                        });
                      }}
                      className={[
                        "rounded-xl border px-3 py-2 text-sm text-left transition-all flex items-center gap-2",
                        selected
                          ? "border-amber-500 bg-amber-500/20 text-amber-300 font-semibold"
                          : "border-border bg-foreground/5 hover:border-amber-500/40 hover:bg-amber-500/5",
                      ].join(" ")}
                    >
                      <span className={[
                        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border text-xs",
                        selected ? "border-amber-500 bg-amber-500 text-white" : "border-muted-foreground",
                      ].join(" ")}>
                        {selected && "✓"}
                      </span>
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Confirmation text */}
              {resetColumnKeys.size > 0 && (
                <div className="pt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Type <strong>RESET</strong> to confirm resetting{" "}
                    <strong>{resetColumnKeys.size} column{resetColumnKeys.size > 1 ? "s" : ""}</strong> for all participants.
                  </p>
                  <input
                    type="text"
                    value={resetColumnConfirmText}
                    onChange={(e) => setResetColumnConfirmText(e.target.value)}
                    placeholder="RESET"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={isResettingColumn}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-amber-600 hover:bg-amber-600/90 text-white"
              disabled={resetColumnKeys.size === 0 || resetColumnConfirmText !== "RESET" || isResettingColumn}
              onClick={async (e) => {
                e.preventDefault();
                if (resetColumnKeys.size === 0) return;
                setIsResettingColumn(true);
                try {
                  const mealKeys = [...resetColumnKeys].filter((k) => k !== "entry");
                  const includesEntry = resetColumnKeys.has("entry");

                  const results: string[] = [];

                  if (includesEntry) {
                    const res = await entryApi.resetAllEntry();
                    results.push(`Entry: ${res.reset_count} participants`);
                  }

                  if (mealKeys.length > 0) {
                    const res = await participantsApi.resetAllMeals(mealKeys);
                    results.push(`${mealKeys.length} meal column(s): ${res.affected} participants`);
                  }

                  toast.success(`Reset complete — ${results.join(" · ")}`);
                  queryClient.invalidateQueries({ queryKey: ["participants"] });
                  setShowResetColumn(false);
                  setResetColumnKeys(new Set());
                  setResetColumnConfirmText("");
                } catch {
                  toast.error("Reset failed. Please try again.");
                } finally {
                  setIsResettingColumn(false);
                }
              }}
            >
              {isResettingColumn ? "Resetting…" : `Reset ${resetColumnKeys.size > 0 ? resetColumnKeys.size : ""} Column${resetColumnKeys.size !== 1 ? "s" : ""}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-11 rounded-2xl bg-background/40">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder.toLowerCase()}s</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-foreground/5 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  );
}
