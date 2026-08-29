import Link from "next/link";
import { db } from "@/lib/db";
import { isLocale } from "@/lib/i18n";
import InviteRow from "./InviteRow";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const invites = await db.invite.findMany({
    orderBy: { createdAt: "desc" },
    include: { response: true, _count: { select: { questions: true } } },
  });

  const answered = invites.filter((i) => i.response).length;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3 text-sm text-white/60">
          <span className="rounded-full border border-white/12 px-4 py-1.5">
            {invites.length} دعوت
          </span>
          <span className="rounded-full border border-white/12 px-4 py-1.5">
            {answered} جواب گرفته
          </span>
        </div>
        <Link
          href="/admin/new"
          className="rounded-full bg-gradient-to-br from-blush to-blush-deep px-6 py-2.5 text-sm font-bold text-white"
        >
          + دعوت تازه
        </Link>
      </div>

      {invites.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center">
          <p className="text-lg font-bold">هنوز دعوتی نساخته‌ای</p>
          <p className="mt-2 text-sm text-white/60">
            اولین دعوت را بساز و لینکش را بفرست.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {invites.map((invite) => (
            <InviteRow
              key={invite.id}
              invite={{
                id: invite.id,
                slug: invite.slug,
                recipientName: invite.recipientName,
                locale: isLocale(invite.locale) ? invite.locale : "fa",
                active: invite.active,
                views: invite.views,
                createdAt: invite.createdAt.toISOString(),
                questionCount: invite._count.questions,
                answered: Boolean(invite.response),
              }}
            />
          ))}
        </ul>
      )}
    </>
  );
}
