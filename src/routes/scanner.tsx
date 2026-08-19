import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Coffee,
  Cookie,
  Gift,
  Loader2,
  LogOut,
  Moon,
  ShieldAlert,
  Soup,
  Sun,
  Ticket,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/common/GlassCard";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { StatusBadge } from "@/components/common/StatusBadge";
import { playTone } from "@/lib/sound";
import { scansApi, participantsApi } from "@/services";
import { useQuery } from "@tanstack/react-query";
import type { MealType, ScanResult, Participant } from "@/services/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "QR Scanner — QRFusion Event Scanner" },
      {
        name: "description",
        content: "Scan participant QR codes to verify identity, issue meals, goodies and track event activity with duplicate protection.",
      },
      { property: "og:title", content: "QR Scanner — QRFusion Event Scanner" },
      { property: "og:description", content: "Verify participants and issue items by scanning QR codes." },
    ],
  }),
  component: ScannerPage,
});

const meals: { key: MealType; label: string; icon: typeof Coffee }[] = [
  { key: "entry", label: "Entry", icon: Ticket },
  { key: "goodies", label: "Goodies", icon: Gift },
  { key: "day1_snacks", label: "Day-1 Snacks", icon: Cookie },
  { key: "day1_lunch", label: "Day-1 Lunch", icon: Soup },
  { key: "day1_evening_snacks", label: "Day-1 Eve Snacks", icon: Coffee },
  { key: "day1_dinner", label: "Day-1 Dinner", icon: Moon },
  { key: "day2_breakfast", label: "Day-2 Breakfast", icon: Sun },
  { key: "day2_lunch", label: "Day-2 Lunch", icon: UtensilsCrossed },
  { key: "day2_snacks", label: "Day-2 Snacks", icon: Cookie },
];

function ScannerPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [meal, setMeal] = useState<MealType | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [last, setLast] = useState<ScanResult | null>(null);
  const verifyingRef = useRef(false);
  const submitScanRef = useRef<(val: string) => Promise<void>>(async () => { });
  const [organiser, setOrganiser] = useState("Organiser");
  const [now, setNow] = useState<string>("");

  const { data: participants = [] } = useQuery({ queryKey: ["participants"], queryFn: () => participantsApi.list() });
  const [entryMode, setEntryMode] = useState<"qr" | "manual">("qr");
  const [manualSearch, setManualSearch] = useState("");
  const [selectedManualId, setSelectedManualId] = useState("");

  const filteredParticipants = manualSearch.length >= 2
    ? participants.filter(p => p.name.toLowerCase().includes(manualSearch.toLowerCase()))
    : [];

  useEffect(() => {
    setOrganiser(window.localStorage.getItem("sfqr_organiser") ?? "Organiser");
    const tick = () =>
      setNow(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!meal || !videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        if (!verifyingRef.current) {
          submitScanRef.current(result.data);
        }
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scanner
      .start()
      .then(() => {
        setCameraOn(true);
        setCameraError(false);
      })
      .catch((err) => {
        console.error("Camera error:", err);
        setCameraError(true);
      });

    return () => {
      scanner.destroy();
    };
  }, [meal ? "active" : "inactive"]);

  const submitScan = async (value: string) => {
    if (!meal || !value.trim() || verifyingRef.current) return;
    setVerifying(true);
    verifyingRef.current = true;
    const res = await scansApi.scan({ qrId: value.trim(), meal });
    setVerifying(false);

    setResult(res);
    setLast(res);
    setQrValue("");
    playTone(res.status === "success" ? "success" : res.status === "duplicate" ? "error" : "warning");

    setTimeout(() => {
      setResult(null);
      verifyingRef.current = false;
    }, 2200);
  };

  useEffect(() => {
    submitScanRef.current = submitScan;
  }, [submitScan]);

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 app-glow" />

      <div className="relative mx-auto max-w-5xl px-4 py-6">
        <GlassCard className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4 sm:flex sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-primary-foreground">
              <Camera className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{organiser}</p>
              <p className="truncate text-xs text-muted-foreground">Event operations counter</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden font-mono text-sm sm:block">{now}</span>
            <StatusBadge tone="success">
              <Wifi className="mr-1 h-3 w-3" /> Online
            </StatusBadge>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Exit"
              className="rounded-2xl border border-border/60"
              onClick={() => navigate({ to: "/organiser" })}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </GlassCard>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-3xl border border-border/60 bg-foreground/5 p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {meals.map((m) => (
            <button
              key={m.key}
              onClick={() => setMeal(m.key)}
              className="relative rounded-2xl px-3 py-4 text-sm font-semibold transition-colors"
            >
              {meal === m.key && (
                <motion.span
                  layoutId="meal-pill"
                  className="absolute inset-0 rounded-2xl bg-brand-gradient"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span
                className={cn(
                  "relative flex items-center justify-center gap-2",
                  meal === m.key ? "text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <m.icon className="h-4 w-4" /> {m.label}
              </span>
            </button>
          ))}
        </div>

        <GlassCard className="relative mt-4 overflow-hidden p-0">
          <div className="relative aspect-[4/3] w-full bg-black/60 sm:aspect-[16/9]">
            {!meal ? (
              <div className="absolute inset-0 grid place-items-center px-6 text-center">
                <div>
                  <CameraOff className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 font-display text-xl font-bold">Select a meal to start scanning</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The camera activates once a meal counter is chosen.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
                {(!cameraOn || cameraError) && (
                  <div className="absolute inset-0 grid place-items-center px-6 text-center">
                    <div>
                      <CameraOff className="mx-auto h-9 w-9 text-muted-foreground" />
                      <p className="mt-3 text-sm text-muted-foreground">
                        {cameraError ? "Camera unavailable — use manual entry below." : "Starting camera…"}
                      </p>
                    </div>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="relative h-56 w-56 rounded-3xl border-2 border-primary/70">
                    <motion.div
                      animate={{ y: [0, 210, 0] }}
                      transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
                      className="h-0.5 w-full rounded-full bg-primary shadow-[0_0_20px_var(--primary)]"
                    />
                  </div>
                </div>
              </>
            )}

            <AnimatePresence>
              {verifying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 grid place-items-center bg-background/80 backdrop-blur-xl"
                >
                  <div className="text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                    <p className="mt-4 font-display text-lg font-semibold">Verifying QR…</p>
                  </div>
                </motion.div>
              )}
              {result && !verifying && <ResultOverlay result={result} />}
            </AnimatePresence>
          </div>

          <div className="border-t border-border/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Button
                variant={entryMode === "qr" ? "default" : "secondary"}
                className={cn("h-8 rounded-xl text-xs", entryMode === "qr" && "bg-brand-gradient")}
                onClick={() => setEntryMode("qr")}
              >
                QR Input
              </Button>
              <Button
                variant={entryMode === "manual" ? "default" : "secondary"}
                className={cn("h-8 rounded-xl text-xs", entryMode === "manual" && "bg-brand-gradient")}
                onClick={() => setEntryMode("manual")}
              >
                Search Name
              </Button>
            </div>

            {entryMode === "qr" ? (
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  value={qrValue}
                  disabled={!meal}
                  onChange={(e) => setQrValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitScan(qrValue)}
                  placeholder={meal ? "Scan or type QR ID (e.g. QR-001-0)" : "Select a meal first"}
                  className="h-12 min-w-0 flex-1 rounded-2xl bg-background/40 font-mono"
                />
                <Button
                  disabled={!meal || !qrValue}
                  onClick={() => submitScan(qrValue)}
                  className="h-12 rounded-2xl bg-brand-gradient px-6 font-semibold text-primary-foreground"
                >
                  Verify
                </Button>
              </div>
            ) : (
              <div className="relative flex flex-col gap-3">
                <Input
                  value={manualSearch}
                  disabled={!meal}
                  onChange={(e) => {
                    setManualSearch(e.target.value);
                    setSelectedManualId("");
                  }}
                  placeholder={meal ? "Search participant by name (e.g. Virat)" : "Select a meal first"}
                  className="h-12 w-full rounded-2xl bg-background/40"
                />
                {manualSearch.length >= 2 && !selectedManualId && (
                  <div className="absolute top-14 z-50 max-h-48 w-full overflow-y-auto rounded-xl border border-border/50 bg-background/90 p-1 shadow-xl backdrop-blur-xl">
                    {filteredParticipants.length === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground">No matches found.</p>
                    ) : (
                      filteredParticipants.map(p => (
                        <div
                          key={p.id}
                          className="cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-muted"
                          onClick={() => {
                            setManualSearch(p.name);
                            setSelectedManualId(p.qrId);
                          }}
                        >
                          <span className="font-semibold">{p.name}</span> <span className="text-xs text-muted-foreground ml-2">{p.college} - {p.team}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <Button
                  disabled={!meal || !selectedManualId}
                  onClick={() => {
                    submitScan(selectedManualId);
                    setManualSearch("");
                    setSelectedManualId("");
                  }}
                  className="h-12 w-full rounded-2xl bg-brand-gradient font-semibold text-primary-foreground"
                >
                  Manually Issue Meal
                </Button>
              </div>
            )}
          </div>
        </GlassCard>

        <div className="mt-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Last scan
          </h2>
          {!last?.participant ? (
            <GlassCard className="text-center text-sm text-muted-foreground">
              No scans yet in this session.
            </GlassCard>
          ) : (
            <GlassCard className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
              <img
                src={last.participant.photo}
                alt={last.participant.name}
                className="h-16 w-16 shrink-0 rounded-2xl object-cover"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-display text-lg font-bold">{last.participant.name}</p>
                  <StatusBadge
                    tone={last.status === "success" ? "success" : last.status === "duplicate" ? "danger" : "warning"}
                  >
                    {last.status}
                  </StatusBadge>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {last.participant.registrationId} · {last.participant.college} · {last.participant.team}
                </p>
                <p className="mt-1 truncate text-xs capitalize text-muted-foreground">
                  {last.meal} · {last.time}
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultOverlay({ result }: { result: ScanResult }) {
  const tone =
    result.status === "success"
      ? { bg: "bg-success/15", text: "text-success", Icon: CheckCircle2, title: "Successfully Issued" }
      : result.status === "duplicate"
        ? { bg: "bg-destructive/15", text: "text-destructive", Icon: ShieldAlert, title: "Already Collected" }
        : { bg: "bg-warning/15", text: "text-warning", Icon: AlertTriangle, title: "Participant Not Found" };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={cn("absolute inset-0 grid place-items-center px-6 text-center backdrop-blur-xl", tone.bg)}
    >
      <div>
        <motion.div
          initial={{ scale: 0.4, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className={cn("mx-auto grid h-24 w-24 place-items-center rounded-full bg-background/70", tone.text)}
        >
          <tone.Icon className="h-12 w-12" />
        </motion.div>
        <h2 className={cn("mt-5 font-display text-2xl font-bold sm:text-3xl", tone.text)}>{tone.title}</h2>
        {result.participant && (
          <div className="mt-3 space-y-1 text-sm">
            <p className="text-lg font-semibold">{result.participant.name}</p>
            <p className="text-muted-foreground">{result.participant.registrationId}</p>
            <p className="capitalize text-muted-foreground">
              {result.meal} · {result.status === "duplicate" ? result.collectedAt : result.time}
            </p>
            {result.status === "duplicate" && (
              <p className="text-muted-foreground">Collected by {result.collectedBy}</p>
            )}
          </div>
        )}
        <p className="mt-5 text-xs text-muted-foreground">Returning to scanner…</p>
      </div>
    </motion.div>
  );
}
