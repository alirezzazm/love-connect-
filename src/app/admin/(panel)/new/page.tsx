import Link from "next/link";
import InviteForm from "../InviteForm";
import {
  DEFAULT_CLOSING_NOTE,
  DEFAULT_HEADLINE,
  DEFAULT_QUESTIONS,
} from "@/lib/defaults";

export default function NewInvitePage() {
  return (
    <>
      <Link href="/admin" className="text-sm text-white/50 hover:text-white/80">
        ‹ بازگشت به فهرست
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-black">دعوت تازه</h1>

      <InviteForm
        initial={{
          recipientName: "",
          senderName: "",
          headline: DEFAULT_HEADLINE,
          closingNote: DEFAULT_CLOSING_NOTE,
          active: true,
          questions: DEFAULT_QUESTIONS,
        }}
      />
    </>
  );
}
