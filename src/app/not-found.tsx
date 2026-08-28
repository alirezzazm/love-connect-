import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="text-5xl">💔</p>
        <h1 className="mt-4 text-2xl font-black">این لینک پیدا نشد</h1>
        <p className="mt-2 text-sm text-white/60">
          ممکن است آدرس اشتباه باشد یا دعوت غیرفعال شده باشد.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full border border-white/20 px-6 py-2 text-sm"
        >
          صفحهٔ اصلی
        </Link>
      </div>
    </div>
  );
}
