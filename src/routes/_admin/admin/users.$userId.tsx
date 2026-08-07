import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { adminGetUserDetailFn } from "@/lib/api";
import { ArrowLeft, Baby, FileText, Stethoscope, StickyNote } from "lucide-react";
import { Link } from "@tanstack/react-router";

type UserDetail = Awaited<ReturnType<typeof adminGetUserDetailFn>>;

export const Route = createFileRoute("/_admin/admin/users/$userId")({
  head: () => ({
    meta: [{ title: "Detail User — Admin SpeechPro" }],
  }),
  component: UserDetailPage,
});

function UserDetailPage() {
  const { userId } = Route.useParams();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetUserDetailFn({ data: { targetUserId: userId } })
      .then((d) => setDetail(d))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ArrowLeft className="size-3.5" />
          Kembali ke Dashboard
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
            <span className="size-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary mr-2" />
            Memuat detail…
          </div>
        ) : !detail ? (
          <p className="text-sm text-destructive">User tidak ditemukan.</p>
        ) : (
          <div className="space-y-6">
            {/* User Header */}
            <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-extrabold text-foreground">{detail.user.email}</h1>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold ${
                        detail.user.isAdmin
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {detail.user.isAdmin ? "Admin" : "User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Bergabung {new Date(detail.user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Child Profile */}
            <Section icon={<Baby className="size-4 text-primary" />} title="Profil Anak">
              {detail.profile ? (
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground font-bold">Nama</dt>
                    <dd className="font-extrabold text-foreground mt-0.5">{detail.profile.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground font-bold">Tanggal Lahir</dt>
                    <dd className="font-extrabold text-foreground mt-0.5">{detail.profile.birthDate ?? "—"}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">Profil anak belum diisi.</p>
              )}
            </Section>

            {/* Daily Logs */}
            <Section
              icon={<FileText className="size-4 text-primary" />}
              title={`Catatan Harian (${detail.logs.length})`}
            >
              {detail.logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada catatan.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 text-left font-bold text-muted-foreground">Tanggal</th>
                        <th className="py-2 text-center font-bold text-muted-foreground">Menit</th>
                        <th className="py-2 text-center font-bold text-muted-foreground">Kata</th>
                        <th className="py-2 text-left font-bold text-muted-foreground">Respons</th>
                        <th className="py-2 text-left font-bold text-muted-foreground">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {detail.logs.slice(0, 20).map((l) => (
                        <tr key={l.id} className="hover:bg-secondary/30">
                          <td className="py-2 font-bold text-foreground">{l.date}</td>
                          <td className="py-2 text-center">{l.minutes}</td>
                          <td className="py-2 text-center">{l.newWords}</td>
                          <td className="py-2">{l.response}</td>
                          <td className="py-2 text-muted-foreground truncate max-w-[160px]">{l.note || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {detail.logs.length > 20 && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Menampilkan 20 dari {detail.logs.length} catatan
                    </p>
                  )}
                </div>
              )}
            </Section>

            {/* Screening Results */}
            <Section
              icon={<Stethoscope className="size-4 text-primary" />}
              title={`Hasil Skrining (${detail.screenings.length})`}
            >
              {detail.screenings.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada skrining.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 text-left font-bold text-muted-foreground">Tanggal</th>
                        <th className="py-2 text-center font-bold text-muted-foreground">Usia (bln)</th>
                        <th className="py-2 text-center font-bold text-muted-foreground">Ya / Total</th>
                        <th className="py-2 text-left font-bold text-muted-foreground">Hasil</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {detail.screenings.map((s) => (
                        <tr key={s.id} className="hover:bg-secondary/30">
                          <td className="py-2 font-bold text-foreground">{s.date}</td>
                          <td className="py-2 text-center">{s.age}</td>
                          <td className="py-2 text-center">{s.yesCount}/{s.totalCount}</td>
                          <td className="py-2 text-muted-foreground">{s.verdict}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            {/* Parent Note */}
            {detail.parentNote && (
              <Section
                icon={<StickyNote className="size-4 text-primary" />}
                title="Catatan Orang Tua"
              >
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{detail.parentNote}</p>
              </Section>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="font-extrabold text-secondary-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}
