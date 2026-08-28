"use client";

import { useState } from "react";
import { useApp } from "@/store/useApp";

const SUGGESTED = [
  "موسیقی",
  "کتاب",
  "سفر",
  "ورزش",
  "سینما",
  "آشپزی",
  "عکاسی",
  "طبیعت",
  "بازی",
  "قهوه",
];

export default function ProfilePage() {
  const me = useApp((s) => s.me);
  const updateMe = useApp((s) => s.updateMe);
  const resetAll = useApp((s) => s.resetAll);
  const matchCount = useApp((s) => s.matches.length);
  const [saved, setSaved] = useState(false);

  const toggleInterest = (tag: string) => {
    const has = me.interests.includes(tag);
    updateMe({
      interests: has
        ? me.interests.filter((t) => t !== tag)
        : [...me.interests, tag],
    });
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const field =
    "w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/35 focus:border-blush";

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-1 text-2xl font-black">پروفایل من</h1>
      <p className="mb-5 text-xs text-white/50">
        اطلاعات روی همین مرورگر ذخیره می‌شود — {matchCount} مچ تا الان.
      </p>

      <form onSubmit={save} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">نام</span>
          <input
            className={field}
            value={me.name}
            onChange={(e) => updateMe({ name: e.target.value })}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-white/70">سن</span>
            <input
              className={field}
              type="number"
              min={18}
              max={99}
              value={me.age}
              onChange={(e) => updateMe({ age: Number(e.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-white/70">شهر</span>
            <input
              className={field}
              value={me.city}
              onChange={(e) => updateMe({ city: e.target.value })}
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">شغل</span>
          <input
            className={field}
            value={me.job}
            onChange={(e) => updateMe({ job: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">دربارهٔ من</span>
          <textarea
            className={`${field} min-h-24 resize-y leading-6`}
            value={me.bio}
            maxLength={280}
            onChange={(e) => updateMe({ bio: e.target.value })}
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-white/70">علاقه‌مندی‌ها</span>
          <ul className="flex flex-wrap gap-2">
            {SUGGESTED.map((tag) => {
              const on = me.interests.includes(tag);
              return (
                <li key={tag}>
                  <button
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`rounded-full px-3 py-1.5 text-xs transition ${
                      on
                        ? "bg-blush text-white"
                        : "border border-white/15 text-white/65 hover:bg-white/10"
                    }`}
                  >
                    {tag}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          type="submit"
          className="mt-2 rounded-full bg-gradient-to-l from-blush to-lilac py-3 font-bold text-white"
        >
          {saved ? "ذخیره شد ✓" : "ذخیرهٔ پروفایل"}
        </button>

        <button
          type="button"
          onClick={() => {
            if (confirm("همهٔ مچ‌ها، پیام‌ها و تصمیم‌ها پاک شوند؟")) resetAll();
          }}
          className="rounded-full border border-white/15 py-3 text-sm text-white/60"
        >
          پاک کردن همهٔ داده‌ها
        </button>
      </form>
    </div>
  );
}
