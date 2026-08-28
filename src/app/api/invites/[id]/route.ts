import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseInviteInput } from "@/lib/validate";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const parsed = parseInviteInput(await request.json().catch(() => null));
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { questions, ...invite } = parsed.data;

  const existing = await db.invite.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "این دعوت پیدا نشد." }, { status: 404 });
  }

  // سؤال‌ها به‌جای به‌روزرسانی تک‌تک، یک‌جا جایگزین می‌شوند تا ترتیب و
  // حذف و اضافه بدون حالت‌های لبه‌ای مدیریت شود.
  await db.$transaction([
    db.question.deleteMany({ where: { inviteId: id } }),
    db.invite.update({
      where: { id },
      data: {
        ...invite,
        questions: {
          create: questions.map((q) => ({
            step: q.step,
            type: q.type,
            prompt: q.prompt,
            options: JSON.stringify(q.options),
          })),
        },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const existing = await db.invite.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "این دعوت پیدا نشد." }, { status: 404 });
  }
  // پاک شدن سؤال‌ها و جواب با onDelete: Cascade خودکار انجام می‌شود
  await db.invite.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
