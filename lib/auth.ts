// Minimal password-only admin auth. There's a single shared password
// (ADMIN_PASSWORD in .env.local) — on success we set an httpOnly cookie
// containing a timestamp signed with HMAC-SHA256 (ADMIN_PASSWORD doubles as
// the signing secret). No session store or extra dependency needed: the
// signature can't be forged without the password, and it's checked with a
// timing-safe comparison.

import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_COOKIE_NAME = 'admin_session';
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

function sign(value: string): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('ADMIN_PASSWORD is not set');
  }
  return createHmac('sha256', secret).update(value).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(password, expected);
}

export function createSessionToken(): string {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const [issuedAt, signature] = token.split('.');
  if (!issuedAt || !signature) return false;

  let expected: string;
  try {
    expected = sign(issuedAt);
  } catch {
    return false;
  }

  if (!safeEqual(signature, expected)) return false;

  const age = (Date.now() - Number(issuedAt)) / 1000;
  return Number.isFinite(age) && age >= 0 && age < ADMIN_COOKIE_MAX_AGE;
}

// Works in Server Components, Server Actions and Route Handlers — all of
// them support reading cookies via next/headers.
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

// For admin pages: bounce to the login form when not signed in. Each page
// calls this itself (not just the layout), since layouts aren't re-run on
// client-side navigation between pages.
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }
}
