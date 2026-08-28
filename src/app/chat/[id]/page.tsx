"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { getProfile } from "@/lib/profiles";
import { useApp } from "@/store/useApp";

/** پاسخ‌های آماده — چون بک‌اندی در کار نیست، طرف مقابل از همین‌ها جواب می‌دهد. */
const REPLIES = [
  "سلام! خوشحالم که پیام دادی 🙂",
  "چه جالب، بیشتر بگو.",
  "منم دقیقاً همین حس رو دارم.",
  "آخر هفته برنامه‌ات چیه؟",
  "قهوه یا چای؟ جواب مهمه!",
  "راستش انتظار نداشتم اینقدر زود جواب بدی.",
];

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const profile = getProfile(id);

  const isMatch = useApp((s) => s.matches.includes(id));
  const messages = useApp((s) => s.messages);
  const sendMessage = useApp((s) => s.sendMessage);
  const receiveMessage = useApp((s) => s.receiveMessage);

  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const thread = messages.filter((m) => m.matchId === id);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, typing]);

  if (!profile) {
    return (
      <div className="p-6 text-center text-white/70">
        این پروفایل پیدا نشد.{" "}
        <Link href="/matches" className="text-blush underline">
          بازگشت به مچ‌ها
        </Link>
      </div>
    );
  }

  if (!isMatch) {
    return (
      <div className="p-6 text-center text-white/70">
        هنوز با {profile.name} مچ نشده‌ای.{" "}
        <Link href="/" className="text-blush underline">
          برو به کشف
        </Link>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    sendMessage(id, text);
    setDraft("");

    setTyping(true);
    window.setTimeout(() => {
      receiveMessage(id, REPLIES[Math.floor(Math.random() * REPLIES.length)]);
      setTyping(false);
    }, 1100);
  };

  return (
    <div className="flex h-[calc(100dvh-6rem)] flex-col">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <Link href="/matches" className="text-xl text-white/60">
          ›
        </Link>
        <Avatar profile={profile} size={40} />
        <div>
          <p className="font-bold leading-tight">{profile.name}</p>
          <p className="text-xs text-white/50">
            {typing ? "در حال نوشتن…" : `${profile.job} — ${profile.city}`}
          </p>
        </div>
      </header>

      <div className="thin-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {thread.length === 0 && (
          <p className="mt-8 text-center text-sm text-white/45">
            اولین پیام را تو بفرست.
          </p>
        )}

        {thread.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.from === "me" ? "justify-start" : "justify-end"}`}
          >
            <p
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-6 ${
                m.from === "me"
                  ? "bg-gradient-to-br from-blush to-blush-deep text-white"
                  : "bg-white/10 text-white/90"
              }`}
            >
              {m.text}
            </p>
          </div>
        ))}

        {typing && (
          <div className="flex justify-end">
            <p className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white/60">
              …
            </p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={submit}
        className="flex items-center gap-2 border-t border-white/10 px-4 py-3"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="پیامت را بنویس…"
          className="flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/35 focus:border-blush"
        />
        <button
          type="submit"
          className="rounded-full bg-blush px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
          disabled={!draft.trim()}
        >
          ارسال
        </button>
      </form>
    </div>
  );
}
