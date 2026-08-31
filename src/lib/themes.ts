import type { Locale } from "./types";

export type ThemeId =
  | "romantic"
  | "midnight"
  | "sunset"
  | "garden"
  | "noir"
  | "candy";

export type Theme = {
  id: ThemeId;
  label: Record<Locale, string>;
  /**
   * متغیرهای رنگ که روی کانتینر صفحهٔ دعوت می‌نشینند.
   *
   * تیلویند ۴ همین اسم‌ها را در کلاس‌هایی مثل `text-blush` و `bg-card/70`
   * به‌صورت `var(--color-blush)` صدا می‌زند، پس با نشاندن مقدار تازه روی
   * یک عنصر والد، همهٔ فرزندها رنگ تم را می‌گیرند بدون اینکه لازم باشد
   * حتی یک کلاس در کامپوننت‌ها عوض شود.
   */
  vars: Record<string, string>;
  /** پس‌زمینهٔ تمام‌صفحه؛ روی گرادیان پیش‌فرضِ body می‌نشیند */
  background: string;
  /** شکل‌های شناور پس‌زمینه در مرحله‌های عادی */
  ambientGlyphs: string[];
  /** شکل‌های جشن صفحهٔ پایانی */
  celebrateGlyphs: string[];
  /** شکل‌هایی که موقع جاخالی و «بله» می‌پاشند */
  burstGlyphs: string[];
  /** ایموجی ضربان‌دار بالای سؤال اول */
  heroEmoji: string;
  /** ایموجی ضربان‌دار صفحهٔ پایانی */
  finaleEmoji: string;
  /** سه رنگ برای نمایش تم در پنل ادمین */
  swatch: [string, string, string];
};

