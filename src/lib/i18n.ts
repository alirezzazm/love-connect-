import type { Locale } from "./types";

export const LOCALES: Locale[] = ["fa", "en"];

export function isLocale(value: unknown): value is Locale {
  return value === "fa" || value === "en";
}

/** جهت نوشتار هر زبان */
export const DIRECTION: Record<Locale, "rtl" | "ltr"> = {
  fa: "rtl",
  en: "ltr",
};

/** اسم زبان‌ها برای نمایش در پنل ادمین */
export const LOCALE_LABEL: Record<Locale, string> = {
  fa: "فارسی",
  en: "English",
};

// ───────────────────────────── تاریخ و ساعت ─────────────────────────────
//
// خواستهٔ اصلی: تاریخ همیشه به هر دو تقویم دیده شود — شمسی و میلادی — فارغ
// از اینکه زبان صفحه چیست. پس این توابع همیشه هر دو را می‌سازند و فقط
// ترتیبشان با زبان عوض می‌شود: تقویم آشنای همان زبان اول می‌آید.

/** رشتهٔ "YYYY-MM-DD" را به Date محلی تبدیل می‌کند (نه UTC) */
function parseDay(value: string): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * تاریخ شمسی، مثلاً: شنبه ۷ شهریور ۱۴۰۵
 *
 * اجزا دستی کنار هم چیده می‌شوند و از `format` آماده استفاده نمی‌شود:
 * ICU برای تقویم فارسی ترتیب «۱۴۰۵ شهریور ۷, شنبه» می‌دهد که در فارسی
 * غلط خوانده می‌شود. با formatToParts خودِ اعداد و نام ماه درست‌اند و فقط
 * چیدمانشان را ما تعیین می‌کنیم.
 */
