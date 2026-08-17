import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileDown, FileSpreadsheet, FileText, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { GlassCard } from "@/components/common/GlassCard";
import { AnimatedCounter } from "@/components/common/AnimatedCounter";
import { CardSkeleton } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import {
  CategoryBarChart,
  DailyLineChart,
  HourlyBarChart,
  MealPieChart,
} from "@/components/charts/Charts";
import { reportsApi } from "@/services";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — QRFusion | HackOS" },
      {
        name: "description",
        content: "Download meal-wise, college-wise, hourly and daily event distribution reports as CSV, Excel or PDF.",
      },
      { property: "og:title", content: "Reports — QRFusion | HackOS" },
      { property: "og:description", content: "Exportable event distribution analytics." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["reports"], queryFn: reportsApi.get });

  const download = (format: "csv" | "excel" | "pdf") =>
    reportsApi.download(format).then(() => toast.success(`${format.toUpperCase()} export requested`));

  return (
    <AdminLayout title="Reports" subtitle="Exportable analytics for organisers and sponsors">
      {isLoading || !data ? (
        <CardSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.totals.map((t) => (
              <GlassCard key={t.label} hover>
                <p className="text-sm text-muted-foreground">{t.label}</p>
                <AnimatedCounter value={t.value} className="mt-2 block font-display text-3xl font-bold" />
                <p className="mt-1 text-xs text-muted-foreground">{t.hint}</p>
              </GlassCard>
            ))}
          </div>

          <GlassCard>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">Download full report</p>
                  <p className="truncate text-xs text-muted-foreground">Includes all scans and participant status</p>
                </div>
              </div>
              <div className="col-span-2 flex flex-wrap gap-2">
                <Button variant="secondary" className="rounded-2xl" onClick={() => download("csv")}>
                  <FileDown className="mr-2 h-4 w-4" /> CSV
                </Button>
                <Button variant="secondary" className="rounded-2xl" onClick={() => download("excel")}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </Button>
                <Button
                  className="rounded-2xl bg-brand-gradient font-semibold text-primary-foreground"
                  onClick={() => download("pdf")}
                >
                  <FileText className="mr-2 h-4 w-4" /> PDF
                </Button>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <GlassCard hover>
              <h2 className="text-base font-semibold">Meal wise</h2>
              <MealPieChart data={data.mealWise} />
            </GlassCard>
            <GlassCard hover>
              <h2 className="text-base font-semibold">College wise</h2>
              <CategoryBarChart data={data.collegeWise} vertical />
            </GlassCard>
            <GlassCard hover>
              <h2 className="text-base font-semibold">Hourly</h2>
              <HourlyBarChart data={data.hourly} />
            </GlassCard>
            <GlassCard hover>
              <h2 className="text-base font-semibold">Daily</h2>
              <DailyLineChart data={data.daily} />
            </GlassCard>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
