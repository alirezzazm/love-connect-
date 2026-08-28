"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteInvite({
  inviteId,
  name,
}: {
  inviteId: string;
  name: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!confirm(`دعوت «${name}» و جوابش برای همیشه پاک شود؟`)) return;
        setBusy(true);
        const res = await fetch(`/api/invites/${inviteId}`, { method: "DELETE" });
        if (res.ok) {
          router.push("/admin");
          router.refresh();
        } else {
          setBusy(false);
          alert("حذف نشد، دوباره تلاش کن.");
        }
      }}
      className="mt-6 w-full rounded-full border border-rose-400/30 py-3 text-sm text-rose-200/80 hover:bg-rose-500/10 disabled:opacity-50"
    >
      حذف این دعوت
    </button>
  );
}
