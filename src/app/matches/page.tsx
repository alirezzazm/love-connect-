"use client";

import Link from "next/link";
import Avatar from "@/components/Avatar";
import { getProfile } from "@/lib/profiles";
import { useApp } from "@/store/useApp";

export default function MatchesPage() {
  const matches = useApp((s) => s.matches);
  const messages = useApp((s) => s.messages);

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-5 text-2xl font-black">مچ‌های تو</h1>

      {matches.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 p-8 text-center">
          <p className="text-lg font-bold">هنوز مچی نداری</p>
          <p className="mt-2 text-sm text-white/60">
            برو پروفایل‌ها را ورق بزن؛ اگر دو طرف همدیگر را بپسندند مچ می‌شوید.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-full bg-blush px-6 py-2 text-sm font-bold text-white"
          >
            رفتن به کشف
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {matches.map((id) => {
            const profile = getProfile(id);
            if (!profile) return null;

            const thread = messages.filter((m) => m.matchId === id);
            const last = thread[thread.length - 1];

            return (
              <li key={id}>
                <Link
                  href={`/chat/${id}`}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                >
                  <Avatar profile={profile} size={52} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">
                      {profile.name}
                      <span className="ms-2 text-xs font-normal text-white/50">
                        {profile.city}
                      </span>
                    </p>
                    <p className="truncate text-sm text-white/60">
                      {last
                        ? `${last.from === "me" ? "تو: " : ""}${last.text}`
                        : "هنوز پیامی رد و بدل نشده — تو شروع کن."}
                    </p>
                  </div>
                  <span className="text-white/30">‹</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
