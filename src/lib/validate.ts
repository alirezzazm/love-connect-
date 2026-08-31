import { isLocale } from "./i18n";
import { DEFAULT_THEME, isThemeId } from "./themes";
import type { InviteInput, QuestionInput, QuestionType } from "./types";

const TYPES: QuestionType[] = ["choice", "datetime"];

function str(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

/**
 * ورودی فرم دعوت را تمیز و اعتبارسنجی می‌کند.
 * یا دادهٔ سالم برمی‌گرداند یا پیام خطای فارسی.
 */
export function parseInviteInput(
  raw: unknown
): { ok: true; data: InviteInput } | { ok: false; error: string } {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "دادهٔ ارسالی نامعتبر است." };
  }
  const body = raw as Record<string, unknown>;

  const recipientName = str(body.recipientName);
  if (!recipientName) return { ok: false, error: "اسم دعوت‌شونده را بنویس." };
  if (recipientName.length > 60)
    return { ok: false, error: "اسم دعوت‌شونده خیلی بلند است." };

  const senderName = str(body.senderName);
  if (!senderName) return { ok: false, error: "اسم خودت را بنویس." };
  if (senderName.length > 60) return { ok: false, error: "اسم خیلی بلند است." };

  // زبان از فهرست بسته انتخاب می‌شود، نه از ورودی خام: این مقدار مستقیم در
  // dir و lang صفحه می‌نشیند و نباید هر رشته‌ای بتواند آنجا بنشیند.
  if (body.locale !== undefined && !isLocale(body.locale)) {
    return { ok: false, error: "زبان انتخاب‌شده معتبر نیست." };
  }
  const locale = isLocale(body.locale) ? body.locale : "fa";

  // تم هم مثل زبان از فهرست بسته می‌آید: رنگ‌هایش مستقیم داخل style صفحه
  // می‌نشینند، پس نباید هر رشته‌ای بتواند آنجا برود.
  if (body.theme !== undefined && !isThemeId(body.theme)) {
    return { ok: false, error: "تم انتخاب‌شده معتبر نیست." };
  }
  const theme = isThemeId(body.theme) ? body.theme : DEFAULT_THEME;

  const headline = str(body.headline);
  if (!headline) return { ok: false, error: "متن سؤال اول را بنویس." };
  if (headline.length > 200)
    return { ok: false, error: "سؤال اول نباید بیشتر از ۲۰۰ کاراکتر باشد." };

  const closingNote = str(body.closingNote);
  if (closingNote.length > 400)
    return { ok: false, error: "پیام پایانی نباید بیشتر از ۴۰۰ کاراکتر باشد." };

  if (!Array.isArray(body.questions)) {
    return { ok: false, error: "فهرست سؤال‌ها نامعتبر است." };
  }
  if (body.questions.length === 0) {
    return { ok: false, error: "حداقل یک سؤال لازم است." };
  }
  if (body.questions.length > 10) {
    return { ok: false, error: "بیشتر از ۱۰ سؤال نمی‌شود اضافه کرد." };
  }

  const questions: QuestionInput[] = [];
  for (const [index, item] of body.questions.entries()) {
    const q = item as Record<string, unknown>;
    const prompt = str(q.prompt);
    if (!prompt) return { ok: false, error: `متن سؤال ${index + 1} خالی است.` };

    const type = TYPES.includes(q.type as QuestionType)
      ? (q.type as QuestionType)
      : "choice";

    const options =
      type === "choice"
        ? (Array.isArray(q.options) ? q.options : [])
            .map((o) => str(o))
            .filter(Boolean)
            .slice(0, 12)
        : [];

    if (type === "choice" && options.length < 2) {
      return {
        ok: false,
        error: `سؤال ${index + 1} حداقل به دو گزینه نیاز دارد.`,
      };
    }

    questions.push({ step: index, type, prompt, options });
  }

  return {
    ok: true,
    data: {
      recipientName,
      senderName,
      locale,
      theme,
      headline,
      closingNote,
      active: body.active !== false,
      questions,
    },
  };
}
