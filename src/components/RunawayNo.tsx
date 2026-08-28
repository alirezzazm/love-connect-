"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

/** اگر نشانگر از این فاصله (پیکسل) نزدیک‌تر شود، دکمه کنار می‌کشد. */
const FLEE_RADIUS = 70;
/** بیشترین جابه‌جایی از جای اصلی. دکمه هیچ‌وقت دورتر از این نمی‌رود. */
const MAX_SHIFT = 92;
/** بعد از این مدت بی‌حرکتی، به جای اصلی‌اش برمی‌گردد. */
const RETURN_AFTER_MS = 900;
const PADDING = 6;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * دکمهٔ «نه» که نمی‌شود کلیکش کرد.
 *
 * کلیک‌ناپذیری کارِ خودِ هندلرهاست: روی موبایل در pointerdown جلوی رویداد
 * گرفته می‌شود (پس click اصلاً شلیک نمی‌کند) و onClick هم کاری جز کنار
 * کشیدن انجام نمی‌دهد. جابه‌جایی فقط برای حس‌وحال است، نه برای امنیت.
 *
 * دکمه از کادر بیرون نمی‌زند و دورتر از MAX_SHIFT از جای خودش نمی‌رود؛
 * کمی کنار می‌کشد و بعد سر جای اولش برمی‌گردد.
 */
export default function RunawayNo({
  label,
  boundsRef,
  onDodge,
}: {
  label: string;
  /** کادری که دکمه اجازهٔ جابه‌جایی داخلش را دارد (خودِ کارت) */
  boundsRef: React.RefObject<HTMLElement | null>;
  onDodge: () => void;
}) {
  const placeholderRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const returnTimer = useRef<number | null>(null);

  const [home, setHome] = useState<Point | null>(null);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });

  /** جای اصلی دکمه = همان‌جایی که placeholder در چیدمان عادی نشسته است */
  useEffect(() => {
    const settle = () => {
      const bounds = boundsRef.current?.getBoundingClientRect();
      const slot = placeholderRef.current?.getBoundingClientRect();
      if (!bounds || !slot) return;
      setHome({ x: slot.left - bounds.left, y: slot.top - bounds.top });
      setOffset({ x: 0, y: 0 });
    };
    settle();
    window.addEventListener("resize", settle);
    return () => window.removeEventListener("resize", settle);
  }, [boundsRef]);

  const flee = useCallback(
    (from: Point | null) => {
      const bounds = boundsRef.current?.getBoundingClientRect();
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!bounds || !rect || !home) return;

      // جهت فرار: خلافِ جایی که نشانگر است
      let dirX: number;
      let dirY: number;
      if (from) {
        dirX = rect.left + rect.width / 2 - from.x;
        dirY = rect.top + rect.height / 2 - from.y;
      } else {
        dirX = Math.random() - 0.5;
        dirY = Math.random() - 0.5;
      }
      const length = Math.hypot(dirX, dirY) || 1;

      // بیشتر افقی حرکت می‌کند تا چیدمان کارت به‌هم نریزد
      const target = {
        x: home.x + (dirX / length) * MAX_SHIFT,
        y: home.y + (dirY / length) * MAX_SHIFT * 0.45,
      };

      // محدود به داخل کادر، تا دکمه هیچ‌وقت بیرون نزند
      const maxX = bounds.width - rect.width - PADDING;
      const maxY = bounds.height - rect.height - PADDING;
      const next = {
        x: clamp(target.x, PADDING, Math.max(PADDING, maxX)) - home.x,
        y: clamp(target.y, PADDING, Math.max(PADDING, maxY)) - home.y,
      };

      setOffset(next);
      onDodge();

      if (returnTimer.current) window.clearTimeout(returnTimer.current);
      returnTimer.current = window.setTimeout(
        () => setOffset({ x: 0, y: 0 }),
        RETURN_AFTER_MS
      );
    },
    [boundsRef, home, onDodge]
  );

  useEffect(
    () => () => {
      if (returnTimer.current) window.clearTimeout(returnTimer.current);
    },
    []
  );

  // روی دسکتاپ، نزدیک شدن نشانگر کافی است تا دکمه کنار بکشد
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
        // روی موبایل پیش از شلیک شدن click کنار می‌کشیم
        onPointerDown={(event) => {
          event.preventDefault();
          flee({ x: event.clientX, y: event.clientY });
        }}
        onClick={(event) => {
          event.preventDefault();
          flee(null);
        }}
        onFocus={() => flee(null)}
        className="absolute z-20 touch-none rounded-full border border-white/20 bg-white/10 px-8 py-3.5 text-lg font-bold text-white/70 backdrop-blur transition-transform duration-300 ease-out"
        style={
          home
            ? {
                left: home.x,
                top: home.y,
                transform: `translate(${offset.x}px, ${offset.y}px)`,
              }
            : { left: 0, top: 0, visibility: "hidden" }
        }
      >
        {label}
      </button>
    </>
  );
}
