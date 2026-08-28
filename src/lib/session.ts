import { SignJWT, jwtVerify } from "jose";

/**
 * فقط jose — این فایل از middleware هم import می‌شود که روی Edge اجرا
 * می‌شود، پس نباید هیچ ماژول Node ای (مثل node:crypto) واردش شود.
 */

export const SESSION_COOKIE = "lc_admin";
export const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // یک هفته

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET تعریف نشده یا کوتاه‌تر از ۳۲ کاراکتر است. فایل .env را ببین."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(username: string) {
  return new SignJWT({ sub: username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
