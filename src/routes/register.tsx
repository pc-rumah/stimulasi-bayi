import { createFileRoute, useRouter, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { registerFn } from "@/lib/auth";
import { Sparkles, Eye, EyeOff, UserPlus } from "lucide-react";

export const Route = createFileRoute("/register")({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: "/" });
    }
  },
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      await registerFn({ data: { email, password } });
      await router.invalidate();
      router.navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[oklch(0.975_0.012_300)] dark:bg-background px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="brand-gradient grid size-14 place-items-center rounded-3xl text-primary-foreground shadow-lg">
            <Sparkles className="size-7" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">SpeechPro</h1>
            <p className="text-sm text-muted-foreground">Stimulasi Bahasa Anak 0–36 Bulan</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="mb-5 text-lg font-extrabold text-secondary-foreground">Buat Akun</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-email" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="rounded-2xl bg-secondary px-4 py-3 text-sm font-bold outline-none placeholder:font-normal placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-password" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  className="w-full rounded-2xl bg-secondary px-4 py-3 pr-12 text-sm font-bold outline-none placeholder:font-normal placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring transition-all"
                />
                <button
                  type="button"
                  aria-label={showPass ? "Sembunyikan" : "Tampilkan"}
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-confirm" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Konfirmasi Password
              </label>
              <input
                id="reg-confirm"
                type={showPass ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Ulangi password"
                className="rounded-2xl bg-secondary px-4 py-3 text-sm font-bold outline-none placeholder:font-normal placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-2xl bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive"
              >
                {error}
              </div>
            )}

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="brand-gradient mt-1 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-extrabold text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <UserPlus className="size-4" />
              )}
              {loading ? "Mendaftar…" : "Daftar"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
