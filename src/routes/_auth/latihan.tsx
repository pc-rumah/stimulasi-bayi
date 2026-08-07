import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, BottomNav, Card, PageHeader, PrintButton } from "@/components/AppShell";
import { ageBands, bandLabel, type AgeBandId } from "@/data/ages";
import { latihanSheets } from "@/data/latihan";
import { ageInMonths, bandForMonths, useSpeechPro } from "@/lib/store";

export const Route = createFileRoute("/_auth/latihan")({
  head: () => ({
    meta: [
      { title: "Latihan Kata Harian — SpeechPro" },
      {
        name: "description",
        content:
          "Daftar kata harian dan cara melatihnya sesuai tahap usia anak 0–36 bulan, lengkap dengan tips stimulasi dan manfaatnya.",
      },
      { property: "og:title", content: "Latihan Kata Harian — SpeechPro" },
      {
        property: "og:description",
        content: "Kosakata harian per tahap usia beserta cara melatih dan manfaatnya.",
      },
      { property: "og:url", content: "/latihan" },
    ],
    links: [{ rel: "canonical", href: "/latihan" }],
  }),
  component: LatihanPage,
});

function LatihanPage() {
  const { state } = useSpeechPro();
  const months = ageInMonths(state.profile.birthDate);
  const [band, setBand] = useState<AgeBandId>(bandForMonths(months));
  const sheet = latihanSheets[band];

  return (
    <AppShell>
      <PageHeader title="Latihan Kata Harian" subtitle={`Tahap ${bandLabel(band)}`} />

      <main className="flex flex-col gap-5 px-4 md:px-8 pt-4 pb-6">
        <div className="no-print flex flex-wrap gap-2 pb-1">
          {ageBands.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBand(b.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs md:text-sm font-extrabold transition-colors ${
                b.id === band
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-primary hover:bg-card/80"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        <Card>
          <p className="text-xs md:text-sm leading-relaxed text-muted-foreground">{sheet.intro}</p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sheet.categories.map((cat) => (
            <Card key={cat.title} className="flex flex-col justify-between">
              <div>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-2xl shadow-xs">
                    {cat.emoji}
                  </span>
                  <h2 className="min-w-0 text-base md:text-lg font-extrabold text-secondary-foreground">
                    {cat.title}
                  </h2>
                </div>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {cat.words.map((w) => (
                    <li
                      key={w}
                      className="rounded-full bg-tile-violet px-3 py-1.5 text-xs font-extrabold text-tile-violet-foreground"
                    >
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 border-t border-border/50 pt-3">
                <h3 className="text-xs font-extrabold text-secondary-foreground">
                  Kapan diucapkan
                </h3>
                <ul className="mt-1.5 flex flex-col gap-1.5">
                  {cat.when.map((w) => (
                    <li key={w} className="flex gap-2 text-xs md:text-sm leading-relaxed text-muted-foreground">
                      <span className="text-primary">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-tile-cream">
            <h2 className="text-base md:text-lg font-extrabold text-tile-cream-foreground">
              Tips Stimulasi
            </h2>
            <ul className="mt-2.5 flex flex-col gap-2">
              {sheet.tips.map((t) => (
                <li key={t} className="flex gap-2 text-xs md:text-sm leading-relaxed text-foreground">
                  <span>💡</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-tile-mint">
            <h2 className="text-base md:text-lg font-extrabold text-tile-mint-foreground">
              Manfaat Latihan
            </h2>
            <ul className="mt-2.5 flex flex-col gap-2">
              {sheet.manfaat.map((m) => (
                <li key={m} className="flex gap-2 text-xs md:text-sm leading-relaxed text-foreground">
                  <span>✅</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card>
          <p className="text-xs md:text-sm leading-relaxed font-bold text-secondary-foreground">
            {sheet.closing}
          </p>
        </Card>

        <PrintButton label="Cetak Lembar Latihan" />
      </main>

      <BottomNav />
    </AppShell>
  );
}
