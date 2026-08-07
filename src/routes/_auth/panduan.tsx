import { createFileRoute } from "@tanstack/react-router";
import { AppShell, BottomNav, Card, PageHeader } from "@/components/AppShell";
import family from "@/assets/family.png";
import {
  guideCautions,
  guideTopics,
  guideWhyItMatters,
  positiveActivities,
} from "@/data/panduan";

export const Route = createFileRoute("/_auth/panduan")({
  head: () => ({
    meta: [
      { title: "Panduan Orang Tua — SpeechPro" },
      {
        name: "description",
        content:
          "Panduan orang tua tentang speech delay, pola asuh suportif, pembatasan screen time, dan aktivitas positif untuk anak.",
      },
      { property: "og:title", content: "Panduan Orang Tua — SpeechPro" },
      {
        property: "og:description",
        content: "Speech delay, pola asuh suportif, dan pembatasan screen time untuk anak.",
      },
      { property: "og:url", content: "/panduan" },
    ],
    links: [{ rel: "canonical", href: "/panduan" }],
  }),
  component: PanduanPage,
});

function PanduanPage() {
  return (
    <AppShell>
      <PageHeader
        title="Panduan Orang Tua"
        subtitle="Bekal penting untuk mendampingi Si Kecil"
        illustration={<img src={family} alt="" className="w-full" />}
      />

      <main className="flex flex-col gap-5 px-4 md:px-8 pt-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {guideTopics.map((topic) => (
            <Card key={topic.id} className="flex flex-col justify-between">
              <div>
                <h2 className="text-base md:text-lg font-extrabold text-secondary-foreground">{topic.title}</h2>
                <p className="mt-1 text-xs md:text-sm leading-relaxed text-muted-foreground">{topic.intro}</p>
                {topic.sections.map((s) => (
                  <div key={s.heading} className="mt-3.5">
                    <h3 className="text-xs md:text-sm font-extrabold text-primary">{s.heading}</h3>
                    <ul className="mt-1.5 flex flex-col gap-1.5">
                      {s.items.map((it) => (
                        <li key={it} className="flex gap-2 text-xs md:text-sm leading-relaxed text-foreground">
                          <span className="text-primary">•</span>
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="bg-tile-mint">
            <h2 className="text-base md:text-lg font-extrabold text-tile-mint-foreground">Mengapa Penting?</h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {guideWhyItMatters.map((w) => (
                <li key={w} className="flex gap-2 text-xs md:text-sm leading-relaxed text-foreground">
                  <span>✅</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-tile-cream">
            <h2 className="text-base md:text-lg font-extrabold text-tile-cream-foreground">Hal yang Perlu Diingat</h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {guideCautions.map((c) => (
                <li key={c} className="flex gap-2 text-xs md:text-sm leading-relaxed text-foreground">
                  <span>💡</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card>
          <h2 className="text-base md:text-lg font-extrabold text-secondary-foreground">Aktivitas Positif Sehari-hari</h2>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {positiveActivities.map((a) => (
              <li key={a.title} className="rounded-2xl bg-secondary p-3.5 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-extrabold text-secondary-foreground">{a.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </main>

      <BottomNav />
    </AppShell>
  );
}
