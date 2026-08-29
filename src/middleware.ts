import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * مبدأ عمومی سایت را برمی‌گرداند.
 *
 * پشت پروکسی، هم request.url و هم request.nextUrl میزبان و پورتِ داخلی را
 * دارند (۱۲۷.۰.۰.۱:۳۰۰۱). اگر ریدایرکت را از روی آن‌ها بسازیم، کاربر به
 * آدرسی پرت می‌شود که از بیرون اصلاً وجود ندارد.
 *
 * اولویت با NEXT_PUBLIC_SITE_URL است چون مقدارش را خودمان تنظیم می‌کنیم و
 * قابل دستکاری از بیرون نیست. اگر تنظیم نشده باشد، به هدرهای X-Forwarded-*
 * برمی‌گردیم — که همان مقداری‌اند که پروکسی می‌فرستد.
 */
function publicOrigin(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // مقدار نامعتبر: نادیده بگیر و سراغ هدرها برو
    }
  }

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") ?? "http";
    return `${proto}://${host}`;
  }

  return request.nextUrl.origin;
}

/**
 * هم صفحه‌های /admin و هم API مدیریت دعوت‌ها نیاز به نشست معتبر دارند.
 * مسیرهای عمومی (صفحهٔ دعوت و ثبت جواب) اینجا نمی‌آیند.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  const redirectTo = (path: string, next?: string) => {
    const url = new URL(path, publicOrigin(request));
    if (next) url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  };

  if (pathname === "/admin/login") {
    return session ? redirectTo("/admin") : NextResponse.next();
  }

  if (!session) {
    // برای API پاسخ ۴۰۱ می‌دهیم، نه ریدایرکت به صفحهٔ ورود
    if (isApi) {
      return NextResponse.json(
        { error: "برای این کار باید وارد شوی." },
        { status: 401 }
      );
    }
    return redirectTo("/admin/login", pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/invites", "/api/invites/:path*"],
};
