import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import InviteFlow, { type FlowInvite } from "./InviteFlow";
import type { QuestionType } from "@/lib/types";

// هر بازدید شمرده می‌شود، پس صفحه نباید کش شود
export const dynamic = "force-dynamic";

function parseOptions(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((o) => typeof o === "string") : [];
  } catch {
    return [];
  }
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const invite = await db.invite.findUnique({
    where: { slug },
    include: { questions: { orderBy: { step: "asc" } } },
  });

  if (!invite || !invite.active) notFound();

  await db.invite.update({
    where: { id: invite.id },
    data: { views: { increment: 1 } },
  });

  const data: FlowInvite = {
    slug: invite.slug,
    recipientName: invite.recipientName,
    senderName: invite.senderName,
    headline: invite.headline,
    closingNote: invite.closingNote,
    questions: invite.questions.map((q) => ({
      step: q.step,
      type: q.type as QuestionType,
      prompt: q.prompt,
      options: parseOptions(q.options),
    })),
  };

  return <InviteFlow invite={data} />;
}
