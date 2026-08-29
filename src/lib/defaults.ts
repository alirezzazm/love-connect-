import type { Locale, QuestionInput } from "./types";

/**
 * متن‌های پیش‌فرضِ یک دعوت تازه، به تفکیک زبان. ادمین همه‌شان را می‌تواند
 * عوض کند؛ اینها فقط نقطهٔ شروع فرم هستند.
 */
export const DEFAULT_HEADLINE: Record<Locale, string> = {
  fa: "با من میای بریم سر قرار؟",
  en: "Will you go on a date with me?",
};

export const DEFAULT_CLOSING_NOTE: Record<Locale, string> = {
  fa: "پس قرارمون شد همین! بی‌صبرانه منتظرم 🌹",
  en: "It’s settled then! I can’t wait 🌹",
};

const QUESTIONS_FA: QuestionInput[] = [
  {
    step: 0,
    type: "choice",
    prompt: "کجا بریم؟",
    options: ["کافه", "رستوران", "سینما", "پیاده‌روی توی پارک", "هرجا تو بگی"],
  },
  {
    step: 1,
    type: "choice",
    prompt: "چی بخوریم؟",
    options: ["ایرانی", "ایتالیایی", "فست‌فود", "سوشی", "فقط قهوه و کیک"],
  },
  {
    step: 2,
    type: "datetime",
    prompt: "چه روزی و چه ساعتی؟",
    options: [],
  },
];

const QUESTIONS_EN: QuestionInput[] = [
  {
    step: 0,
    type: "choice",
    prompt: "Where should we go?",
    options: [
      "A café",
      "A restaurant",
      "The cinema",
      "A walk in the park",
      "Wherever you like",
    ],
  },
  {
    step: 1,
    type: "choice",
    prompt: "What should we eat?",
    options: [
      "Persian",
      "Italian",
      "Fast food",
      "Sushi",
      "Just coffee and cake",
    ],
  },
  {
    step: 2,
    type: "datetime",
    prompt: "Which day and what time?",
    options: [],
  },
];

export const DEFAULT_QUESTIONS: Record<Locale, QuestionInput[]> = {
  fa: QUESTIONS_FA,
  en: QUESTIONS_EN,
};

/** ساخت یک slug کوتاه و قابل‌خواندن برای لینک دعوت */
export function makeSlug() {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
