import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  ChevronLeft,
  Sparkles,
  LogOut,
} from "lucide-react";
import type { ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { logoutFn } from "@/lib/auth";

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Semua User", icon: Users },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const location = useLocation();

  async function handleLogout() {
    await logoutFn();
    await router.invalidate();
    router.navigate({ to: "/login" });
  }

  return (
    <div className="flex min-h-screen bg-[oklch(0.975_0.012_300)] dark:bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 shrink-0 flex-col border-r border-border bg-card p-4 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="brand-gradient grid size-10 place-items-center rounded-2xl text-primary-foreground shadow-md">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-foreground">SpeechPro</h1>
            <p className="text-[0.65rem] font-bold text-destructive uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1">
          <p className="px-3 text-[0.65rem] font-extrabold uppercase tracking-wider text-muted-foreground">
            Menu Admin
          </p>
          <ul className="mt-2 space-y-1">
            {adminNav.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to || location.pathname.startsWith(to.replace(/\/$/, ""));
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
        </nav>

        {/* Back to App */}
        <div className="mt-auto space-y-2 border-t border-border pt-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <ChevronLeft className="size-4" />
            Kembali ke Aplikasi
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="size-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="brand-gradient grid size-8 place-items-center rounded-xl text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span className="font-extrabold text-sm">Admin Panel</span>
          </div>
          <Link to="/" className="text-xs font-bold text-primary">
            ← App
          </Link>
        </div>

        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
