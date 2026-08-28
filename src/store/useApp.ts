"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Decision, Message } from "@/lib/types";
import { getProfile } from "@/lib/profiles";

type Me = {
  name: string;
  age: number;
  city: string;
  job: string;
  bio: string;
  interests: string[];
};

type AppState = {
  me: Me;
  /** تصمیم کاربر روی هر پروفایل: لایک یا رد */
  decisions: Record<string, Decision>;
  /** شناسهٔ پروفایل‌هایی که با آن‌ها مچ شده‌ایم */
  matches: string[];
  messages: Message[];
  hydrated: boolean;

  updateMe: (patch: Partial<Me>) => void;
  /** تصمیم را ثبت می‌کند و برمی‌گرداند که آیا مچ اتفاق افتاد یا نه */
  decide: (profileId: string, decision: Decision) => boolean;
  sendMessage: (matchId: string, text: string) => void;
  receiveMessage: (matchId: string, text: string) => void;
  undoLast: (profileId: string) => void;
  resetAll: () => void;
  setHydrated: () => void;
};

const INITIAL_ME: Me = {
  name: "کاربر مهمان",
  age: 28,
  city: "تهران",
  job: "برنامه‌نویس",
  bio: "اینجا را با چند خط دربارهٔ خودت پر کن.",
  interests: ["موسیقی", "سفر"],
};

const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      me: INITIAL_ME,
      decisions: {},
      matches: [],
      messages: [],
      hydrated: false,

      updateMe: (patch) => set((s) => ({ me: { ...s.me, ...patch } })),

      decide: (profileId, decision) => {
        const profile = getProfile(profileId);
        const matched =
          decision === "like" && !!profile?.likesYouBack;

        set((s) => ({
          decisions: { ...s.decisions, [profileId]: decision },
          matches:
            matched && !s.matches.includes(profileId)
              ? [profileId, ...s.matches]
              : s.matches,
        }));

        return matched;
      },

      sendMessage: (matchId, text) => {
        const body = text.trim();
        if (!body) return;
        set((s) => ({
          messages: [
            ...s.messages,
            { id: newId(), matchId, from: "me", text: body, at: Date.now() },
          ],
        }));
      },

      receiveMessage: (matchId, text) =>
        set((s) => ({
          messages: [
            ...s.messages,
            { id: newId(), matchId, from: "them", text, at: Date.now() },
          ],
        })),

      undoLast: (profileId) =>
        set((s) => {
          const decisions = { ...s.decisions };
          delete decisions[profileId];
          return {
            decisions,
            matches: s.matches.filter((id) => id !== profileId),
            messages: s.messages.filter((m) => m.matchId !== profileId),
          };
        }),

      resetAll: () =>
        set({ decisions: {}, matches: [], messages: [], me: INITIAL_ME }),

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "love-connect",
      // فقط فرانت‌اند است، پس همه‌چیز در localStorage همان مرورگر می‌ماند
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.();
      },
      partialize: (s) => ({
        me: s.me,
        decisions: s.decisions,
        matches: s.matches,
        messages: s.messages,
      }),
    }
  )
);
