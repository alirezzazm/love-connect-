import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // خروجی standalone: یک سرور خودکفا در .next/standalone که برای اجرا روی
  // سرور به node_modules کامل نیاز ندارد.
  output: "standalone",

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
