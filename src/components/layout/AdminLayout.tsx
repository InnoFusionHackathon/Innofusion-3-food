import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  ScanLine,
  Users,
  FileBarChart,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Participants", to: "/admin/participants", icon: Users, exact: false },
  { label: "Organiser Codes", to: "/admin/codes", icon: QrCode, exact: false },
  { label: "Scan Logs", to: "/admin/logs", icon: ScanLine, exact: false },
  { label: "Reports", to: "/admin/reports", icon: FileBarChart, exact: false },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1.5">
      {nav.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary"
              />
            )}
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-transparent">
        <img src="/QRFusion.png" alt="QRFusion Logo" className="w-full h-full object-contain" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-base font-bold leading-tight">QRFusion</p>
        <p className="truncate text-xs text-muted-foreground">Management System</p>
      </div>
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!now) return <div className="h-9 w-40" />;
  return (
    <div className="hidden text-right sm:block">
      <p className="text-sm font-semibold leading-tight">
        {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </p>
      <p className="text-xs text-muted-foreground">
        {now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
      </p>
    </div>
  );
}

export function AdminLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    window.localStorage.removeItem("sfqr_token");
    navigate({ to: "/" });
  };

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] app-glow" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col justify-between border-r border-border/60 bg-sidebar/60 p-5 backdrop-blur-xl lg:flex">
        <div className="space-y-8">
          <Brand />
          <NavList />
        </div>
        <Button
          variant="ghost"
          onClick={logout}
          className="justify-start gap-3 rounded-2xl px-4 py-6 text-sm text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4.5 w-4.5" /> Logout
        </Button>
      </aside>

      <div className="relative lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border/50 bg-background/60 backdrop-blur-xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 border-border/60 bg-sidebar/95 p-5 backdrop-blur-xl">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <div className="space-y-8">
                    <Brand />
                    <NavList onNavigate={() => setOpen(false)} />
                    <Button
                      variant="ghost"
                      onClick={logout}
                      className="w-full justify-start gap-3 rounded-2xl px-4 text-muted-foreground hover:text-destructive"
                    >
                      <LogOut className="h-4.5 w-4.5" /> Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <div className="min-w-0">
                <h1 className="truncate font-display text-lg font-bold sm:text-xl">{title}</h1>
                {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Clock />
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative rounded-2xl border border-border/60" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              <div className="flex items-center gap-2 rounded-2xl border border-border/60 py-1 pl-1 pr-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-brand-gradient text-xs font-bold text-primary-foreground">
                    AD
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium md:block">Admin</span>
              </div>
            </div>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="px-4 py-6 sm:px-6 lg:px-8"
        >
          {actions && <div className="mb-6 flex flex-wrap gap-2">{actions}</div>}
          {children}
        </motion.main>
      </div>
    </div>
  );
}
