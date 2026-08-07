import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, BottomNav, Card, NotifBell } from "@/components/AppShell";
import babyBlocks from "@/assets/baby-blocks.png";
import {
  ageInMonths,
  bandForMonths,
  computePoints,
  computeStreak,
  useSpeechPro,
  weeklySummary,
} from "@/lib/store";
import { bandLabel } from "@/data/ages";
import { latihanSheets } from "@/data/latihan";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SpeechPro — Stimulasi Bahasa Anak 0–36 Bulan" },
      {
        name: "description",
        content:
          "SpeechPro membantu orang tua memantau dan menstimulasi perkembangan bahasa anak usia 0–36 bulan: skrining KPSP, latihan kata harian, catatan perkembangan, dan evaluasi mingguan.",
      },
      { property: "og:title", content: "SpeechPro — Stimulasi Bahasa Anak 0–36 Bulan" },
      {
        property: "og:description",
        content:
          "Skrining bahasa KPSP, latihan kata harian, catatan stimulasi, evaluasi mingguan, dan reward untuk orang tua.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Beranda,
});

const modules = [
  {
    to: "/skrining",
    title: "Skrining Bahasa Anak",
    desc: "Kuesioner KPSP sesuai usia",
    emoji: "🩺",
    tile: "bg-tile-violet text-tile-violet-foreground",
  },
  {
    to: "/latihan",
    title: "Latihan Kata Harian",
    desc: "Kosakata & cara melatihnya",
    emoji: "🗣️",
    tile: "bg-tile-mint text-tile-mint-foreground",
  },
  {
    to: "/catatan",
    title: "Catatan Perkembangan",
    desc: "Catat stimulasi hari ini",
    emoji: "📝",
    tile: "bg-tile-peach text-tile-peach-foreground",
  },
  {
    to: "/panduan",
    title: "Panduan Orang Tua",
    desc: "Speech delay & screen time",
    emoji: "📚",
    tile: "bg-tile-sky text-tile-sky-foreground",
  },
  {
    to: "/evaluasi",
    title: "Evaluasi Mingguan",
    desc: "Ringkasan & skor minggu ini",
    emoji: "📊",
    tile: "bg-tile-blush text-tile-blush-foreground",
  },
  {
    to: "/reward",
    title: "Reward & Pencapaian",
    desc: "Poin, streak, dan badge",
    emoji: "🏆",
    tile: "bg-tile-cream text-tile-cream-foreground",
  },
] as const;

function Beranda() {
  const { state } = useSpeechPro();
  const months = ageInMonths(state.profile.birthDate);
  const band = bandForMonths(months);
  const points = computePoints(state);
  const streak = computeStreak(state.logs);
  const summary = weeklySummary(state);
  const sheet = latihanSheets[band];
  const firstCategory = sheet.categories[0];

  return (
    <AppShell>
      <header className="header-wash relative overflow-hidden rounded-b-[2rem] md:rounded-2xl px-4 md:px-8 pt-5 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="flex items-start justify-between md:block">
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-wide text-primary uppercase">SpeechPro</p>
              <h1 className="mt-1 truncate text-2xl md:text-3xl font-extrabold text-foreground">
                Hai, {state.profile.name || "Si Kecil"}!
              </h1>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground">
                {months === null
                  ? "Lengkapi profil untuk rekomendasi sesuai usia"
                  : `${months} bulan · Tahap ${bandLabel(band)}`}
              </p>
            </div>
            <div className="md:hidden">
              <NotifBell />
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-3xl bg-card p-4 shadow-[var(--shadow-card)]">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-secondary-foreground">
                Stimulasi Hari Ini
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                {firstCategory
                  ? `Coba kata: ${firstCategory.words.slice(0, 3).join(", ")}`
                  : "Ajak Si Kecil berbicara 10–15 menit"}
              </p>
              <Link
                to="/catatan"
                className="brand-gradient mt-3 inline-flex rounded-full px-4 py-2 text-xs font-extrabold text-primary-foreground transition-transform hover:scale-105"
              >
                Mulai sekarang
              </Link>
            </div>
            <img src={babyBlocks} alt="" className="w-20 md:w-24 shrink-0" />
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-5 px-4 md:px-8 pt-4 pb-6">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <Stat label="Poin" value={points} emoji="⭐" />
          <Stat label="Streak" value={`${streak} hari`} emoji="🔥" />
          <Stat label="Skor" value={`${summary.score}%`} emoji="📈" />
        </div>

        <div>
          <h2 className="mb-3 text-base md:text-lg font-extrabold text-secondary-foreground">
            Fitur Utama
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 md:gap-4">
            {modules.map((m) => (
              <li key={m.to}>
                <Link
                  to={m.to}
                  className={`tile-hover flex h-full flex-col gap-2 rounded-3xl p-4 shadow-[var(--shadow-card)] ${m.tile}`}
                >
                  <span className="grid size-11 place-items-center rounded-2xl bg-card text-2xl shadow-sm">
                    {m.emoji}
                  </span>
                  <span className="text-sm md:text-base leading-tight font-extrabold mt-1">
                    {m.title}
                  </span>
                  <span className="text-xs leading-relaxed opacity-85">{m.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Card className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5">
          <div className="max-w-xl">
            <h2 className="text-base md:text-lg font-extrabold text-secondary-foreground">
              Tahap Perkembangan
            </h2>
            <p className="mt-1 text-xs md:text-sm leading-relaxed text-muted-foreground">
              Lihat kemampuan bahasa yang biasanya muncul pada usia {bandLabel(band)} beserta
              aktivitas stimulasinya.
            </p>
          </div>
          <Link
            to="/perkembangan"
            className="shrink-0 inline-flex items-center justify-center rounded-full bg-primary-soft px-5 py-2.5 text-xs font-extrabold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Lihat tahap usia &rarr;
          </Link>
        </Card>
      </main>

      <BottomNav />
    </AppShell>
  );
}

function Stat({ label, value, emoji }: { label: string; value: string | number; emoji: string }) {
  return (
    <div className="rounded-3xl bg-card p-3 md:p-4 text-center shadow-[var(--shadow-card)] transition-all hover:scale-[1.02]">
      <p className="text-xl md:text-2xl leading-none">{emoji}</p>
      <p className="mt-1 text-sm md:text-base font-extrabold text-secondary-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

