import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { adminGetAllUsersFn, adminToggleAdminFn } from "@/lib/api";
import { Users, Shield, ShieldOff, Clock, Activity } from "lucide-react";

type UserRow = {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
  childName: string | null;
  childBirthDate: string | null;
  logCount: number;
  screeningCount: number;
};

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — SpeechPro" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await adminGetAllUsersFn();
      setUsers(data as UserRow[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleAdmin(userId: string, current: boolean) {
    setToggling(userId);
    try {
      await adminToggleAdminFn({ data: { targetUserId: userId, isAdmin: !current } });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isAdmin: !current } : u)),
      );
    } finally {
      setToggling(null);
    }
  }

  const totalLogs = users.reduce((s, u) => s + u.logCount, 0);
  const totalScreenings = users.reduce((s, u) => s + u.screeningCount, 0);
  const adminCount = users.filter((u) => u.isAdmin).length;

  return (
    <AdminShell>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola semua pengguna SpeechPro
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Users className="size-5 text-primary" />} label="Total User" value={users.length} color="bg-primary-soft" />
          <StatCard icon={<Shield className="size-5 text-violet-600" />} label="Admin" value={adminCount} color="bg-tile-violet" />
          <StatCard icon={<Activity className="size-5 text-emerald-600" />} label="Total Catatan" value={totalLogs} color="bg-tile-mint" />
          <StatCard icon={<Clock className="size-5 text-amber-600" />} label="Total Skrining" value={totalScreenings} color="bg-tile-cream" />
        </div>

        {/* Users Table */}
        <div className="rounded-3xl bg-card shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-extrabold text-secondary-foreground">Semua Pengguna</h2>
            <span className="text-xs text-muted-foreground">{users.length} user</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
              <span className="size-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary mr-2" />
              Memuat data…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    <th className="px-5 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase tracking-wide">User</th>
                    <th className="px-5 py-3 text-left text-xs font-extrabold text-muted-foreground uppercase tracking-wide">Anak</th>
                    <th className="px-5 py-3 text-center text-xs font-extrabold text-muted-foreground uppercase tracking-wide">Catatan</th>
                    <th className="px-5 py-3 text-center text-xs font-extrabold text-muted-foreground uppercase tracking-wide">Skrining</th>
                    <th className="px-5 py-3 text-center text-xs font-extrabold text-muted-foreground uppercase tracking-wide">Admin</th>
                    <th className="px-5 py-3 text-center text-xs font-extrabold text-muted-foreground uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-bold text-foreground truncate max-w-[180px]">{u.email}</p>
                          <p className="text-[0.7rem] text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-foreground">{u.childName ?? "—"}</p>
                        {u.childBirthDate && (
                          <p className="text-[0.7rem] text-muted-foreground">{u.childBirthDate}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex size-7 items-center justify-center rounded-full bg-tile-mint text-xs font-extrabold">
                          {u.logCount}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex size-7 items-center justify-center rounded-full bg-tile-violet text-xs font-extrabold">
                          {u.screeningCount}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {u.isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[0.7rem] font-bold text-primary">
                            <Shield className="size-3" /> Admin
                          </span>
                        ) : (
                          <span className="text-[0.7rem] text-muted-foreground">User</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to="/admin/users/$userId"
                            params={{ userId: u.id }}
                            className="rounded-full bg-secondary px-3 py-1 text-[0.7rem] font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            Detail
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleAdmin(u.id, u.isAdmin)}
                            disabled={toggling === u.id}
                            title={u.isAdmin ? "Cabut admin" : "Jadikan admin"}
                            className={`rounded-full p-1.5 transition-colors disabled:opacity-50 ${
                              u.isAdmin
                                ? "bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
                                : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                            }`}
                          >
                            {u.isAdmin ? <ShieldOff className="size-3.5" /> : <Shield className="size-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                        Belum ada pengguna
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`rounded-3xl ${color} p-4 shadow-[var(--shadow-card)]`}>
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-2xl font-extrabold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground font-bold mt-0.5">{label}</p>
    </div>
  );
}
