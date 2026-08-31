"use client";

import { useMemo } from "react";

export type Burst = {
  id: number;
  /** مختصات نسبت به کارتِ والد (که باید position: relative باشد) */
  x: number;
  y: number;
  /** پاشش بزرگ‌تر برای لحظهٔ «بله» */
  big?: boolean;
};

const FALLBACK_GLYPHS = ["❤", "💖", "💕", "✨"];

/** چند قلب که از یک نقطه به بیرون می‌پاشند و محو می‌شوند. */
function OneBurst({ burst, glyphs }: { burst: Burst; glyphs: string[] }) {
  const pieces = useMemo(() => {
    const count = burst.big ? 14 : 6;
    const spread = burst.big ? 130 : 66;
    return Array.from({ length: count }, (_, i) => {
      // زاویه‌ها پخش می‌شوند ولی کمی تصادف هم دارند تا مصنوعی نشود
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const distance = spread * (0.55 + Math.random() * 0.65);
      return {
        id: i,
        dx: `${Math.cos(angle) * distance}px`,
        dy: `${Math.sin(angle) * distance - 14}px`,
        rot: `${(Math.random() - 0.5) * 120}deg`,
        size: `${(burst.big ? 16 : 12) + Math.random() * (burst.big ? 16 : 8)}px`,
        glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
        delay: `${Math.random() * 90}ms`,
      };
    });
  }, [burst.big, glyphs]);

  return (
    <>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="heart-burst absolute will-change-transform"
          style={{
            left: burst.x,
            top: burst.y,
            fontSize: p.size,
            animationDelay: p.delay,
            ["--dx" as string]: p.dx,
            ["--dy" as string]: p.dy,
            ["--rot" as string]: p.rot,
          }}
        >
          {p.glyph}
        </span>
      ))}
    </>
  );
}

/**
 * پاشش قلب در نقطه‌ای از کارت — وقتی «نه» جاخالی می‌دهد و وقتی «بله» زده
 * می‌شود. تزئینی است، پس از صفحه‌خوان پنهان می‌ماند.
 *
 * پاک کردنِ پاشش‌های تمام‌شده کارِ والد است؛ این کامپوننت فقط رسم می‌کند.
 */
export default function HeartBurst({
  bursts,
  glyphs,
}: {
  bursts: Burst[];
  /** شکل‌های تم؛ اگر داده نشود قلب‌های پیش‌فرض */
  glyphs?: string[];
}) {
  const list = glyphs?.length ? glyphs : FALLBACK_GLYPHS;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-30">
      {bursts.map((b) => (
        <OneBurst key={b.id} burst={b} glyphs={list} />
      ))}
    </div>
  );
}
