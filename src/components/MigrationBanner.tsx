import { useState, useEffect } from "react";
import { migrateLocalStorageFn } from "@/lib/api";

const STORAGE_KEY = "speechpro.state.v1";
const MIGRATED_KEY = "speechpro.migrated.v1";

type LocalState = {
  profile: { name: string; birthDate: string };
  logs: {
    date: string;
    minutes: number;
    newWords: number;
    response: "Kurang" | "Cukup" | "Baik" | "Sangat Baik";
    note: string;
  }[];
  screenings: {
    id: string;
    date: string;
    age: number;
    yes: number;
    total: number;
    verdict: string;
  }[];
  parentNote: string;
};

function readLocalState(): LocalState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalState>;
    // Only consider migrating if there's meaningful data
    const hasData =
      (parsed.profile?.name && parsed.profile.name !== "Si Kecil") ||
      (parsed.logs && parsed.logs.length > 0) ||
      (parsed.screenings && parsed.screenings.length > 0);
    if (!hasData) return null;
    return {
      profile: parsed.profile ?? { name: "Si Kecil", birthDate: "" },
      logs: parsed.logs ?? [],
      screenings: parsed.screenings ?? [],
      parentNote: parsed.parentNote ?? "",
    };
  } catch {
    return null;
  }
}

function hasMigrated(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(MIGRATED_KEY) === "1";
}

function markMigrated() {
  window.localStorage.setItem(MIGRATED_KEY, "1");
}

/**
 * MigrationBanner — shown once after first login if localStorage has existing data.
 * Offers to migrate that data to the database.
 */
export function MigrationBanner({ onMigrated }: { onMigrated?: () => void }) {
  const [localData, setLocalData] = useState<LocalState | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasMigrated()) {
      setLocalData(readLocalState());
    }
  }, []);

  if (!localData || done) return null;

  const logCount = localData.logs.length;
  const screeningCount = localData.screenings.length;

  async function handleMigrate() {
    if (!localData) return;
    setLoading(true);
    setError(null);
    try {
      await migrateLocalStorageFn({ data: localData });
      markMigrated();
      setDone(true);
      onMigrated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migrasi gagal");
    } finally {
      setLoading(false);
    }
  }

  function handleSkip() {
    markMigrated();
    setLocalData(null);
  }

  return (
    <div
      role="alert"
      className="mx-4 mt-4 rounded-3xl border border-primary/20 bg-primary-soft px-5 py-4 shadow-[var(--shadow-card)] animate-in slide-in-from-top-2 fade-in duration-300"
    >
      <p className="text-sm font-extrabold text-primary">
        📦 Data lama ditemukan!
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Kami menemukan data{" "}
        <strong className="text-foreground">
          {localData.profile.name !== "Si Kecil" ? localData.profile.name : "Si Kecil"}
        </strong>{" "}
        di perangkat ini:{" "}
        <strong className="text-foreground">{logCount} catatan</strong>{" "}
        dan{" "}
        <strong className="text-foreground">{screeningCount} skrining</strong>.{" "}
        Pindahkan ke akun Anda?
      </p>

      {error && (
        <p className="mt-2 text-xs font-bold text-destructive">{error}</p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          id="migration-confirm"
          type="button"
          onClick={handleMigrate}
          disabled={loading}
          className="brand-gradient flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold text-primary-foreground transition-all hover:opacity-95 disabled:opacity-60"
        >
          {loading ? (
            <span className="size-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : null}
          {loading ? "Memindahkan…" : "Ya, pindahkan"}
        </button>
        <button
          id="migration-skip"
          type="button"
          onClick={handleSkip}
          disabled={loading}
          className="rounded-full border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-60"
        >
          Lewati
        </button>
      </div>
    </div>
  );
}
