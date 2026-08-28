"use client";

import Link from "next/link";
import { useState } from "react";
import { inviteUrl } from "@/lib/site";

export type InviteSummary = {
  id: string;
  slug: string;
  recipientName: string;
  active: boolean;
  views: number;
  createdAt: string;
  questionCount: number;
  answered: boolean;
};

export default function InviteRow({ invite }: { invite: InviteSummary }) {
  const [copied, setCopied] = useState(false);

  const status = !invite.active
    ? { label: "غیرفعال", cls: "bg-white/10 text-white/50" }
    : invite.answered
      ? { label: "جواب داده", cls: "bg-emerald-500/20 text-emerald-200" }
      : invite.views > 0
        ? { label: "دیده شده", cls: "bg-amber-500/20 text-amber-200" }
        : { label: "باز نشده", cls: "bg-white/10 text-white/55" };

  const copy = async () => {
    const url = inviteUrl(invite.slug);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // در مرورگرهایی که اجازهٔ کلیپ‌بورد نمی‌دهند، دست‌کم لینک را نشان بده
      window.prompt("لینک دعوت:", url);
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <li className="rounded-2xl border border-white/12 bg-white/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold">
            {invite.recipientName}
            <span className={`ms-3 rounded-full px-2.5 py-1 text-xs ${status.cls}`}>
              {status.label}
            </span>
          </p>
          <p className="mt-1 text-xs text-white/45">
            /d/{invite.slug} — {invite.questionCount} سؤال — {invite.views} بازدید
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copy}
            className="rounded-full border border-white/15 px-4 py-2 text-xs hover:bg-white/10"
          >
            {copied ? "کپی شد ✓" : "کپی لینک"}
          </button>
          <Link
            href={`/d/${invite.slug}`}
            target="_blank"
            className="rounded-full border border-white/15 px-4 py-2 text-xs hover:bg-white/10"
          >
            پیش‌نمایش
          </Link>
          <Link
            href={`/admin/${invite.id}`}
            className="rounded-full bg-blush/20 px-4 py-2 text-xs font-bold text-blush hover:bg-blush/30"
          >
            جزئیات
          </Link>
        </div>
      </div>
    </li>
  );
}
