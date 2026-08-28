import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // خروجی standalone: یک سرور خودکفا در .next/standalone که برای اجرا روی
  // سرور به node_modules کامل نیاز ندارد.
  output: "standalone",

  // ریشهٔ ردیابی را به خودِ این پوشه میخ می‌کنیم. اگر این نباشد، Next ریشه را
  // از روی نزدیک‌ترین والدی که package.json یا lockfile دارد حدس می‌زند — و
  // چون این اپ داخل یک ریپوی دیگر نشسته، خروجی به‌شکل
  // .next/standalone/<نام-پوشه>/server.js تو در تو می‌شود و systemd پیدایش
  // نمی‌کند. با این تنظیم همیشه .next/standalone/server.js است.
  outputFileTracingRoot: path.resolve(__dirname),

  // موتور کوئری Prisma به‌صورت خودکار ردیابی نمی‌شود؛ صریح اضافه‌اش می‌کنیم
  // وگرنه روی سرور با خطای "Query engine library not found" بالا نمی‌آید.
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/.prisma/client/**",
      "./prisma/schema.prisma",
    ],
  },
};

export default nextConfig;
