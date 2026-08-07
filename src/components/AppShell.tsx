import { Link, useLocation, useRouteContext } from "@tanstack/react-router";
import {
  Home,
  Clock,
  Heart,
  MessageCircle,
  User,
  ChevronLeft,
  Bell,
  Stethoscope,
  BookOpen,
  Award,
  BarChart3,
  Sparkles,
  Baby,
  Plus,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Beranda", icon: Home },
  { to: "/riwayat", label: "Riwayat", icon: Clock },
  { to: "/catatan", label: "Hari Ini", icon: Heart, center: true },
  { to: "/pesan", label: "Pesan", icon: MessageCircle },
  { to: "/profil", label: "Profil", icon: User },
] as const;

const navItems = [
  { to: "/", label: "Beranda", icon: Home },
  { to: "/skrining", label: "Skrining KPSP", icon: Stethoscope },
  { to: "/latihan", label: "Latihan Kata", icon: Sparkles },
  { to: "/catatan", label: "Catatan Hari Ini", icon: Heart },
  { to: "/evaluasi", label: "Evaluasi Mingguan", icon: BarChart3 },
  { to: "/perkembangan", label: "Tahap Perkembangan", icon: Baby },
  { to: "/reward", label: "Reward & Badge", icon: Award },
  { to: "/riwayat", label: "Riwayat", icon: Clock },
  { to: "/panduan", label: "Panduan Orang Tua", icon: BookOpen },
  { to: "/pesan", label: "Pesan", icon: MessageCircle },
  { to: "/profil", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 px-2 pt-2 pb-3 backdrop-blur md:hidden shadow-lg">
      <ul className="mx-auto grid max-w-md grid-cols-5 items-end">
        {tabs.map(({ to, label, icon: Icon, ...rest }) => {
          const center = "center" in rest && rest.center;
          return (
            <li key={to} className="flex justify-center">
              <Link
                to={to}
                aria-label={label}
                className="group flex w-full flex-col items-center gap-1 text-[0.65rem] font-bold text-muted-foreground data-[status=active]:text-primary"
              >
                {center ? (
                  <span className="brand-gradient -mt-6 grid size-14 place-items-center rounded-full text-primary-foreground shadow-[var(--shadow-soft)] transition-transform group-hover:scale-105">
                    <Icon className="size-6" fill="currentColor" />
                  </span>
                ) : (
                  <span className="grid size-9 place-items-center rounded-2xl transition-colors group-data-[status=active]:bg-primary-soft">
                    <Icon className="size-5" />
                  </span>
                )}
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function DesktopSidebar() {
  const ctx = useRouteContext({ from: "__root__" });
  const user = (ctx as { user?: { email: string; isAdmin: boolean } | null }).user;
  const location = useLocation();

  return (
    <aside className="no-print hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r border-border bg-card p-4 min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="brand-gradient grid size-10 place-items-center rounded-2xl text-primary-foreground shadow-md">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">SpeechPro</h1>
          <p className="text-[0.7rem] font-bold text-muted-foreground">Stimulasi Bahasa Anak</p>
        </div>
      </div>

      {/* User Card */}
      {user && (
        <div className="mt-4 rounded-2xl bg-secondary/70 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-muted-foreground">Masuk sebagai</p>
              <p className="truncate text-sm font-extrabold text-foreground">{user.email}</p>
            </div>
            {user.isAdmin && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-extrabold text-primary">
                Admin
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick Action Button */}
      <Link
        to="/catatan"
        className="brand-gradient mt-4 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-extrabold text-primary-foreground shadow-sm transition-all hover:opacity-95 active:scale-[0.98]"
      >
        <Plus className="size-4" />
        Catat Hari Ini
      </Link>

      {/* Nav List */}
      <nav className="mt-6 flex-1 space-y-1">
        <p className="px-3 text-[0.65rem] font-extrabold uppercase tracking-wider text-muted-foreground">
          Navigasi Utama
        </p>
        <ul className="mt-2 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className={`size-4 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Admin link */}
        {user?.isAdmin && (
          <div className="mt-4 pt-4 border-t border-border/60">
            <p className="px-3 text-[0.65rem] font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
              Admin
            </p>
            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ShieldCheck className="size-4 text-primary" />
              Admin Dashboard
            </Link>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-border pt-3 px-2 text-[0.7rem] text-muted-foreground text-center">
        SpeechPro &copy; 2026 · Stimulasi 0-36 Bulan
      </div>
    </aside>
  );
}

export function PageHeader({
  title,
  subtitle,
  illustration,
  back = true,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  illustration?: ReactNode;
  back?: boolean;
  action?: ReactNode;
}) {
  return (
    <header className="header-wash relative overflow-hidden rounded-b-[2rem] md:rounded-2xl px-4 md:px-6 pt-5 pb-6 shadow-sm">
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {back ? (
            <Link
              to="/"
              aria-label="Kembali ke beranda"
              className="no-print grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
            >
              <ChevronLeft className="size-5" />
            </Link>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl leading-tight font-extrabold text-foreground truncate">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 text-xs md:text-sm leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {illustration ? (
        <div className="pointer-events-none absolute -right-4 -bottom-2 z-0 w-28 md:w-36 opacity-95">
          {illustration}
        </div>
      ) : null}
    </header>
  );
}

export function NotifBell() {
  return (
    <Link
      to="/pesan"
      aria-label="Pesan dan pengingat"
      className="no-print relative grid size-10 place-items-center rounded-full bg-card text-primary shadow-[var(--shadow-card)] transition-transform hover:scale-105"
    >
      <Bell className="size-5" />
      <span className="absolute top-1 right-1 size-2.5 rounded-full bg-destructive" />
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[oklch(0.975_0.012_300)] dark:bg-background text-foreground flex-col md:flex-row">
      <DesktopSidebar />
      <div className="print-area flex-1 flex flex-col min-w-0 w-full max-w-full md:max-w-5xl lg:max-w-6xl mx-auto pb-24 md:pb-10 px-0 sm:px-4 md:px-6 py-0 md:py-6">
        <div className="w-full flex-1 flex flex-col bg-background shadow-sm md:shadow-[var(--shadow-soft)] sm:rounded-[2rem] overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl bg-card p-4 md:p-5 shadow-[var(--shadow-card)] transition-all ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionTitle({
  icon,
  children,
  hint,
}: {
  icon?: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="mb-3 flex min-w-0 items-start gap-2">
      {icon ? <span className="shrink-0 text-lg leading-none">{icon}</span> : null}
      <div className="min-w-0">
        <h2 className="text-base font-extrabold text-secondary-foreground">{children}</h2>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

export function PrintButton({ label = "Cetak / Simpan" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print brand-gradient w-full rounded-full py-3 text-sm font-extrabold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform active:scale-[0.98] hover:opacity-95"
    >
      {label}
    </button>
  );
}