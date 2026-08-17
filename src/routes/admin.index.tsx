import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Coffee,
  Moon,
  ScanLine,
  Soup,
  Timer,
  Users,
  Ticket,
} from "lucide-react";
import { motion } from "motion/react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { GlassCard } from "@/components/common/GlassCard";
import { StatCard } from "@/components/common/StatCard";
import { CardSkeleton, TableSkeleton } from "@/components/common/States";
import { StatusBadge, scanTone } from "@/components/common/StatusBadge";
import { HourlyBarChart, MealPieChart, MealTrendChart } from "@/components/charts/Charts";
import { dashboardApi, entryApi } from "@/services";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — QRFusion | HackOS" },
      {
        name: "description",
        content: "Live event management metrics, scan activity charts and duplicate detection.",
      },
      { property: "og:title", content: "Admin Dashboard — QRFusion | HackOS" },
      { property: "og:description", content: "Live event management metrics and scan activity." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
    refetchInterval: 15000,
  });

  return (
    <AdminLayout title="Dashboard" subtitle="Live overview of hackathon event operations">
      {isLoading || !data ? (
        <div className="space-y-6">
          <CardSkeleton count={8} />
          <TableSkeleton rows={4} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <StatCard index={0} label="Total Participants" value={data.totalParticipants} icon={Users} hint="registered for the event" />
            <StatCard index={1} label="Goodies Claimed" value={data.goodiesClaimed} icon={Coffee} progress={(data.goodiesClaimed / data.totalParticipants) * 100} />
            <StatCard index={2} label="D1 Snacks Claimed" value={data.day1SnacksClaimed} icon={Coffee} progress={(data.day1SnacksClaimed / data.totalParticipants) * 100} />
            <StatCard index={3} label="D1 Lunch Claimed" value={data.day1LunchClaimed} icon={Soup} accent="accent" progress={(data.day1LunchClaimed / data.totalParticipants) * 100} />
            <StatCard index={4} label="D1 Eve Snacks" value={data.day1EveningSnacksClaimed} icon={Coffee} accent="accent" progress={(data.day1EveningSnacksClaimed / data.totalParticipants) * 100} />
            <StatCard index={5} label="D1 Dinner Claimed" value={data.day1DinnerClaimed} icon={Moon} accent="chart2" progress={(data.day1DinnerClaimed / data.totalParticipants) * 100} />
            <StatCard index={6} label="D2 Breakfast" value={data.day2BreakfastClaimed} icon={Coffee} accent="chart2" progress={(data.day2BreakfastClaimed / data.totalParticipants) * 100} />
            <StatCard index={7} label="D2 Lunch Claimed" value={data.day2LunchClaimed} icon={Soup} accent="accent" progress={(data.day2LunchClaimed / data.totalParticipants) * 100} />
            <StatCard index={8} label="Today's Scans" value={data.todayScans} icon={ScanLine} hint="all counters" />
            <StatCard index={9} label="Duplicate Attempts" value={data.duplicateAttempts} icon={AlertTriangle} accent="danger" hint="blocked automatically" />
            <StatCard index={10} label="Active Organisers" value={data.activeOrganisers} icon={Activity} hint="scanning right now" />
            <StatCard index={11} label="Pending Meals" value={data.pendingMeals} icon={Timer} accent="accent" hint="not yet collected" />
          </div>

          {/* Entry Attendance Card */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-primary">
                <Ticket className="w-5 h-5" />
                <h2 className="font-semibold text-lg">Entry Attendance</h2>
              </div>
              <div className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">
                {data.entryCheckedIn} / {data.totalParticipants}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold">
                    {data.totalParticipants > 0 
                      ? Math.round((data.entryCheckedIn / data.totalParticipants) * 100) 
                      : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Checked In</div>
                </div>
                
                <div className="text-right text-sm">
                  <div className="text-green-600 dark:text-green-400 font-medium">{data.entryCheckedIn} Checked In</div>
                  <div className="text-red-500 dark:text-red-400 font-medium">{data.entryNotCheckedIn} Not Checked In</div>
                </div>
              </div>
              
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${data.totalParticipants > 0 ? (data.entryCheckedIn / data.totalParticipants) * 100 : 0}%` }}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Link 
                  to="/admin/entry"
                  className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-xl text-sm font-medium transition-colors text-center"
                >
                  View Attendance
                </Link>
                <button 
                  onClick={() => entryApi.exportExcel()} 
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Download Excel
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <GlassCard hover>
              <h2 className="text-base font-semibold">Meal Distribution</h2>
              <p className="mb-2 text-xs text-muted-foreground">Share of meals claimed</p>
              <MealPieChart data={data.mealDistribution} />
            </GlassCard>
            <GlassCard hover className="xl:col-span-2">
              <h2 className="text-base font-semibold">Hourly Scan Activity</h2>
              <p className="mb-2 text-xs text-muted-foreground">Scans per hour today</p>
              <HourlyBarChart data={data.hourlyActivity} />
            </GlassCard>
          </div>

          <GlassCard hover>
            <h2 className="text-base font-semibold">Meal Trend</h2>
            <p className="mb-2 text-xs text-muted-foreground">Cumulative claims across the event</p>
            <MealTrendChart data={data.mealTrend} />
          </GlassCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <GlassCard hover>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">Live Activity</h2>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <motion.span
                    animate={{ opacity: [1, 0.25, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className="h-2 w-2 rounded-full bg-success"
                  />
                  auto-refreshing
                </span>
              </div>
              <ul className="space-y-3">
                {data.recentScans.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 rounded-2xl bg-foreground/5 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.participant}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.meal} · {s.organiser} · {s.time}
                      </p>
                    </div>
                    <StatusBadge tone={scanTone(s.status)}>{s.status}</StatusBadge>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard hover>
              <h2 className="mb-4 text-base font-semibold">Latest Duplicate Attempts</h2>
              <ul className="space-y-3">
                {data.recentDuplicates.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 rounded-2xl bg-foreground/5 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.participant}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.meal} · {s.device} · {s.time}
                      </p>
                    </div>
                    <StatusBadge tone={scanTone(s.status)}>{s.status}</StatusBadge>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
