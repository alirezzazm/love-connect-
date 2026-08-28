"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/store/useApp";

const ITEMS = [
  { href: "/", label: "کشف", icon: "❤" },
  { href: "/matches", label: "مچ‌ها", icon: "✦" },
  { href: "/profile", label: "پروفایل", icon: "☺" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const matchCount = useApp((s) => s.matches.length);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-white/10 bg-ink-soft/85 px-2 py-2 backdrop-blur">
      <ul className="flex items-stretch justify-around">
        {ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs transition ${
                  active
                    ? "bg-blush/15 text-blush"
                    : "text-white/55 hover:text-white/85"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                {item.label}
                {item.href === "/matches" && matchCount > 0 && (
                  <span className="absolute end-4 top-1 rounded-full bg-blush px-1.5 text-[10px] font-bold text-white">
                    {matchCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
