import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE_NAME = "pl_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 gün

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || !input) return false;
  return safeEqual(input, expected);
}

function createSessionValue(): string {
  const payload = `admin:${Date.now()}`;
  const payloadB64 = Buffer.from(payload).toString("base64url");
  return `${payloadB64}.${sign(payload)}`;
}

function verifySessionValue(value: string | undefined): boolean {
  if (!value || !secret()) return false;
  const [payloadB64, sig] = value.split(".");
  if (!payloadB64 || !sig) return false;

  const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  if (!safeEqual(sig, sign(payload))) return false;

  const match = payload.match(/^admin:(\d+)$/);
  if (!match) return false;
  const issuedAt = Number(match[1]);
  return Date.now() - issuedAt < MAX_AGE_SECONDS * 1000;
}

export async function createAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionValue(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

/** Admin sayfalarının/Server Action'larının başında çağrılır. Girişi yoksa yönlendirir. */
export async function requireAdmin(): Promise<void> {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    redirect("/admin/login");
  }
}
