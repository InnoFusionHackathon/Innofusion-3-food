import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Download, RefreshCcw, Ticket } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { GlassCard } from "@/components/common/GlassCard";
import { StatCard } from "@/components/common/StatCard";
import { HourlyBarChart } from "@/components/charts/Charts";
import { entryApi, participantsApi } from "@/services";

export const Route = createFileRoute("/admin/entry")({
  component: EntryManagementPage,
});

function EntryManagementPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["entry-stats"],
    queryFn: entryApi.getStats,
    refetchInterval: 15000,
  });

  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ["participants"],
    queryFn: () => participantsApi.list(),
    refetchInterval: 15000,
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) => entryApi.resetEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      queryClient.invalidateQueries({ queryKey: ["entry-stats"] });
    },
  });

  const filteredParticipants = participants?.filter((p) => {
    // Search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (
        !p.name.toLowerCase().includes(search) &&
        !p.team.toLowerCase().includes(search) &&
        !p.email.toLowerCase().includes(search) &&
        !p.qrId.toLowerCase().includes(search) &&
        !p.registrationId.toLowerCase().includes(search)
      ) {
        return false;
      }
    }
    // Status
    if (statusFilter === "checked_in" && !p.entry?.checkedIn) return false;
    if (statusFilter === "not_checked_in" && p.entry?.checkedIn) return false;
    // Team
    if (teamFilter !== "all" && p.team !== teamFilter) return false;

    return true;
  }) || [];

  // Group by team and sort
  const teamGroups: Record<string, typeof filteredParticipants> = {};
  filteredParticipants.forEach((p) => {
    const team = p.team || "No Team";
    if (!teamGroups[team]) teamGroups[team] = [];
    teamGroups[team].push(p);
  });

  const sortedTeams = Object.keys(teamGroups).sort((a, b) => a.localeCompare(b));
  
  const allTeams = Array.from(new Set(participants?.map(p => p.team || "No Team") || [])).sort();

  return (
    <AdminLayout title="Entry Management" subtitle="Manage hackathon arrivals and attendance">
      {statsLoading || !stats ? (
        <div className="flex items-center justify-center py-20">Loading...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard index={0} label="Total Participants" value={stats.totalParticipants} icon={Ticket} />
            <StatCard index={1} label="Checked In" value={stats.checkedIn} icon={Ticket} progress={stats.attendancePercentage} />
            <StatCard index={2} label="Not Checked In" value={stats.notCheckedIn} icon={Ticket} accent="danger" />
            <StatCard index={3} label="Attendance %" value={`${stats.attendancePercentage}%`} icon={Ticket} />
            <StatCard index={4} label="Duplicate Attempts" value={stats.duplicateAttempts} icon={Ticket} accent="danger" />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <GlassCard hover className="xl:col-span-2">
              <h2 className="text-base font-semibold">Check-in Activity</h2>
              <p className="mb-2 text-xs text-muted-foreground">Number of participants arriving per hour</p>
              <HourlyBarChart data={stats.hourlyActivity} />
            </GlassCard>
            <GlassCard hover className="flex flex-col justify-center">
              <h2 className="text-base font-semibold mb-4">Arrival Insights</h2>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">First Check-in</span>
                  <span className="font-medium">{stats.firstCheckIn}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Last Check-in</span>
                  <span className="font-medium">{stats.lastCheckIn}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-muted-foreground">Peak Hour</span>
                  <span className="font-medium">{stats.peakHour}</span>
                </div>
                <button
                  onClick={() => entryApi.exportExcel()}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-xl font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Attendance Excel
                </button>
              </div>
            </GlassCard>
          </div>

          <GlassCard className="!p-0 overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <h2 className="text-base font-semibold">Live Attendance Table</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search name, ID..."
                    className="w-full sm:w-48 pl-9 pr-4 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="checked_in">Checked In</option>
                  <option value="not_checked_in">Not Checked In</option>
                </select>
                <select
                  className="px-4 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                >
                  <option value="all">All Teams</option>
                  {allTeams.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 font-medium">Team Name</th>
                    <th className="px-6 py-3 font-medium">Participant</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Check-in Time</th>
                    <th className="px-6 py-3 font-medium">Checked By</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {participantsLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading...</td>
                    </tr>
                  ) : sortedTeams.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No participants found</td>
                    </tr>
                  ) : (
                    sortedTeams.map((teamName) => (
                      teamGroups[teamName].map((p, index) => (
                        <tr key={p.id} className="hover:bg-muted/10 transition-colors group">
                          <td className="px-6 py-3 font-medium border-r border-border/10">
                            {index === 0 ? teamName : ""}
                          </td>
                          <td className="px-6 py-3">
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.registrationId}</div>
                          </td>
                          <td className="px-6 py-3">
                            {p.entry?.checkedIn ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                                Checked In
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
                                Not Checked In
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">
                            {p.entry?.checkedInAt || "—"}
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">
                            {p.entry?.checkedInBy || "—"}
                          </td>
                          <td className="px-6 py-3 text-right">
                            {p.entry?.checkedIn && (
                              <button
                                onClick={() => {
                                  if (confirm(`Reset entry status for ${p.name}?`)) {
                                    resetMutation.mutate(p.id);
                                  }
                                }}
                                disabled={resetMutation.isPending}
                                className="text-xs text-red-500 hover:text-red-600 font-medium px-3 py-1 rounded hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                {resetMutation.isPending ? "Resetting..." : "Reset"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}
    </AdminLayout>
  );
}
