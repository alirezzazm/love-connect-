import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { AnswerRecord } from "@/lib/types";

type Params = { params: Promise<{ slug: string }> };

/**
 * ثبت جوابِ گیرندهٔ دعوت. این مسیر عمومی است، پس فقط چیزهایی را
 * می‌پذیرد که به سؤال‌های واقعیِ همین دعوت مربوط باشند.
 */
export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const body = await request.json().catch(() => null);

  const invite = await db.invite.findUnique({
    where: { slug },
    include: { questions: { orderBy: { step: "asc" } } },
  });

  if (!invite || !invite.active) {
    return NextResponse.json({ error: "این لینک فعال نیست." }, { status: 404 });
  }

  const incoming = Array.isArray(body?.answers) ? body.answers : [];
  const dodges = Number.isFinite(body?.dodges)
    ? Math.min(Math.max(Math.trunc(body.dodges), 0), 9999)
    : 0;

  // متن سؤال از دیتابیس خوانده می‌شود نه از ورودی کاربر، تا کسی نتواند
  // با دستکاری درخواست، متن دلخواه در پنل ادمین بنشاند.
  const answers: AnswerRecord[] = invite.questions.map((q) => {
    const match = incoming.find(
      (a: unknown) =>
        typeof a === "object" &&
        a !== null &&
        (a as { step?: unknown }).step === q.step
    ) as { answer?: unknown } | undefined;

    const raw = typeof match?.answer === "string" ? match.answer.trim() : "";
    return { step: q.step, prompt: q.prompt, answer: raw.slice(0, 200) };
  });

  await db.response.upsert({
    where: { inviteId: invite.id },
    create: { inviteId: invite.id, answers: JSON.stringify(answers), dodges },
    update: { answers: JSON.stringify(answers), dodges },
  });

  return NextResponse.json({ ok: true });
}
