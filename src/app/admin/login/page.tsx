"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "ورود ناموفق بود.");
        return;
      }
      const next = params.get("next");
      router.replace(next?.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 outline-none placeholder:text-white/35 focus:border-blush";

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm rounded-3xl border border-white/12 bg-card/70 p-7 backdrop-blur"
    >
      <h1 className="text-2xl font-black">ورود به پنل</h1>
      <p className="mt-1 text-sm text-white/55">
        فقط ادمین می‌تواند دعوت بسازد و جواب‌ها را ببیند.
      </p>

      <label className="mt-6 flex flex-col gap-2">
        <span className="text-sm text-white/70">نام کاربری</span>
        <input
          className={field}
          value={username}
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </label>

      <label className="mt-4 flex flex-col gap-2">
        <span className="text-sm text-white/70">رمز عبور</span>
        <input
          className={field}
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      {error && (
        <p className="mt-4 rounded-2xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full rounded-full bg-gradient-to-br from-blush to-blush-deep py-3.5 font-bold text-white disabled:opacity-50"
      >
        {busy ? "…" : "ورود"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
