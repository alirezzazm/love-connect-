import type { Metadata, Viewport } from "next";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "لاو کانکت | آشنایی و دوستیابی",
  description:
    "اپلیکیشن آشنایی و دوستیابی — پروفایل بساز، پروفایل‌ها را ورق بزن، مچ شو و گفتگو کن.",
};

export const viewport: Viewport = {
  themeColor: "#12040f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
      </head>
      <body className="min-h-dvh">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
          <main className="flex-1 pb-24">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
