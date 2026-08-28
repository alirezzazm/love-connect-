"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { InviteInput, QuestionInput, QuestionType } from "@/lib/types";

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
