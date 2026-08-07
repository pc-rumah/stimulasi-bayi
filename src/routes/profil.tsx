import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, BottomNav, Card, PageHeader } from "@/components/AppShell";
import { bandLabel } from "@/data/ages";
import { ageInMonths, bandForMonths, computePoints, computeStreak, useSpeechPro } from "@/lib/store";

export const Route = createFileRoute("/profil")({
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
  const { state, ready, update, reset } = useSpeechPro();
  const [name, setName] = useState(state.profile.name);
  const [birthDate, setBirthDate] = useState(state.profile.birthDate);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (ready) {
      setName(state.profile.name);
      setBirthDate(state.profile.birthDate);
    }
  }, [ready, state.profile.name, state.profile.birthDate]);

  const months = ageInMonths(state.profile.birthDate);

  return (
    <AppShell>
      <PageHeader title="Profil" subtitle="Data Si Kecil disimpan di perangkat ini" />

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
            <button
              type="button"
              onClick={() => {
                update({ profile: { name: name.trim() || "Si Kecil", birthDate } });
                setSaved(true);
              }}
              className="brand-gradient mt-5 w-full rounded-full py-3.5 text-sm font-extrabold text-primary-foreground transition-transform hover:scale-[1.01]"
            >
              Simpan Profil
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
                    <span>Usia:</span>
                    <span className="font-bold text-foreground">
                      {months === null ? "belum diisi" : `${months} bulan (${bandLabel(bandForMonths(months))})`}
                    </span>
                  </li>
                  <li className="flex justify-between border-b border-border/50 pb-2">
                    <span>Total poin:</span>
                    <span className="font-bold text-foreground">{computePoints(state)} pt</span>
                  </li>
                  <li className="flex justify-between border-b border-border/50 pb-2">
                    <span>Streak:</span>
                    <span className="font-bold text-foreground">{computeStreak(state.logs)} hari</span>
                  </li>
                  <li className="flex justify-between border-b border-border/50 pb-2">
                    <span>Catatan harian:</span>
                    <span className="font-bold text-foreground">{state.logs.length} kali</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Skrining KPSP:</span>
                    <span className="font-bold text-foreground">{state.screenings.length} kali</span>
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
          type="button"
          onClick={() => {
            if (window.confirm("Hapus semua data SpeechPro di perangkat ini?")) reset();
          }}
          className="mt-2 rounded-full border border-destructive py-3 text-sm font-extrabold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          Hapus Semua Data
        </button>
      </main>

      <BottomNav />
    </AppShell>
  );
}