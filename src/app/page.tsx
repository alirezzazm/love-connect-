"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SwipeCard from "@/components/SwipeCard";
import Avatar from "@/components/Avatar";
import { PROFILES } from "@/lib/profiles";
import type { Decision, Profile } from "@/lib/types";
import { useApp } from "@/store/useApp";

export default function DiscoverPage() {
  const decisions = useApp((s) => s.decisions);
  const decide = useApp((s) => s.decide);
  const resetAll = useApp((s) => s.resetAll);
  const [matched, setMatched] = useState<Profile | null>(null);

  const deck = useMemo(
    () => PROFILES.filter((p) => !decisions[p.id]),
    [decisions]
  );

  const handle = (profile: Profile, decision: Decision) => {
    const isMatch = decide(profile.id, decision);
    if (isMatch) setMatched(profile);
  };

  const top = deck[0];

  return (
    <div className="px-4 pt-6">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-black">
          لاو<span className="text-blush">کانکت</span>
        </h1>
        <span className="text-xs text-white/50">
          {deck.length} پروفایل باقی مانده
        </span>
      </header>

      <div className="relative h-[62vh] min-h-[420px]">
        {deck.length === 0 ? (
          <div className="grid h-full place-content-center gap-4 rounded-3xl border border-dashed border-white/15 p-6 text-center">
            <p className="text-lg font-bold">فعلاً پروفایل تازه‌ای نمانده</p>
            <p className="text-sm text-white/60">
              سری به مچ‌هایت بزن یا از اول شروع کن.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/matches"
                className="rounded-full bg-blush px-5 py-2 text-sm font-bold text-white"
              >
                مچ‌ها
              </Link>
              <button
                onClick={resetAll}
                className="rounded-full border border-white/20 px-5 py-2 text-sm"
              >
                شروع دوباره
              </button>
            </div>
          </div>
        ) : (
          deck
            .slice(0, 3)
            .reverse()
            .map((profile) => {
              const depth = deck.indexOf(profile);
              return (
                <SwipeCard
                  key={profile.id}
                  profile={profile}
                  depth={depth}
                  interactive={depth === 0}
                  onDecide={(decision) => handle(profile, decision)}
                />
              );
            })
        )}
      </div>

      {top && (
        <div className="mt-6 flex items-center justify-center gap-6">
          <button
            onClick={() => handle(top, "pass")}
            aria-label="رد کردن"
            className="grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-white/5 text-2xl transition hover:bg-white/10"
          >
            ✕
          </button>
          <button
            onClick={() => handle(top, "like")}
            aria-label="پسندیدن"
            className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-blush to-blush-deep text-3xl shadow-lg shadow-blush/30 transition hover:scale-105"
          >
            ❤
          </button>
        </div>
      )}

      {matched && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="animate-pop-in w-full max-w-sm rounded-3xl border border-white/15 bg-ink-soft p-6 text-center">
            <Avatar profile={matched} size={88} className="mx-auto" />
            <h2 className="mt-4 text-2xl font-black text-blush">مچ شدید!</h2>
            <p className="mt-2 text-sm text-white/75">
              تو و {matched.name} همدیگر را پسندیدید.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href={`/chat/${matched.id}`}
                className="flex-1 rounded-full bg-blush py-3 text-sm font-bold text-white"
              >
                شروع گفتگو
              </Link>
              <button
                onClick={() => setMatched(null)}
                className="flex-1 rounded-full border border-white/20 py-3 text-sm"
              >
                ادامهٔ کشف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
