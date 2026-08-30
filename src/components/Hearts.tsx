"use client";

import { useMemo } from "react";

/** شکل‌هایی که شناور می‌شوند. صفحهٔ پایانی تنوع بیشتری می‌گیرد. */
const AMBIENT_GLYPHS = ["❤", "♥"];
const CELEBRATE_GLYPHS = ["❤", "💖", "💕", "🌹", "✨", "💞"];

type Variant = "ambient" | "celebrate";

/**
 * قلب‌های شناورِ پس‌زمینه — فقط تزئینی، پس از دید صفحه‌خوان پنهان است.
 *
 * دو حالت دارد: `ambient` که کم‌رنگ و آرام است و زیر بقیهٔ مراحل می‌نشیند
 * بدون اینکه حواس را پرت کند، و `celebrate` که برای صفحهٔ پایانی است.
 *
 * هر قلب دو لایه است: لایهٔ بیرونی بالا می‌رود و لایهٔ درونی چپ و راست
 * تاب می‌خورد. اگر هر دو روی یک عنصر بودند، سرِ `transform` با هم دعوا
 * می‌کردند و یکی دیگری را خنثی می‌کرد.
 */
export default function Hearts({
  variant = "ambient",
  count,
}: {
  variant?: Variant;
  count?: number;
}) {
  const total = count ?? (variant === "celebrate" ? 26 : 10);

  const hearts = useMemo(
    () =>
      Array.from({ length: total }, (_, i) => {
        const celebrate = variant === "celebrate";
        const glyphs = celebrate ? CELEBRATE_GLYPHS : AMBIENT_GLYPHS;
        return {
          id: i,
          glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
          left: `${Math.random() * 100}%`,
          delay: `${Math.random() * (celebrate ? 5 : 9)}s`,
          duration: `${(celebrate ? 6 : 11) + Math.random() * 5}s`,
          swayDuration: `${2.5 + Math.random() * 2.5}s`,
          size: `${(celebrate ? 14 : 11) + Math.random() * (celebrate ? 24 : 14)}px`,
          peak: celebrate ? 0.95 : 0.3,
        };
      }),
    [total, variant]
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heart-rise absolute bottom-0 will-change-transform"
          style={{
            left: h.left,
            animationDelay: h.delay,
            animationDuration: h.duration,
            ["--peak-opacity" as string]: h.peak,
          }}
        >
          <span
            className="heart-sway block will-change-transform"
            style={{ animationDuration: h.swayDuration }}
          >
            <span style={{ fontSize: h.size }}>{h.glyph}</span>
          </span>
        </span>
      ))}
    </div>
  );
}
