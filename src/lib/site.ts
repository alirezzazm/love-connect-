/** آدرس کامل یک دعوت، برای کپی کردن و فرستادن */
export function inviteUrl(slug: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/d/${slug}`;
}
