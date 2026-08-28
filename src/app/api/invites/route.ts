import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { makeSlug } from "@/lib/defaults";
import { parseInviteInput } from "@/lib/validate";

/** ساخت دعوت تازه. مسیر /admin و /api/invites با middleware محافظت می‌شود. */
export async function POST(request: Request) {
  const parsed = parseInviteInput(await request.json().catch(() => null));
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { questions, ...invite } = parsed.data;

  // در بعید‌ترین حالت ممکن است slug تکراری دربیاید؛ چند بار تلاش می‌کنیم
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = makeSlug();
    const existing = await db.invite.findUnique({ where: { slug } });
    if (existing) continue;

    const created = await db.invite.create({
      data: {
        ...invite,
        slug,
        questions: {
          create: questions.map((q) => ({
            step: q.step,
            type: q.type,
            prompt: q.prompt,
            options: JSON.stringify(q.options),
          })),
        },
      },
    });
    return NextResponse.json({ id: created.id, slug: created.slug }, { status: 201 });
  }

  return NextResponse.json(
    { error: "ساخت لینک یکتا ممکن نشد، دوباره تلاش کن." },
    { status: 500 }
  );
}
