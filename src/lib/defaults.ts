import type { QuestionInput } from "./types";

/** متن‌های پیش‌فرضِ یک دعوت تازه. ادمین همه‌شان را می‌تواند عوض کند. */
export const DEFAULT_HEADLINE = "با من میای بریم سر قرار؟";

export const DEFAULT_CLOSING_NOTE =
  "پس قرارمون شد همین! بی‌صبرانه منتظرم 🌹";

export const DEFAULT_QUESTIONS: QuestionInput[] = [
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

/** ساخت یک slug کوتاه و قابل‌خواندن برای لینک دعوت */
export function makeSlug() {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
