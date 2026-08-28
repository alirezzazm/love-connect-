import type { Profile } from "@/lib/types";

/**
 * به‌جای عکس واقعی، یک گرادیان با حرف اول نام. این‌طور پروژه به هیچ
 * فایل یا سرویس بیرونی وابسته نیست و آفلاین هم درست کار می‌کند.
 */
export default function Avatar({
  profile,
  size = 44,
  className = "",
}: {
  profile: Pick<Profile, "name" | "colors">;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-bold text-white shadow-inner ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `linear-gradient(135deg, ${profile.colors[0]}, ${profile.colors[1]})`,
      }}
      aria-hidden
    >
      {profile.name.slice(0, 1)}
    </span>
  );
}
