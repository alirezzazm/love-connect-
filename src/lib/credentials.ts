import { timingSafeEqual } from "node:crypto";

/** مقایسهٔ رشته‌ها بدون نشت زمانی، تا رمز با اندازه‌گیری زمان حدس زده نشود. */
function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** فقط در محیط Node (API route) صدا زده می‌شود، نه در middleware. */
export function checkCredentials(username: string, password: string) {
  const expectedUser = process.env.ADMIN_USERNAME ?? "";
  const expectedPass = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedUser || !expectedPass) return false;

  // هر دو مقایسه انجام می‌شوند تا زمان پاسخ به درستی نام کاربری وابسته نباشد
  const userOk = safeEqual(username, expectedUser);
  const passOk = safeEqual(password, expectedPass);
  return userOk && passOk;
}
