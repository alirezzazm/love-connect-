import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import InviteForm from "../InviteForm";
import DeleteInvite from "../DeleteInvite";
import ShareLink from "../ShareLink";
import type { AnswerRecord, QuestionType } from "@/lib/types";

export const dynamic = "force-dynamic";

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default async function InviteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const invite = await db.invite.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { step: "asc" } },
      response: true,
    },
  });

  if (!invite) notFound();

  const answers = invite.response
    ? parseJson<AnswerRecord[]>(invite.response.answers, [])
    : [];

  return (
    <>
      <Link href="/admin" className="text-sm text-white/50 hover:text-white/80">
        ‹ بازگشت به فهرست
      </Link>
      <h1 className="mb-1 mt-3 text-2xl font-black">
        دعوت {invite.recipientName}
      </h1>
      <p className="mb-6 text-xs text-white/45">
        {invite.views} بازدید — ساخته‌شده در{" "}
        {new Intl.DateTimeFormat("fa-IR", {
          dateStyle: "medium",
        }).format(invite.createdAt)}
      </p>

      <ShareLink slug={invite.slug} />

      <section className="mt-6 rounded-3xl border border-white/12 bg-white/5 p-5">
        <h2 className="font-bold">جوابی که داده</h2>
        {invite.response ? (
          <>
            <dl className="mt-4 flex flex-col gap-3">
              {answers.map((row) => (
                <div
                  key={row.step}
                  className="rounded-2xl border border-white/10 bg-ink-soft/60 px-4 py-3"
                >
                  <dt className="text-xs text-white/45">{row.prompt}</dt>
                  <dd className="mt-1 font-bold">{row.answer || "—"}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-white/45">
              {invite.response.dodges} بار سعی کرد «نه» را بزند 😄 — ثبت‌شده در{" "}
              {new Intl.DateTimeFormat("fa-IR", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(invite.response.updatedAt)}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-white/55">
            {invite.views > 0
              ? "لینک باز شده ولی هنوز تا آخر پیش نرفته."
              : "هنوز لینک را باز نکرده."}
          </p>
        )}
      </section>

      <h2 className="mb-4 mt-8 font-bold">ویرایش دعوت</h2>
      <InviteForm
        inviteId={invite.id}
        initial={{
          recipientName: invite.recipientName,
          senderName: invite.senderName,
          headline: invite.headline,
          closingNote: invite.closingNote,
          active: invite.active,
          questions: invite.questions.map((q) => ({
            step: q.step,
            type: q.type as QuestionType,
            prompt: q.prompt,
            options: parseJson<string[]>(q.options, []),
          })),
        }}
      />

      <DeleteInvite inviteId={invite.id} name={invite.recipientName} />
    </>
  );
}
