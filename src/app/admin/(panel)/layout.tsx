import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <header className="mb-8 flex items-center justify-between gap-4">
        <Link href="/admin" className="text-xl font-black">
          پنل <span className="text-blush">دعوت‌ها</span>
        </Link>
        <LogoutButton />
      </header>
      {children}
    </div>
  );
}
