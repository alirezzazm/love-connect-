"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

/** اگر نشانگر از این فاصله (پیکسل) نزدیک‌تر شود، دکمه فرار می‌کند. */
const FLEE_RADIUS = 110;
/** جای تازه دست‌کم این‌قدر از نشانگر دور باشد. */
const SAFE_DISTANCE = 150;
const PADDING = 8;

/**
 * دکمهٔ «نه» که نمی‌گذارد رویش کلیک شود.
 *
 * روی دسکتاپ با نزدیک شدن نشانگر جا خالی می‌دهد و روی موبایل با اولین
 * لمس (پیش از آن‌که click شلیک شود) می‌پرد. یک placeholder هم‌اندازه در
 * جریان عادی صفحه می‌ماند تا چیدمان اولیه طبیعی باشد.
 */
export default function RunawayNo({
  label,
  boundsRef,
  onDodge,
}: {
  label: string;
  /** ناحیه‌ای که دکمه اجازهٔ جابه‌جایی داخلش را دارد */
  boundsRef: React.RefObject<HTMLElement | null>;
  onDodge: () => void;
}) {
  const placeholderRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<Point | null>(null);

  /** یک نقطهٔ تصادفی داخل کادر که از نشانگر به‌قدر کافی دور باشد */
  const pickSpot = useCallback(
    (away: Point | null): Point | null => {
      const bounds = boundsRef.current?.getBoundingClientRect();
      const size = buttonRef.current?.getBoundingClientRect();
      if (!bounds || !size) return null;

      const maxX = Math.max(0, bounds.width - size.width - PADDING * 2);
      const maxY = Math.max(0, bounds.height - size.height - PADDING * 2);

      let best: Point = { x: PADDING, y: PADDING };
      let bestDistance = -1;

      // چند نقطه را امتحان می‌کنیم و دورترین را برمی‌داریم؛ این از
      // پریدنِ دکمه به زیر انگشت کاربر جلوگیری می‌کند.
      for (let i = 0; i < 12; i++) {
        const candidate = {
          x: PADDING + Math.random() * maxX,
          y: PADDING + Math.random() * maxY,
        };
        if (!away) return candidate;

        const centerX = bounds.left + candidate.x + size.width / 2;
        const centerY = bounds.top + candidate.y + size.height / 2;
        const distance = Math.hypot(centerX - away.x, centerY - away.y);

        if (distance > bestDistance) {
          bestDistance = distance;
          best = candidate;
        }
        if (distance >= SAFE_DISTANCE) return candidate;
      }
      return best;
    },
    [boundsRef]
  );

  const flee = useCallback(
    (from: Point | null) => {
      const spot = pickSpot(from);
      if (spot) {
        setPos(spot);
        onDodge();
      }
    },
    [pickSpot, onDodge]
  );

  // جای اولیه: دقیقاً همان‌جایی که placeholder نشسته است
  useEffect(() => {
    const settle = () => {
      const bounds = boundsRef.current?.getBoundingClientRect();
      const slot = placeholderRef.current?.getBoundingClientRect();
      if (!bounds || !slot) return;
      setPos({ x: slot.left - bounds.left, y: slot.top - bounds.top });
    };
    settle();
    window.addEventListener("resize", settle);
    return () => window.removeEventListener("resize", settle);
  }, [boundsRef]);

  // روی دسکتاپ، نزدیک شدن نشانگر کافی است تا دکمه جا خالی بدهد
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const distance = Math.hypot(
        event.clientX - (rect.left + rect.width / 2),
        event.clientY - (rect.top + rect.height / 2)
      );
      if (distance < FLEE_RADIUS) {
        flee({ x: event.clientX, y: event.clientY });
      }
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [flee]);

  return (
    <>
      <span
        ref={placeholderRef}
        aria-hidden
        className="pointer-events-none inline-block rounded-full px-8 py-3.5 text-lg font-bold opacity-0"
      >
        {label}
      </span>

      <button
        ref={buttonRef}
        type="button"
        // روی موبایل پیش از شلیک شدن click جابه‌جا می‌شویم
        onPointerDown={(event) => {
          event.preventDefault();
          flee({ x: event.clientX, y: event.clientY });
        }}
        onClick={(event) => {
          event.preventDefault();
          flee(null);
        }}
        onFocus={() => flee(null)}
        className="absolute z-20 touch-none rounded-full border border-white/20 bg-white/10 px-8 py-3.5 text-lg font-bold text-white/70 backdrop-blur transition-[top,left] duration-200 ease-out"
        style={
          pos
            ? { left: pos.x, top: pos.y }
            : { left: 0, top: 0, visibility: "hidden" }
        }
      >
        {label}
      </button>
    </>
  );
}
