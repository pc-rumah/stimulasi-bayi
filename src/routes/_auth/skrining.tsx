import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, BottomNav, Card, PageHeader, PrintButton } from "@/components/AppShell";
import { kpspStages } from "@/data/kpsp";
import { ageInMonths, todayKey } from "@/lib/store";
import { saveScreeningFn, getUserProfileFn } from "@/lib/api";
import { useEffect } from "react";

export const Route = createFileRoute("/_auth/skrining")({
  head: () => ({
    meta: [
      { title: "Skrining Bahasa Anak (KPSP) — SpeechPro" },
      {
        name: "description",
        content:
          "Isi kuesioner skrining bahasa berdasarkan KPSP Kemenkes RI untuk usia 3 sampai 36 bulan dan dapatkan hasil beserta saran stimulasi.",
      },
      { property: "og:title", content: "Skrining Bahasa Anak (KPSP) — SpeechPro" },
      {
        property: "og:description",
        content: "Kuesioner skrining bahasa anak 0–36 bulan berdasarkan KPSP Kemenkes RI.",
      },
      { property: "og:url", content: "/skrining" },
    ],
    links: [{ rel: "canonical", href: "/skrining" }],
  }),
  component: SkriningPage,
});

function verdictFor(yes: number, total: number) {
  const ratio = total === 0 ? 0 : yes / total;
  if (ratio === 1)
    return {
      label: "Sesuai Tahap Usia",
      tone: "bg-tile-mint text-tile-mint-foreground",
      advice: "Perkembangan bahasa Si Kecil sesuai usianya. Lanjutkan stimulasi harian.",
    };
  if (ratio >= 0.5)
    return {
      label: "Perlu Stimulasi Lebih",
      tone: "bg-tile-cream text-tile-cream-foreground",
      advice:
        "Tingkatkan stimulasi pada kemampuan yang belum muncul, lalu ulangi skrining 2 minggu kemudian.",
    };
  return {
    label: "Perlu Perhatian",
    tone: "bg-tile-blush text-tile-blush-foreground",
    advice:
      "Sebaiknya konsultasikan hasil ini dengan dokter anak, terapis bicara, atau tenaga kesehatan terdekat.",
  };
}

function SkriningPage() {
  const [birthDate, setBirthDate] = useState("");
  const months = ageInMonths(birthDate);
  const suggested = useMemo(() => {
    if (months === null) return kpspStages[3]!.age;
    const eligible = kpspStages.filter((s) => s.age <= months);
    return (eligible[eligible.length - 1] ?? kpspStages[0]!).age;
  }, [months]);

  useEffect(() => {
    getUserProfileFn().then((p) => { if (p?.birthDate) setBirthDate(p.birthDate); });
  }, []);

  const [age, setAge] = useState<number>(suggested);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [savingScreening, setSavingScreening] = useState(false);

  const stage = kpspStages.find((s) => s.age === age) ?? kpspStages[0]!;
  const yes = stage.questions.filter((q) => answers[q.id]).length;
  const answeredAll = stage.questions.every((q) => q.id in answers);
  const result = verdictFor(yes, stage.questions.length);

  const pickAge = (next: number) => {
    setAge(next);
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <AppShell>
      <PageHeader
        title="Skrining Bahasa Anak"
        subtitle="Berdasarkan KPSP & Stimulasi Kemenkes RI"
      />

      <main className="flex flex-col gap-5 px-4 md:px-8 pt-4 pb-6">
        <Card>
          <h2 className="text-sm md:text-base font-extrabold text-secondary-foreground">
            Pilih Usia Anak
          </h2>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            {months === null
              ? "Isi tanggal lahir di Profil agar usia terpilih otomatis."
              : `Usia Si Kecil saat ini ${months} bulan.`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {kpspStages.map((s) => (
              <button
                key={s.age}
                type="button"
                onClick={() => pickAge(s.age)}
                className={`rounded-full px-3.5 py-1.5 text-xs md:text-sm font-extrabold transition-colors ${
                  s.age === age
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-primary-soft text-primary hover:bg-primary/20"
                }`}
              >
                {s.age} bln
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-extrabold text-secondary-foreground">
              {stage.label}
            </h2>
            <span className="text-xs font-bold text-muted-foreground">
              {Object.keys(answers).length} / {stage.questions.length} dijawab
            </span>
          </div>

          <ol className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {stage.questions.map((q, i) => (
              <li key={q.id} className="flex flex-col justify-between rounded-3xl bg-secondary p-4">
                <div>
                  <p className="text-sm md:text-base leading-relaxed font-bold text-secondary-foreground">
                    {i + 1}. {q.text}
                  </p>
                  {q.note ? (
                    <p className="mt-1.5 text-xs text-muted-foreground">{q.note}</p>
                  ) : null}
                </div>
                <div className="mt-4 flex gap-2">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: val }))}
                      className={`flex-1 rounded-full py-2.5 text-xs font-extrabold transition-colors ${
                        answers[q.id] === val
                          ? val
                            ? "bg-success text-success-foreground shadow-sm"
                            : "bg-destructive text-destructive-foreground shadow-sm"
                          : "bg-card text-muted-foreground hover:bg-card/80"
                      }`}
                    >
                      {val ? "Ya" : "Tidak"}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>

          <button
            type="button"
            disabled={!answeredAll || savingScreening}
            onClick={async () => {
              setSavingScreening(true);
              try {
                await saveScreeningFn({
                  data: {
                    date: todayKey(),
                    age,
                    yesCount: yes,
                    totalCount: stage.questions.length,
                    verdict: result.label,
                  },
                });
                setSubmitted(true);
              } finally {
                setSavingScreening(false);
              }
            }}
            className="brand-gradient no-print mt-5 w-full rounded-full py-3.5 text-sm font-extrabold text-primary-foreground disabled:opacity-50 transition-all hover:opacity-95"
          >
            {savingScreening ? "Menyimpan…" : answeredAll ? "Lihat Hasil Skrining" : "Jawab semua pertanyaan dulu"}
          </button>
        </Card>

        {submitted ? (
          <Card className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className={`rounded-3xl p-5 ${result.tone}`}>
                <p className="text-xs font-bold uppercase opacity-80">Hasil Skrining</p>
                <p className="mt-1 text-xl font-extrabold">{result.label}</p>
                <p className="mt-1 text-xs md:text-sm">
                  Jawaban &quot;Ya&quot;: {yes} dari {stage.questions.length}
                </p>
              </div>
              <p className="mt-4 text-xs md:text-sm leading-relaxed text-muted-foreground">
                {result.advice}
              </p>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-sm md:text-base font-extrabold text-secondary-foreground">
                  Saran Stimulasi
                </h3>
                <ul className="mt-2 flex flex-col gap-2">
                  {stage.tips.map((tip) => (
                    <li key={tip} className="flex gap-2 text-xs md:text-sm leading-relaxed text-foreground">
                      <span>💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <PrintButton label="Cetak Hasil Skrining" />
                <Link
                  to="/riwayat"
                  className="no-print w-full sm:w-auto shrink-0 rounded-full bg-primary-soft px-5 py-3 text-center text-sm font-extrabold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Lihat Riwayat
                </Link>
              </div>
            </div>
          </Card>
        ) : null}
      </main>

      <BottomNav />
    </AppShell>
  );
}
