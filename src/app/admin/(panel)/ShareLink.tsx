"use client";

import { useEffect, useState } from "react";
import { inviteUrl } from "@/lib/site";

export default function ShareLink({ slug }: { slug: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // بعد از mount ساخته می‌شود تا اگر NEXT_PUBLIC_SITE_URL تنظیم نشده باشد
  // بتوان از دامنهٔ واقعی مرورگر استفاده کرد و hydration هم به هم نریزد.
  useEffect(() => setUrl(inviteUrl(slug)), [slug]);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-blush/25 bg-blush/10 p-4">
      <code className="min-w-0 flex-1 truncate text-sm text-white/80" dir="ltr">
        {url || `/d/${slug}`}
      </code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          } catch {
            window.prompt("لینک دعوت:", url);
          }
        }}
        className="rounded-full bg-blush px-5 py-2 text-sm font-bold text-white"
      >
        {copied ? "کپی شد ✓" : "کپی لینک"}
      </button>
    </div>
  );
}
