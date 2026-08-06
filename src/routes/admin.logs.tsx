import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ScanLine } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { GlassCard } from "@/components/common/GlassCard";
import { SearchBox } from "@/components/common/SearchBox";
import { EmptyState, TableSkeleton } from "@/components/common/States";
import { StatusBadge, scanTone } from "@/components/common/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { scansApi } from "@/services";

export const Route = createFileRoute("/admin/logs")({
  head: () => ({
    meta: [
      { title: "Scan Logs — QRFusion" },
      {
        name: "description",
        content: "Every meal scan with organiser, device, timestamp and duplicate detection status.",
      },
      { property: "og:title", content: "Scan Logs — QRFusion" },
      { property: "og:description", content: "Audit every meal scan across the hackathon." },
    ],
  }),
  component: LogsPage,
});

function LogsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["scans"], queryFn: () => scansApi.list(), refetchInterval: 20000 });
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [meal, setMeal] = useState("all");
  const [status, setStatus] = useState("all");

  const rows = (data ?? []).filter((s) => {
    const q = search.toLowerCase();
    return (
      (!q || s.participant.toLowerCase().includes(q) || s.registrationId.toLowerCase().includes(q)) &&
      (!date || s.time.startsWith(date)) &&
      (meal === "all" || s.meal === meal) &&
      (status === "all" || s.status === status)
    );
  });

  return (
    <AdminLayout title="Scan Logs" subtitle="Complete audit trail of every QR scan">
      <GlassCard className="mb-6">
        <div className="grid gap-3 md:grid-cols-4">
          <SearchBox value={search} onChange={setSearch} placeholder="Search participant or reg ID" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 rounded-2xl bg-background/40"
          />
          <Select value={meal} onValueChange={setMeal}>
            <SelectTrigger className="h-11 rounded-2xl bg-background/40">
              <SelectValue placeholder="Meal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All meals</SelectItem>
              <SelectItem value="goodies">Goodies</SelectItem>
              <SelectItem value="day1_snacks">Day-1 Snacks</SelectItem>
              <SelectItem value="day1_lunch">Day-1 Lunch</SelectItem>
              <SelectItem value="day1_evening_snacks">Day-1 Eve Snacks</SelectItem>
              <SelectItem value="day1_dinner">Day-1 Dinner</SelectItem>
              <SelectItem value="day2_breakfast">Day-2 Breakfast</SelectItem>
              <SelectItem value="day2_lunch">Day-2 Lunch</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-11 rounded-2xl bg-background/40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="duplicate">Duplicate</SelectItem>
              <SelectItem value="invalid">Invalid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={ScanLine} title="No scans match these filters" description="Try clearing the date or status filter to see more activity." />
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-slim">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Time</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead>Organiser</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Device</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((s) => (
                  <TableRow key={s.id} className="border-border/50">
                    <TableCell className="font-mono text-xs text-muted-foreground">{s.time}</TableCell>
                    <TableCell>
                      <p className="font-medium">{s.participant}</p>
                      <p className="text-xs text-muted-foreground">{s.registrationId}</p>
                    </TableCell>
                    <TableCell className="capitalize">{s.meal}</TableCell>
                    <TableCell>{s.organiser}</TableCell>
                    <TableCell>
                      <StatusBadge tone={scanTone(s.status)}>{s.status}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.device}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </GlassCard>
    </AdminLayout>
  );
}
