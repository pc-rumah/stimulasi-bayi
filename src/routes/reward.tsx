import { createFileRoute } from "@tanstack/react-router";
import { AppShell, BottomNav, Card, PageHeader } from "@/components/AppShell";
import trophy from "@/assets/trophy.png";
import { badges, dayLabels, rewardGoal } from "@/data/reward";
import {
  computePoints,
  computeStreak,
  unlockedBadgeIds,
  useSpeechPro,
  weekDates,
} from "@/lib/store";

export const Route = createFileRoute("/reward")({
  head: () => ({
    meta: [
      { title: "Reward & Pencapaian — SpeechPro" },
      {
        name: "description",
        content:
          "Kumpulkan poin, jaga streak harian, dan buka badge pencapaian sebagai motivasi rutin menstimulasi bahasa anak.",
      },
      { property: "og:title", content: "Reward & Pencapaian — SpeechPro" },
      {
        property: "og:description",
        content: "Poin, streak harian, dan badge pencapaian orang tua di SpeechPro.",
      },
      { property: "og:url", content: "/reward" },
    ],
    links: [{ rel: "canonical", href: "/reward" }],
  }),
  component: RewardPage,
});

function RewardPage() {
  const { state } = useSpeechPro();
  const points = computePoints(state);
  const streak = computeStreak(state.logs);
  const unlocked = unlockedBadgeIds(points, streak, badges);
  const week = weekDates();
  const done = new Set(state.logs.map((l) => l.date));
  const progress = Math.min(100, Math.round((points / rewardGoal) * 100));

  return (
    <AppShell>
      <PageHeader
        title="Reward & Pencapaian"
        subtitle="Motivasi untuk terus konsisten"
        illustration={<img src={trophy} alt="" className="w-full" />}
      />

      <main className="flex flex-col gap-5 px-4 md:px-8 pt-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-3xl bg-tile-cream p-4">
                <p className="text-3xl font-extrabold text-tile-cream-foreground">{points}</p>
                <p className="text-xs font-bold text-foreground">Total Poin</p>
              </div>
              <div className="rounded-3xl bg-tile-peach p-4">
                <p className="text-3xl font-extrabold text-tile-peach-foreground">{streak}</p>
                <p className="text-xs font-bold text-foreground">Hari Berturut-turut</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress Poin</span>
                <span>{points} / {rewardGoal} pt</span>
              </div>
              <div className="mt-2 h-3.5 overflow-hidden rounded-full bg-secondary">
                <div className="brand-gradient h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </Card>

          <Card className="flex flex-col justify-between">
            <h2 className="text-base md:text-lg font-extrabold text-secondary-foreground">Aktivitas Minggu Ini</h2>
            <ul className="mt-4 grid grid-cols-7 gap-2 text-center">
              {week.map((date, i) => (
                <li key={date}>
                  <span
                    className={`grid aspect-square place-items-center rounded-2xl text-base font-extrabold shadow-xs ${
                      done.has(date)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {done.has(date) ? "★" : "·"}
                  </span>
                  <span className="mt-1.5 block text-xs font-bold text-muted-foreground">
                    {dayLabels[i]}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card>
          <h2 className="text-base md:text-lg font-extrabold text-secondary-foreground">Badge Pencapaian</h2>
          <ul className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {badges.map((b) => {
              const isOpen = unlocked.includes(b.id);
              return (
                <li
                  key={b.id}
                  className={`tile-hover rounded-3xl p-4 text-center ${
                    isOpen ? "bg-tile-mint shadow-sm" : "bg-secondary/60 opacity-60"
                  }`}
                >
                  <p className="text-3xl md:text-4xl">{isOpen ? b.emoji : "🔒"}</p>
                  <p className="mt-2 text-xs md:text-sm font-extrabold text-secondary-foreground">{b.name}</p>
                  <p className="mt-0.5 text-[0.7rem] text-muted-foreground">{b.requirement}</p>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="bg-tile-sky">
          <p className="text-xs md:text-sm leading-relaxed text-foreground">
            💡 Poin bertambah 10 setiap kali catatan harian tersimpan dan 20 poin setiap kali skrining KPSP selesai.
          </p>
        </Card>
      </main>

      <BottomNav />
    </AppShell>
  );
}