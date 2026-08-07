import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, BottomNav, Card, PageHeader } from "@/components/AppShell";
import { todayKey } from "@/lib/store";
import { saveLogFn } from "@/lib/api";

export const Route = createFileRoute("/_auth/catatan")({
  head: () => ({
    meta: [
      { title: "Catatan Perkembangan Harian — SpeechPro" },
      {
        name: "description",
        content:
          "Catat durasi stimulasi, kata baru, dan respons anak setiap hari untuk memantau perkembangan bahasanya.",
      },
      { property: "og:title", content: "Catatan Perkembangan Harian — SpeechPro" },
      {
        property: "og:description",
        content: "Formulir catatan stimulasi harian anak: durasi, kata baru, dan respons.",
      },
      { property: "og:url", content: "/catatan" },
    ],
    links: [{ rel: "canonical", href: "/catatan" }],
  }),
  component: CatatanPage,
});

type Response = "Kurang" | "Cukup" | "Baik" | "Sangat Baik";
const responses: Response[] = ["Kurang", "Cukup", "Baik", "Sangat Baik"];

function CatatanPage() {
  const today = todayKey();
  const [minutes, setMinutes] = useState(15);
  const [newWords, setNewWords] = useState(0);
  const [response, setResponse] = useState<Response>("Baik");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AppShell>
      <PageHeader title="Catatan Hari Ini" subtitle="Isi setelah stimulasi bersama Si Kecil" />

      <main className="flex flex-col gap-5 px-4 md:px-8 pt-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <Card className="md:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-extrabold text-secondary-foreground" htmlFor="minutes">
                  Durasi stimulasi (menit)
                </label>
                <input
                  id="minutes"
                  type="number"
                  min={0}
                  max={240}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="mt-2 w-full rounded-2xl bg-secondary px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label
                  className="text-sm font-extrabold text-secondary-foreground"
                  htmlFor="words"
                >
                  Jumlah kata / bunyi baru
                </label>
                <input
                  id="words"
                  type="number"
                  min={0}
                  max={100}
                  value={newWords}
                  onChange={(e) => setNewWords(Number(e.target.value))}
                  className="mt-2 w-full rounded-2xl bg-secondary px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <p className="mt-4 text-sm font-extrabold text-secondary-foreground">Respons anak</p>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {responses.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResponse(r)}
                  className={`rounded-full py-2.5 text-xs font-extrabold transition-colors ${
                    response === r ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-primary hover:bg-secondary/80"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <label
              className="mt-4 block text-sm font-extrabold text-secondary-foreground"
              htmlFor="note"
            >
              Catatan orang tua
            </label>
            <textarea
              id="note"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: hari ini Si Kecil menirukan kata 'mama'."
              className="mt-2 w-full rounded-2xl bg-secondary px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                setError(null);
                try {
                  await saveLogFn({ data: { date: today, minutes, newWords, response, note } });
                  setSaved(true);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Gagal menyimpan");
                } finally {
                  setSaving(false);
                }
              }}
              className="brand-gradient mt-5 w-full rounded-full py-3.5 text-sm font-extrabold text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {saving ? "Menyimpan…" : "Simpan Catatan (+10 poin)"}
            </button>
            {error && <p className="mt-2 text-center text-xs font-bold text-destructive">{error}</p>}
            {saved ? (
              <p className="mt-2 text-center text-xs font-bold text-success">
                Catatan hari ini tersimpan 🎉
              </p>
            ) : null}
          </Card>

          <div className="md:col-span-5 flex flex-col gap-4">
            <Card className="bg-tile-sky flex-1 flex flex-col justify-center">
              <h2 className="text-base font-extrabold text-tile-sky-foreground">Ingat Ya!</h2>
              <p className="mt-2 text-xs md:text-sm leading-relaxed text-foreground">
                Stimulasi 10–15 menit setiap hari jauh lebih efektif untuk perkembangan bahasa anak daripada sesi panjang sekali seminggu.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-foreground/80">
                <li className="flex items-center gap-2">
                  <span>✨</span> FOKUS pada kontak mata & respon
                </li>
                <li className="flex items-center gap-2">
                  <span>🗣️</span> Gunakan kalimat singkat & jelas
                </li>
                <li className="flex items-center gap-2">
                  <span>📚</span> Bacakan buku bergambar bersama
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>

      <BottomNav />
    </AppShell>
  );
}
