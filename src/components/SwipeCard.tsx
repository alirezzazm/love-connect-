"use client";

import { useRef, useState } from "react";
import type { Decision, Profile } from "@/lib/types";

const THRESHOLD = 110;

export default function SwipeCard({
  profile,
  onDecide,
  interactive,
  depth,
}: {
  profile: Profile;
  onDecide: (decision: Decision) => void;
  /** فقط کارت رویی قابل کشیدن است */
  interactive: boolean;
  /** جایگاه کارت در پشته: ۰ یعنی رویی */
  depth: number;
}) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  const decided = (decision: Decision) => {
    setDx(decision === "like" ? 600 : -600);
    window.setTimeout(() => {
      setDx(0);
      onDecide(decision);
    }, 180);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    startX.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDx(e.clientX - startX.current);
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dx > THRESHOLD) decided("like");
    else if (dx < -THRESHOLD) decided("pass");
    else setDx(0);
  };

  const rotation = dx / 18;
  const likeOpacity = Math.min(Math.max(dx / THRESHOLD, 0), 1);
  const passOpacity = Math.min(Math.max(-dx / THRESHOLD, 0), 1);

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`absolute inset-0 select-none overflow-hidden rounded-3xl border border-white/12 shadow-2xl ${
        interactive ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      }`}
      style={{
        transform: `translateX(${dx}px) rotate(${rotation}deg) scale(${
          1 - depth * 0.04
        }) translateY(${depth * 14}px)`,
        transition: dragging ? "none" : "transform 0.18s ease-out",
        zIndex: 10 - depth,
        background: `linear-gradient(160deg, ${profile.colors[0]}, ${profile.colors[1]})`,
      }}
    >
      <div className="flex h-full flex-col justify-end bg-gradient-to-t from-black/80 via-black/25 to-transparent p-5">
        <div
          className="pointer-events-none absolute end-5 top-5 rotate-12 rounded-xl border-4 border-emerald-300 px-3 py-1 text-2xl font-black text-emerald-300"
          style={{ opacity: likeOpacity }}
        >
          پسندیدم
        </div>
        <div
          className="pointer-events-none absolute start-5 top-5 -rotate-12 rounded-xl border-4 border-rose-300 px-3 py-1 text-2xl font-black text-rose-300"
          style={{ opacity: passOpacity }}
        >
          رد
        </div>

        <h2 className="text-3xl font-black drop-shadow">
          {profile.name}
          <span className="ms-2 text-2xl font-medium opacity-90">
            {profile.age}
          </span>
        </h2>
        <p className="mt-1 text-sm text-white/85">
          {profile.job} — {profile.city}
        </p>
        <p className="mt-3 text-sm leading-6 text-white/90">{profile.bio}</p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {profile.interests.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
