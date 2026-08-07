import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, BottomNav, Card, PageHeader } from "@/components/AppShell";
import { bandLabel } from "@/data/ages";
import { ageInMonths, bandForMonths } from "@/lib/store";
import { getUserProfileFn, saveUserProfileFn, getUserLogsFn, getUserScreeningsFn, resetUserDataFn } from "@/lib/api";
import { logoutFn } from "@/lib/auth";
import { LogOut, Save, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_auth/profil")({
  head: () => ({
    meta: [
      { title: "Profil Anak — SpeechPro" },
      {
        name: "description",
        content:
          "Simpan nama dan tanggal lahir anak agar rekomendasi skrining serta latihan kata sesuai tahap usianya.",
      },
      { property: "og:title", content: "Profil Anak — SpeechPro" },
      {
        property: "og:description",
        content: "Atur profil anak untuk rekomendasi stimulasi sesuai usia.",
      },
      { property: "og:url", content: "/profil" },
    ],
    links: [{ rel: "canonical", href: "/profil" }],
  }),
  component: ProfilPage,
});

function ProfilPage() {
  const router = useRouter();
  const { user } = Route.useRouteContext();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [logCount, setLogCount] = useState(0);
  const [screeningCount, setScreeningCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserProfileFn().then((p) => {
      if (p) {
        setName(p.name);
        setBirthDate(p.birthDate ?? "");
      }
    });
    getUserLogsFn().then((logs) => setLogCount(logs.length));
    getUserScreeningsFn().then((s) => setScreeningCount(s.length));
  }, []);

  const months = ageInMonths(birthDate);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await saveUserProfileFn({ data: { name: name.trim() || "Si Kecil", birthDate } });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await logoutFn();
    await router.invalidate();
    router.navigate({ to: "/login" });
  }

  async function handleReset() {
    if (!window.confirm("Hapus semua data SpeechPro di akun ini? Tindakan ini tidak bisa dibatalkan.")) return;
    await resetUserDataFn();
    setName("");
    setBirthDate("");
    setLogCount(0);
    setScreeningCount(0);
  }

  return (
    <AppShell>
      <PageHeader
        title="Profil"
        subtitle={user?.email ?? ""}
        action={
          <button
            id="profil-logout-btn"
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-60"
          >
            <LogOut className="size-3.5" />
            {loggingOut ? "…" : "Keluar"}
          </button>
        }
      />

      <main className="flex flex-col gap-5 px-4 md:px-8 pt-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card>
            <label className="text-sm font-extrabold text-secondary-foreground" htmlFor="name">
              Nama anak
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-2xl bg-secondary px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-ring"
            />
            <label
              className="mt-4 block text-sm font-extrabold text-secondary-foreground"
              htmlFor="birth"
            >
              Tanggal lahir
            </label>
            <input
              id="birth"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-2 w-full rounded-2xl bg-secondary px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-ring"
            />

            {error && (
              <p className="mt-2 text-xs font-bold text-destructive">{error}</p>
            )}

            <button
              id="profil-save-btn"
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="brand-gradient mt-5 w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-extrabold text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              <Save className="size-4" />
              {saving ? "Menyimpan…" : "Simpan Profil"}
            </button>
            {saved ? (
              <p className="mt-2 text-center text-xs font-bold text-success">Profil tersimpan 🎉</p>
            ) : null}
          </Card>

          <div className="flex flex-col justify-between gap-4">
            <Card className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-base md:text-lg font-extrabold text-secondary-foreground">Ringkasan Profil</h2>
                <ul className="mt-3 flex flex-col gap-2 text-xs md:text-sm text-muted-foreground">
                  <li className="flex justify-between border-b border-border/50 pb-2">
                    <span>Akun:</span>
                    <span className="font-bold text-foreground truncate max-w-[140px]">{user?.email}</span>
                  </li>
                  <li className="flex justify-between border-b border-border/50 pb-2">
                    <span>Usia:</span>
                    <span className="font-bold text-foreground">
                      {months === null ? "belum diisi" : `${months} bulan (${bandLabel(bandForMonths(months))})`}
                    </span>
                  </li>
                  <li className="flex justify-between border-b border-border/50 pb-2">
                    <span>Catatan harian:</span>
                    <span className="font-bold text-foreground">{logCount} kali</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Skrining KPSP:</span>
                    <span className="font-bold text-foreground">{screeningCount} kali</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/panduan"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-primary-soft px-4 py-2.5 text-xs font-extrabold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Baca Panduan Orang Tua
              </Link>
            </Card>
          </div>
        </div>

        <button
          id="profil-reset-btn"
          type="button"
          onClick={handleReset}
          className="mt-2 flex items-center justify-center gap-2 rounded-full border border-destructive py-3 text-sm font-extrabold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <Trash2 className="size-4" />
          Hapus Semua Data
        </button>
      </main>

      <BottomNav />
    </AppShell>
  );
}
