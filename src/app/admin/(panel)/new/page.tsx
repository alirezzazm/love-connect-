import Link from "next/link";
import InviteForm from "../InviteForm";
import {
  DEFAULT_CLOSING_NOTE,
  DEFAULT_HEADLINE,
  DEFAULT_QUESTIONS,
} from "@/lib/defaults";
import { DEFAULT_THEME } from "@/lib/themes";

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
          locale: "fa",
          theme: DEFAULT_THEME,
          headline: DEFAULT_HEADLINE.fa,
          closingNote: DEFAULT_CLOSING_NOTE.fa,
          active: true,
          questions: DEFAULT_QUESTIONS.fa,
        }}
      />
    </>
  );
}
