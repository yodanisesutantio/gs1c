import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "gta_sa_access";
const SESSION_DURATION = 60 * 60 * 24;

function sign(expiresAt: number) {
  const secret = process.env.APP_SESSION_SECRET;

  if (!secret) {
    throw new Error("APP_SESSION_SECRET is not configured.");
  }

  return createHmac("sha256", secret)
    .update(`${process.env.APP_ACCESS_USERNAME}:${expiresAt}`)
    .digest("hex");
}

export function createSessionToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION;

  return `${expiresAt}.${sign(expiresAt)}`;
}

export function isValidSessionToken(token?: string) {
  if (!token || !process.env.APP_ACCESS_USERNAME) return false;

  const [expiry, signature, ...extra] = token.split(".");
  if (!expiry || !signature || extra.length) return false;

  const expiresAt = Number(expiry);

  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  try {
    const expected = Buffer.from(sign(expiresAt), "hex");
    const actual = Buffer.from(signature, "hex");

    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  } catch {
    return false;
  }
}

export async function hasAccess() {
  const cookieStore = await cookies();

  return isValidSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}