export function formatJalali(date: Date): string {
  const parts = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${get("weekday")} ${get("day")} ${get("month")} ${get("year")}`.trim();
}

/** تاریخ میلادی، مثلاً: Friday, August 29, 2026 */
export function formatGregorian(date: Date): string {
  return new Intl.DateTimeFormat("en-US-u-ca-gregory", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * یک تکه متن را از جهتِ متنِ اطرافش جدا می‌کند.
 *
 * U+2068 (FSI) تا U+2069 (PDI): هرچه داخلشان باشد جهتش را از اولین حرفِ
 * خودش می‌گیرد، نه از پاراگراف. بدون این، پرانتزها — که کاراکترِ خنثی‌اند —
 * در متن راست‌به‌چپ آینه می‌شوند و تاریخ میلادی این‌طور درمی‌آید:
 * «۷ شهریور ۱۴۰۵ (Saturday,» و «August 29, 2026)». با ایزوله کردنِ کلِ
 * گروهِ پرانتزدار، پرانتز درست دور همان تکه می‌نشیند.
 */
function isolate(text: string): string {
  return `⁨${text}⁩`;
}

/**
 * تاریخ به هر دو تقویم. تقویم آشنای زبانِ صفحه اول می‌آید و آن یکی داخل
 * پرانتز. اگر ورودی نامعتبر باشد خودش را برمی‌گرداند تا چیزی گم نشود.
 */
export function formatDualDate(value: string, locale: Locale): string {
  const date = parseDay(value);
  if (!date) return value;
  const jalali = formatJalali(date);
  const gregorian = formatGregorian(date);
  return locale === "fa"
    ? `${jalali} ${isolate(`(${gregorian})`)}`
    : `${gregorian} ${isolate(`(${jalali})`)}`;
}

/** ساعت با ارقام همان زبان: ۱۸:۳۰ یا 6:30 PM */
export function formatTime(value: string, locale: Locale): string {
  if (!value) return "";
  const [h, m] = value.split(":");
  const hour = Number(h);
  const minute = Number(m);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;

  const date = new Date(2000, 0, 1, hour, minute);

  // فارسی ۲۴ساعته و دو رقمی («۰۹:۰۵» نه «۹:۰۵»)، انگلیسی ۱۲ساعته با AM/PM
  return locale === "fa"
    ? new Intl.DateTimeFormat("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date)
    : new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
}

/** جوابی که برای سؤال «روز و ساعت» ذخیره می‌شود — با هر دو تقویم */
export function formatDateTimeAnswer(
  day: string,
  time: string,
  locale: Locale
): string {
  const t = STRINGS[locale];
  return `${formatDualDate(day, locale)} — ${t.atTime} ${formatTime(time, locale)}`;
}

/**
 * تاریخ کامل (روز و ساعت) برای پنل ادمین، همیشه هر دو تقویم.
 * برای createdAt و updatedAt که Date کامل‌اند استفاده می‌شود.
 */
export function formatDualDateTime(date: Date): string {
  const jalali = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
  const gregorian = new Intl.DateTimeFormat("en-US-u-ca-gregory", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
  // پنل ادمین راست‌به‌چپ است، پس تکهٔ لاتین باید ایزوله شود
  return `${jalali} — ${isolate(gregorian)}`;
}

/** فقط تاریخ (بدون ساعت) به هر دو تقویم، برای پنل ادمین */
export function formatDualDateOnly(date: Date): string {
  const jalali = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    dateStyle: "medium",
  }).format(date);
  const gregorian = new Intl.DateTimeFormat("en-US-u-ca-gregory", {
    dateStyle: "medium",
  }).format(date);
  return `${jalali} — ${isolate(gregorian)}`;
}

// ──────────────────────────── متن‌های صفحهٔ دعوت ────────────────────────────

type Strings = {
  /** «سارا عزیز، علی برایت نوشته:» */
  intro: (recipient: string, sender: string) => string;
  yes: string;
  no: string;
  taunts: string[];
  whichDay: string;
  whichTime: string;
  atTime: string;
  next: string;
  finish: string;
  previousQuestion: string;
  bothCalendars: string;
  doneTitle: string;
  doneSubtitle: (recipient: string) => string;
  saving: string;
  saveError: string;
  notified: (sender: string) => string;
  empty: string;
};

export const STRINGS: Record<Locale, Strings> = {
  fa: {
    intro: (recipient, sender) => `${recipient} عزیز، ${sender} برایت نوشته:`,
    yes: "بله",
    no: "نه",
    taunts: [
      "بگیرش اگه می‌تونی 😄",
      "این دکمه امروز حسابی سرحاله…",
      "انگار «نه» جواب نیست.",
      "باشه باشه، «بله» رو بزن دیگه ☺",
      "قسمت نیست انگار!",
    ],
    whichDay: "چه روزی؟",
    whichTime: "چه ساعتی؟",
    atTime: "ساعت",
    next: "بعدی",
    finish: "تمام!",
    previousQuestion: "‹ سؤال قبلی",
    bothCalendars: "شمسی و میلادی",
    doneTitle: "قرارمون شد!",
    doneSubtitle: (recipient) => `${recipient} جان، این‌ها انتخاب‌های خودت بود:`,
    saving: "در حال ثبت…",
    saveError: "جواب‌هایت ثبت نشد. اینترنت را چک کن و دوباره امتحان کن.",
    notified: (sender) => `${sender} خبردار شد ✓`,
    empty: "—",
  },
  en: {
    intro: (recipient, sender) => `Dear ${recipient}, ${sender} wrote you:`,
    yes: "Yes",
    no: "No",
    taunts: [
      "Catch it if you can 😄",
      "That button is feeling lively today…",
      "Looks like “no” isn’t an option.",
      "Fine, fine — just press “Yes” ☺",
      "Not meant to be, apparently!",
    ],
    whichDay: "Which day?",
    whichTime: "What time?",
    atTime: "at",
    next: "Next",
    finish: "Done!",
    previousQuestion: "‹ Previous question",
    bothCalendars: "Jalali and Gregorian",
    doneTitle: "It’s a date!",
    doneSubtitle: (recipient) => `${recipient}, here’s what you picked:`,
    saving: "Saving…",
    saveError: "Your answers weren’t saved. Check your connection and try again.",
    notified: (sender) => `${sender} has been notified ✓`,
    empty: "—",
  },
};
