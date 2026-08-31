"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DEFAULT_CLOSING_NOTE,
  DEFAULT_HEADLINE,
  DEFAULT_QUESTIONS,
} from "@/lib/defaults";
import { LOCALES, LOCALE_LABEL } from "@/lib/i18n";
import { THEMES, THEME_IDS, resolveTheme } from "@/lib/themes";
import type {
  InviteInput,
  Locale,
  QuestionInput,
  QuestionType,
} from "@/lib/types";

const FIELD =
  "w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/35 focus:border-blush";

export default function InviteForm({
  initial,
  inviteId,
}: {
  initial: InviteInput;
  /** اگر داده شود یعنی ویرایش، وگرنه ساخت دعوت تازه */
  inviteId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<InviteInput>(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const patch = (changes: Partial<InviteInput>) =>
    setForm((f) => ({ ...f, ...changes }));

  /**
   * عوض کردن زبان دعوت.
   *
   * اگر متن‌ها هنوز دست‌نخوردهٔ پیش‌فرضِ زبان قبلی باشند، با پیش‌فرض‌های زبان
   * تازه جایگزین می‌شوند تا لازم نباشد دستی همه را ترجمه کنی. اما اگر چیزی
   * را خودت عوض کرده باشی، فقط زبان عوض می‌شود و نوشته‌هایت دست‌نخورده
   * می‌ماند — عوض کردن زبان نباید کار نوشتهٔ کسی را دور بریزد.
   */
  const switchLocale = (next: Locale) =>
    setForm((f) => {
      if (f.locale === next) return f;

      const untouched =
        f.headline === DEFAULT_HEADLINE[f.locale] &&
        f.closingNote === DEFAULT_CLOSING_NOTE[f.locale] &&
        JSON.stringify(f.questions) ===
          JSON.stringify(DEFAULT_QUESTIONS[f.locale]);

      if (!untouched) return { ...f, locale: next };

      return {
        ...f,
        locale: next,
        headline: DEFAULT_HEADLINE[next],
        closingNote: DEFAULT_CLOSING_NOTE[next],
        // کپی عمیق: آرایهٔ پیش‌فرض ماژول است و نباید با ویرایش فرم عوض شود
        questions: DEFAULT_QUESTIONS[next].map((q) => ({
          ...q,
          options: [...q.options],
        })),
      };
    });

  const patchQuestion = (index: number, changes: Partial<QuestionInput>) =>
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) =>
        i === index ? { ...q, ...changes } : q
      ),
    }));

  const addQuestion = () =>
    setForm((f) => ({
      ...f,
      questions: [
        ...f.questions,
        {
          step: f.questions.length,
          type: "choice" as QuestionType,
          prompt: "",
          options: ["", ""],
        },
      ],
    }));

  const removeQuestion = (index: number) =>
    setForm((f) => ({
      ...f,
      questions: f.questions
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, step: i })),
    }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    // شماره‌گذاری دوباره تا با ترتیب فعلی فرم بخواند
    const payload: InviteInput = {
      ...form,
      questions: form.questions.map((q, i) => ({ ...q, step: i })),
    };

    try {
      const res = await fetch(
        inviteId ? `/api/invites/${inviteId}` : "/api/invites",
        {
          method: inviteId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "ذخیره نشد.");
        return;
      }
      router.push(inviteId ? `/admin/${inviteId}` : "/admin");
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">اسم دعوت‌شونده</span>
          <input
            className={FIELD}
            value={form.recipientName}
            onChange={(e) => patch({ recipientName: e.target.value })}
            placeholder="مثلاً: سارا"
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">اسم خودت</span>
          <input
            className={FIELD}
            value={form.senderName}
            onChange={(e) => patch({ senderName: e.target.value })}
            required
          />
        </label>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-white/12 bg-white/5 p-4">
        <span className="text-sm text-white/70">زبان صفحهٔ دعوت</span>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => switchLocale(code)}
              aria-pressed={form.locale === code}
              className={`rounded-full border px-5 py-2 text-sm transition ${
                form.locale === code
                  ? "border-blush bg-blush/20 font-bold text-white"
                  : "border-white/15 text-white/60 hover:bg-white/10"
              }`}
            >
              {LOCALE_LABEL[code]}
            </button>
          ))}
        </div>
        <p className="text-xs leading-6 text-white/45">
          دکمه‌ها، جمله‌های دکمهٔ فراری و صفحهٔ پایانی به این زبان نشان داده
          می‌شوند و جهت صفحه هم خودکار عوض می‌شود. تاریخ همیشه به{" "}
          <b className="text-white/70">هر دو تقویم شمسی و میلادی</b> نمایش داده
          می‌شود. سؤال‌ها و متن‌های زیر را خودت به همان زبان بنویس — تا وقتی
          دست‌نخورده باشند، با عوض کردن زبان خودشان ترجمه می‌شوند.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/12 bg-white/5 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm text-white/70">تم صفحهٔ دعوت</span>
          <span className="text-xs text-white/40">
            انتخاب‌شده: {resolveTheme(form.theme).label[form.locale]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {THEME_IDS.map((id) => {
            const th = THEMES[id];
            const selected = form.theme === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => patch({ theme: id })}
                aria-pressed={selected}
                className={`flex flex-col gap-2 rounded-2xl border p-3 text-start transition ${
                  selected
                    ? "border-blush bg-blush/15"
                    : "border-white/12 hover:border-white/30 hover:bg-white/5"
                }`}
              >
                {/* پیش‌نمایش کوچک: همان رنگ‌هایی که طرف مقابل می‌بیند */}
                <span
                  className="flex h-12 items-center justify-center gap-1 rounded-xl"
                  style={{ background: th.background }}
                >
                  <span className="text-lg leading-none">{th.heroEmoji}</span>
                  <span
                    className="h-5 w-8 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${th.swatch[0]}, ${th.swatch[1]})`,
                    }}
                  />
                </span>
                <span className="flex items-center gap-2 text-xs">
                  <span
                    className={selected ? "font-bold text-white" : "text-white/70"}
                  >
                    {th.label[form.locale]}
                  </span>
                  {selected && <span className="text-blush">✓</span>}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs leading-6 text-white/45">
          تم فقط ظاهرِ صفحه‌ای است که <b className="text-white/70">طرف مقابل</b>{" "}
          می‌بیند: رنگ‌ها، شکل‌های شناور و ایموجی‌ها. پنل ادمین عوض نمی‌شود.
          بعد از ذخیره، با دکمهٔ «پیش‌نمایش» ببینش.
        </p>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-white/70">سؤال اول (با دکمهٔ فراری)</span>
        <input
          className={FIELD}
          value={form.headline}
          onChange={(e) => patch({ headline: e.target.value })}
          required
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-white/70">پیام پایانی</span>
        <textarea
          className={`${FIELD} min-h-24 resize-y leading-7`}
          value={form.closingNote}
          onChange={(e) => patch({ closingNote: e.target.value })}
        />
      </label>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/12 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <span className="font-bold">سؤال‌های بعدی</span>
          <button
            type="button"
            onClick={addQuestion}
            className="rounded-full border border-white/15 px-4 py-1.5 text-xs hover:bg-white/10"
          >
            + سؤال
          </button>
        </div>

        {form.questions.map((question, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-ink-soft/60 p-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/45">سؤال {index + 1}</span>
              <select
                value={question.type}
                onChange={(e) =>
                  patchQuestion(index, {
                    type: e.target.value as QuestionType,
                  })
                }
                className="rounded-full border border-white/15 bg-ink-soft px-3 py-1.5 text-xs outline-none"
              >
                <option value="choice">گزینه‌ای</option>
                <option value="datetime">روز و ساعت</option>
              </select>
              {form.questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="ms-auto text-xs text-rose-300/80 hover:text-rose-200"
                >
                  حذف
                </button>
              )}
            </div>

            <input
              className={FIELD}
              value={question.prompt}
              placeholder="متن سؤال"
              onChange={(e) => patchQuestion(index, { prompt: e.target.value })}
              required
            />

            {question.type === "choice" && (
              <div className="flex flex-col gap-2">
                {question.options.map((option, oi) => (
                  <div key={oi} className="flex gap-2">
                    <input
                      className={FIELD}
                      value={option}
                      placeholder={`گزینه ${oi + 1}`}
                      onChange={(e) =>
                        patchQuestion(index, {
                          options: question.options.map((o, i) =>
                            i === oi ? e.target.value : o
                          ),
                        })
                      }
                    />
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          patchQuestion(index, {
                            options: question.options.filter((_, i) => i !== oi),
                          })
                        }
                        className="rounded-2xl border border-white/15 px-3 text-xs text-white/50"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {question.options.length < 12 && (
                  <button
                    type="button"
                    onClick={() =>
                      patchQuestion(index, {
                        options: [...question.options, ""],
                      })
                    }
                    className="self-start text-xs text-blush hover:underline"
                  >
                    + گزینه
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => patch({ active: e.target.checked })}
          className="h-4 w-4 accent-[#ff5c8a]"
        />
        لینک فعال باشد
      </label>

      {error && (
        <p className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-gradient-to-br from-blush to-blush-deep py-3.5 font-bold text-white disabled:opacity-50"
      >
        {busy ? "…" : inviteId ? "ذخیرهٔ تغییرات" : "ساختن دعوت و گرفتن لینک"}
      </button>
    </form>
  );
}
