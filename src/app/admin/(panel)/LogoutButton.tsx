"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/admin/login");
        router.refresh();
      }}
      className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/65 hover:bg-white/10"
    >
      خروج
    </button>
  );
}
