import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * هم صفحه‌های /admin و هم API مدیریت دعوت‌ها نیاز به نشست معتبر دارند.
 * مسیرهای عمومی (صفحهٔ دعوت و ثبت جواب) اینجا نمی‌آیند.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (pathname === "/admin/login") {
    return session
      ? NextResponse.redirect(new URL("/admin", request.url))
      : NextResponse.next();
  }

  if (!session) {
    // برای API پاسخ ۴۰۱ می‌دهیم، نه ریدایرکت به صفحهٔ ورود
    if (isApi) {
      return NextResponse.json(
        { error: "برای این کار باید وارد شوی." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/invites", "/api/invites/:path*"],
};