export const THEMES: Record<ThemeId, Theme> = {
  romantic: {
    id: "romantic",
    label: { fa: "عاشقانه", en: "Romantic" },
    vars: {
      "--color-ink": "#150512",
      "--color-ink-soft": "#230b1e",
      "--color-card": "#2b0f24",
      "--color-blush": "#ff5c8a",
      "--color-blush-deep": "#d81e5b",
      "--color-lilac": "#a855f7",
      "--color-cream": "#fdf2f8",
    },
    background:
      "radial-gradient(1000px 620px at 12% -10%, #47102f 0%, transparent 60%), radial-gradient(900px 620px at 100% 0%, #330d47 0%, transparent 55%), #150512",
    ambientGlyphs: ["❤", "♥"],
    celebrateGlyphs: ["❤", "💖", "💕", "🌹", "✨", "💞"],
    burstGlyphs: ["❤", "💖", "💕", "✨"],
    heroEmoji: "💗",
    finaleEmoji: "🌹",
    swatch: ["#ff5c8a", "#a855f7", "#2b0f24"],
  },

  midnight: {
    id: "midnight",
    label: { fa: "شب پرستاره", en: "Midnight" },
    vars: {
      "--color-ink": "#050a1a",
      "--color-ink-soft": "#0b1230",
      "--color-card": "#101a3d",
      "--color-blush": "#7dd3fc",
      "--color-blush-deep": "#3b82f6",
      "--color-lilac": "#818cf8",
      "--color-cream": "#eef4ff",
    },
    background:
      "radial-gradient(1000px 620px at 10% -10%, #12245e 0%, transparent 60%), radial-gradient(900px 620px at 100% 0%, #1b1050 0%, transparent 55%), #050a1a",
    ambientGlyphs: ["✦", "✧", "·"],
    celebrateGlyphs: ["⭐", "✨", "🌙", "💫", "✦", "🤍"],
    burstGlyphs: ["✨", "⭐", "💫", "✦"],
    heroEmoji: "🌙",
    finaleEmoji: "✨",
    swatch: ["#7dd3fc", "#818cf8", "#101a3d"],
  },

  sunset: {
    id: "sunset",
    label: { fa: "غروب", en: "Sunset" },
    vars: {
      "--color-ink": "#1a0a05",
      "--color-ink-soft": "#2b1108",
      "--color-card": "#3a1a0d",
      "--color-blush": "#fb923c",
      "--color-blush-deep": "#ea580c",
      "--color-lilac": "#f59e0b",
      "--color-cream": "#fff7ed",
    },
    background:
      "radial-gradient(1000px 620px at 12% -10%, #6b2410 0%, transparent 60%), radial-gradient(900px 620px at 100% 0%, #7c2d12 0%, transparent 55%), #1a0a05",
    ambientGlyphs: ["❤", "♥"],
    celebrateGlyphs: ["🧡", "✨", "🌅", "💛", "❤", "🌻"],
    burstGlyphs: ["🧡", "✨", "💛", "❤"],
    heroEmoji: "🌅",
    finaleEmoji: "🧡",
    swatch: ["#fb923c", "#f59e0b", "#3a1a0d"],
  },

  garden: {
    id: "garden",
    label: { fa: "باغ بهاری", en: "Garden" },
    vars: {
      "--color-ink": "#04140d",
      "--color-ink-soft": "#082018",
      "--color-card": "#0d2c20",
      "--color-blush": "#4ade80",
      "--color-blush-deep": "#16a34a",
      "--color-lilac": "#a3e635",
      "--color-cream": "#f0fdf4",
    },
    background:
      "radial-gradient(1000px 620px at 12% -10%, #0d4a2c 0%, transparent 60%), radial-gradient(900px 620px at 100% 0%, #14532d 0%, transparent 55%), #04140d",
    ambientGlyphs: ["❀", "✿"],
    celebrateGlyphs: ["🌸", "🌿", "🌷", "✨", "🌼", "🍃"],
    burstGlyphs: ["🌸", "🌷", "✨", "🌼"],
    heroEmoji: "🌷",
    finaleEmoji: "🌸",
    swatch: ["#4ade80", "#a3e635", "#0d2c20"],
  },

  noir: {
    id: "noir",
    label: { fa: "کلاسیک", en: "Noir" },
    vars: {
      "--color-ink": "#0a0a0a",
      "--color-ink-soft": "#141414",
      "--color-card": "#1c1a17",
      "--color-blush": "#e5c07b",
      "--color-blush-deep": "#b8912f",
      "--color-lilac": "#d4af37",
      "--color-cream": "#faf7f0",
    },
    background:
      "radial-gradient(1000px 620px at 12% -10%, #2a2317 0%, transparent 60%), radial-gradient(900px 620px at 100% 0%, #23201a 0%, transparent 55%), #0a0a0a",
    ambientGlyphs: ["✦", "◆"],
    celebrateGlyphs: ["✨", "🥂", "✦", "💫", "🤍", "◆"],
    burstGlyphs: ["✨", "✦", "💫"],
    heroEmoji: "🥂",
    finaleEmoji: "✨",
    swatch: ["#e5c07b", "#d4af37", "#1c1a17"],
  },

  candy: {
    id: "candy",
    label: { fa: "شاد و رنگی", en: "Candy" },
    vars: {
      "--color-ink": "#0f0524",
      "--color-ink-soft": "#1b0940",
      "--color-card": "#26105a",
      "--color-blush": "#f472b6",
      "--color-blush-deep": "#db2777",
      "--color-lilac": "#22d3ee",
      "--color-cream": "#fdf4ff",
    },
    background:
      "radial-gradient(1000px 620px at 12% -10%, #4c1d95 0%, transparent 60%), radial-gradient(900px 620px at 100% 0%, #0e7490 0%, transparent 55%), #0f0524",
    ambientGlyphs: ["❤", "★"],
    celebrateGlyphs: ["💖", "🍭", "🎈", "✨", "💫", "🩷"],
    burstGlyphs: ["💖", "🎈", "✨", "🍭"],
    heroEmoji: "🎈",
    finaleEmoji: "🍭",
    swatch: ["#f472b6", "#22d3ee", "#26105a"],
  },
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

export const DEFAULT_THEME: ThemeId = "romantic";

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && value in THEMES;
}

/** تمی که واقعاً وجود دارد؛ هر چیز ناشناخته به تم پیش‌فرض برمی‌گردد. */
export function resolveTheme(value: unknown): Theme {
  return THEMES[isThemeId(value) ? value : DEFAULT_THEME];
}
