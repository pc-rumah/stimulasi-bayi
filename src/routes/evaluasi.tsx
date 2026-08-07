import { createFileRoute } from "@tanstack/react-router";
import { AppShell, BottomNav, Card, PageHeader, PrintButton } from "@/components/AppShell";
import { bandForScore, weeklyRecommendations } from "@/data/evaluasi";
import { useSpeechPro, weeklySummary, formatDate } from "@/lib/store";

export const Route = createFileRoute("/evaluasi")({
  head: () => ({
    meta: [
      { title: "Evaluasi Mingguan — SpeechPro" },
      {
        name: "description",
        content:
          "Ringkasan mingguan stimulasi bahasa anak: hari aktif, durasi, kata baru, respons, skor, dan rekomendasi minggu depan.",
      },
      { property: "og:title", content: "Evaluasi Mingguan — SpeechPro" },
      {
        property: "og:description",
        content: "Skor dan ringkasan stimulasi bahasa anak selama satu minggu.",
      },
      { property: "og:url", content: "/evaluasi" },
    ],
    links: [{ rel: "canonical", href: "/evaluasi" }],
  }),
  component: EvaluasiPage,
});

function EvaluasiPage() {
  const { state } = useSpeechPro();
  const s = weeklySummary(state);
  const band = bandForScore(s.score);
  const delta = s.score - s.previousScore;

  return (
    <AppShell>
      <PageHeader title="Evaluasi Mingguan" subtitle="Ringkasan minggu ini (Senin–Minggu)" />

      <main className="flex flex-col gap-5 px-4 md:px-8 pt-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          <Card className="md:col-span-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Skor Minggu Ini</p>
              <div className="mt-2 flex items-baseline gap-3">
                <p className="text-4xl md:text-5xl font-extrabold text-primary">{s.score}%</p>
                <p className="text-sm md:text-base font-extrabold" style={{ color: band?.color }}>
                  {band?.label}
                </p>
              </div>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground">
                {delta === 0
                  ? "Sama dengan minggu lalu"
                  : `${delta > 0 ? "Naik" : "Turun"} ${Math.abs(delta)}% dari minggu lalu`}
              </p>
            </div>
            <div className="mt-4 h-3.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="brand-gradient h-full rounded-full transition-all duration-500" style={{ width: `${s.score}%` }} />
            </div>
          </Card>

          <div className="md:col-span-7 grid grid-cols-2 gap-3 md:gap-4">
            <Card className="flex flex-col justify-center">
              <p className="text-xs text-muted-foreground">Hari aktif</p>
              <p className="mt-1 text-xl md:text-2xl font-extrabold text-secondary-foreground">
                {s.activeDays}/7
              </p>
            </Card>
            <Card className="flex flex-col justify-center">
              <p className="text-xs text-muted-foreground">Konsistensi</p>
              <p className="mt-1 text-xl md:text-2xl font-extrabold text-secondary-foreground">
                {s.consistency}%
              </p>
            </Card>
            <Card className="flex flex-col justify-center">
              <p className="text-xs text-muted-foreground">Durasi</p>
              <p className="mt-1 text-base md:text-lg font-extrabold text-secondary-foreground">
                {s.minutesRange}
              </p>
            </Card>
            <Card className="flex flex-col justify-center">
              <p className="text-xs text-muted-foreground">Kata baru</p>
              <p className="mt-1 text-xl md:text-2xl font-extrabold text-secondary-foreground">{s.newWords}</p>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card>
            <h2 className="text-base md:text-lg font-extrabold text-secondary-foreground">Catatan Minggu Ini</h2>
            <p className="mt-1 text-xs md:text-sm text-muted-foreground">
              Respons anak secara umum: <span className="font-bold text-foreground">{s.responseLabel}</span>
            </p>
            {s.logs.length === 0 ? (
              <p className="mt-3 text-xs md:text-sm text-muted-foreground">
                Belum ada catatan minggu ini. Mulai dari menu Hari Ini.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {s.logs.map((l) => (
                  <li
                    key={l.date}
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-2xl bg-secondary p-3"
                  >
                    <span className="truncate text-xs md:text-sm font-extrabold text-secondary-foreground">
                      {formatDate(l.date)}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {l.minutes} mnt · {l.response}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="bg-tile-mint flex flex-col justify-between">
            <div>
              <h2 className="text-base md:text-lg font-extrabold text-tile-mint-foreground">
                Rekomendasi Minggu Depan
              </h2>
              <ul className="mt-3 flex flex-col gap-2.5">
                {weeklyRecommendations.map((r) => (
                  <li key={r} className="flex gap-2 text-xs md:text-sm leading-relaxed text-foreground">
                    <span>✅</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        <PrintButton label="Cetak Evaluasi" />
      </main>

      <BottomNav />
    </AppShell>
  );
}