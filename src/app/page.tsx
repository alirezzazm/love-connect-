import Link from "next/link";

const STEPS = [
  {
    title: "دعوت را بساز",
    body: "توی پنل ادمین اسم طرف، متن سؤال و گزینه‌ها را می‌نویسی.",
  },
  {
    title: "لینک را بفرست",
    body: "برای هر نفر یک لینک اختصاصی ساخته می‌شود.",
  },
  {
    title: "جوابش را ببین",
    body: "هرچه انتخاب کرده، توی پنل برایت ثبت می‌شود.",
  },
];

export default function HomePage() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        <p className="text-6xl">🌹</p>
        <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">
          دعوت به قرار
        </h1>
        <p className="mt-4 text-base leading-8 text-white/70">
          یک لینک کوچک بساز و بفرست. آن طرف خط، دکمهٔ «نه» اجازهٔ کلیک شدن
          نمی‌دهد — و بعد با هم تصمیم می‌گیرید کجا بروید، چه بخورید و کِی.
        </p>

        <ol className="mt-10 flex flex-col gap-3 text-start">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl border border-white/12 bg-white/5 p-4"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blush/20 text-sm font-bold text-blush">
                {i + 1}
              </span>
              <div>
                <p className="font-bold">{step.title}</p>
                <p className="mt-1 text-sm text-white/60">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <Link
          href="/admin"
          className="mt-10 inline-block rounded-full bg-gradient-to-br from-blush to-blush-deep px-8 py-3.5 font-bold text-white shadow-lg shadow-blush/25"
        >
          ورود به پنل
        </Link>
      </div>
    </main>
  );
}
