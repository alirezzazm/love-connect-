"use client";

import { useMemo, useRef, useState } from "react";
import RunawayNo from "@/components/RunawayNo";
import {
  DIRECTION,
  STRINGS,
  formatDateTimeAnswer,
  formatGregorian,
  formatJalali,
} from "@/lib/i18n";
import type { AnswerRecord, Locale, QuestionType } from "@/lib/types";

export type FlowQuestion = {
  step: number;
  type: QuestionType;
  prompt: string;
  options: string[];
};

export type FlowInvite = {
  slug: string;
  recipientName: string;
  senderName: string;
  locale: Locale;
  headline: string;
  closingNote: string;
  questions: FlowQuestion[];
};

export default function InviteFlow({ invite }: { invite: FlowInvite }) {
  const t = STRINGS[invite.locale];
  const dir = DIRECTION[invite.locale];
  const cardRef = useRef<HTMLDivElement>(null);
  /**
   * زمان آخرین جاخالیِ دکمهٔ «نه». چون «نه» کنار «بله» می‌ماند، وقتی کنار
   * می‌کشد ممکن است همان کلیک روی «بله» بنشیند. کلیک‌های بلافاصله بعد از
   * جاخالی نادیده گرفته می‌شوند تا «بله» فقط عمدی زده شود.
   */
  const lastDodgeAt = useRef(0);

  const [stage, setStage] = useState<"ask" | "questions" | "done">("ask");
  const [index, setIndex] = useState(0);
  const [dodges, setDodges] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const question = invite.questions[index];
  const taunt =
    dodges > 0 ? t.taunts[Math.min(dodges - 1, t.taunts.length - 1)] : "";

  // هر بار که دکمهٔ «نه» فرار می‌کند، «بله» کمی بزرگ‌تر می‌شود
  const yesScale = Math.min(1 + dodges * 0.06, 1.5);

  const summary: AnswerRecord[] = useMemo(
    () =>
      invite.questions.map((q) => ({
        step: q.step,
        prompt: q.prompt,
        answer: answers[q.step] ?? "",
      })),
    [invite.questions, answers]
  );

  const submit = async (finalAnswers: AnswerRecord[]) => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/d/${invite.slug}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers, dodges }),
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      setSaveError(t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const answerAndAdvance = (value: string) => {
    const next = { ...answers, [question.step]: value };
    setAnswers(next);

    if (index + 1 < invite.questions.length) {
      setIndex(index + 1);
      return;
    }

    const finalAnswers: AnswerRecord[] = invite.questions.map((q) => ({
      step: q.step,
      prompt: q.prompt,
      answer: next[q.step] ?? "",
    }));
    setStage("done");
    void submit(finalAnswers);
  };

  const card =
    "w-full max-w-lg rounded-3xl border border-white/12 bg-card/70 p-7 shadow-2xl backdrop-blur";

  if (stage === "ask") {
    return (
      <div
        dir={dir}
        lang={invite.locale}
        className="grid min-h-dvh place-items-center px-5 py-10"
      >
        <div
          ref={cardRef}
          className={`${card} animate-pop-in relative overflow-hidden text-center`}
        >
          <p className="text-sm text-white/55">
            {t.intro(invite.recipientName, invite.senderName)}
          </p>
          <h1 className="mt-4 text-3xl font-black leading-relaxed sm:text-4xl">
            {invite.headline}
          </h1>

          <p className="mt-4 h-6 text-sm text-blush">{taunt}</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (Date.now() - lastDodgeAt.current < 350) return;
                setStage("questions");
              }}
              className="rounded-full bg-gradient-to-br from-blush to-blush-deep px-8 py-3.5 text-lg font-bold text-white shadow-lg shadow-blush/30 transition-transform"
              style={{ transform: `scale(${yesScale})` }}
            >
              {t.yes}
            </button>

            <RunawayNo
              label={t.no}
              boundsRef={cardRef}
              onDodge={() => {
                lastDodgeAt.current = Date.now();
                setDodges((d) => d + 1);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (stage === "questions" && question) {
    const isLast = index + 1 === invite.questions.length;

    return (
      <div
        dir={dir}
        lang={invite.locale}
        className="grid min-h-dvh place-items-center px-5 py-10"
      >
        <div key={question.step} className={`${card} animate-pop-in`}>
          <div className="mb-5 flex items-center gap-2">
            {invite.questions.map((q, i) => (
              <span
                key={q.step}
                className={`h-1.5 flex-1 rounded-full ${
                  i <= index ? "bg-blush" : "bg-white/15"
                }`}
              />
            ))}
          </div>

          <h2 className="text-2xl font-black">{question.prompt}</h2>

          {question.type === "choice" ? (
            <ul className="mt-6 flex flex-col gap-3">
              {question.options.map((option) => (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => answerAndAdvance(option)}
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-start text-base transition hover:border-blush hover:bg-blush/15"
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm text-white/70">{t.whichDay}</span>
                <input
                  type="date"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  // انتخابگر خودِ مرورگر میلادی است. برای اینکه کاربر فارسی
                  // هم بداند چه روزی را زده، تاریخ انتخاب‌شده پایینش به هر
                  // دو تقویم نشان داده می‌شود.
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 outline-none focus:border-blush"
                  dir="ltr"
                />
              </label>

              {day && <DualDatePreview day={day} locale={invite.locale} />}

              <label className="flex flex-col gap-2">
                <span className="text-sm text-white/70">{t.whichTime}</span>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 outline-none focus:border-blush"
                  dir="ltr"
                />
              </label>
              <button
                type="button"
                disabled={!day || !time}
                onClick={() =>
                  answerAndAdvance(
                    formatDateTimeAnswer(day, time, invite.locale)
                  )
                }
                className="rounded-full bg-gradient-to-br from-blush to-blush-deep py-3.5 font-bold text-white disabled:opacity-40"
              >
                {isLast ? t.finish : t.next}
              </button>
            </div>
          )}

          {index > 0 && (
            <button
              type="button"
              onClick={() => setIndex(index - 1)}
              className="mt-5 text-sm text-white/45 hover:text-white/70"
            >
              {t.previousQuestion}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      dir={dir}
      lang={invite.locale}
      className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-10"
    >
      <Hearts />
      <div className={`${card} animate-pop-in relative z-10 text-center`}>
        <p className="text-5xl">🌹</p>
        <h2 className="mt-4 text-3xl font-black text-blush">{t.doneTitle}</h2>
        <p className="mt-2 text-sm text-white/65">
          {t.doneSubtitle(invite.recipientName)}
        </p>

        <dl className="mt-6 flex flex-col gap-3 text-start">
          {summary.map((row) => (
            <div
              key={row.step}
              className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3"
            >
              <dt className="text-xs text-white/50">{row.prompt}</dt>
              <dd className="mt-1 font-bold">{row.answer || t.empty}</dd>
            </div>
          ))}
        </dl>

        {invite.closingNote && (
          <p className="mt-6 whitespace-pre-line text-base leading-7 text-white/85">
            {invite.closingNote}
          </p>
        )}

        <p className="mt-6 text-xs text-white/40">
          {saving ? t.saving : saveError ? saveError : t.notified(invite.senderName)}
        </p>
      </div>
    </div>
  );
}

/**
 * تاریخ انتخاب‌شده را هم‌زمان به شمسی و میلادی نشان می‌دهد.
 *
 * انتخابگر `<input type="date">` تقویم بومی مرورگر است و همیشه میلادی
 * نشان می‌دهد؛ نمی‌شود آن را شمسی کرد. به‌جای ساختن یک تقویم دست‌ساز که
 * دسترسی‌پذیری و پشتیبانی موبایلِ انتخابگر بومی را از دست بدهد، همان
 * انتخابگر می‌ماند و ترجمهٔ زندهٔ تاریخ زیرش نشان داده می‌شود.
 */
function DualDatePreview({ day, locale }: { day: string; locale: Locale }) {
  const date = new Date(`${day}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  const rows: Array<[string, string]> =
    locale === "fa"
      ? [
          ["شمسی", formatJalali(date)],
          ["میلادی", formatGregorian(date)],
        ]
      : [
          ["Gregorian", formatGregorian(date)],
          ["Jalali", formatJalali(date)],
        ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-3">
          <span className="text-xs text-white/45">{label}</span>
          <span className="text-sm font-bold">{value}</span>
        </div>
      ))}
    </div>
  );
}

/** قلب‌های شناور صفحهٔ پایانی — فقط تزئینی */
function Hearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 6}s`,
        duration: `${6 + Math.random() * 5}s`,
        size: `${14 + Math.random() * 22}px`,
      })),
    []
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heart-rise absolute bottom-0"
          style={{
            left: h.left,
            fontSize: h.size,
            animationDelay: h.delay,
            animationDuration: h.duration,
          }}
        >
          ❤
        </span>
      ))}
    </div>
  );
}
