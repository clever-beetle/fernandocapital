import crypto from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "fc_admin_session";
const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 hours
const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000;

// Login rate limiter config: max 5 failed attempts per 15-minute window
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

interface RateLimitEntry {
  failures: number;
  firstFailureAt: number;
  lockedUntil: number;
}

const loginAttemptsMap = new Map<string, RateLimitEntry>();

interface SessionPayload {
  role: "editor";
  iat: number;
  exp: number;
  jti: string;
}

/**
 * Constant-time string comparison using SHA-256 digests so neither string content
 * nor string length is leaked via timing side channels.
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const hashA = crypto.createHash("sha256").update(a, "utf8").digest();
  const hashB = crypto.createHash("sha256").update(b, "utf8").digest();
  const hashesMatch = crypto.timingSafeEqual(hashA, hashB);
  return hashesMatch && a.length === b.length;
}

/**
 * Checks whether server-side admin credentials are properly configured.
 * Fails closed if ADMIN_PASSWORD is missing or too short.
 */
export function isAdminAuthConfigured(): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  return Boolean(adminPassword && adminPassword.length >= 8);
}

/**
 * Derives the server-only HMAC signing key.
 * Uses SESSION_SECRET if configured (>= 16 chars), or derives an isolated signing key
 * from ADMIN_PASSWORD via scrypt. Returns null if unconfigured (fail-closed).
 */
function getSigningKey(): Buffer | null {
  if (!isAdminAuthConfigured()) {
    return null;
  }
  const explicitSecret = process.env.SESSION_SECRET?.trim();
  const baseSecret =
    explicitSecret && explicitSecret.length >= 16
      ? explicitSecret
      : process.env.ADMIN_PASSWORD!.trim();

  return crypto.scryptSync(baseSecret, "fernando-capital-admin-session-v1", 32);
}

/**
 * Verifies the admin password in constant time against process.env.ADMIN_PASSWORD.
 * Fails closed if ADMIN_PASSWORD is not configured.
 */
export function verifyAdminPassword(candidatePassword: string): boolean {
  if (!isAdminAuthConfigured() || !candidatePassword) {
    return false;
  }
  const configuredPassword = process.env.ADMIN_PASSWORD!.trim();
  return timingSafeEqualString(candidatePassword, configuredPassword);
}

/**
 * Creates a signed HMAC-SHA256 session token.
 */
export function createAdminSessionToken(): string | null {
  const key = getSigningKey();
  if (!key) return null;

  const now = Date.now();
  const payload: SessionPayload = {
    role: "editor",
    iat: now,
    exp: now + SESSION_TTL_MS,
    jti: crypto.randomBytes(16).toString("hex"),
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signatureB64 = crypto.createHmac("sha256", key).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signatureB64}`;
}

/**
 * Verifies an HMAC-SHA256 session token in constant time and checks expiration.
 */
export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== "string") return false;
  const key = getSigningKey();
  if (!key) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, signatureB64] = parts;
  if (!payloadB64 || !signatureB64) return false;

  const expectedSigB64 = crypto.createHmac("sha256", key).update(payloadB64).digest("base64url");
  if (!timingSafeEqualString(signatureB64, expectedSigB64)) {
    return false;
  }

  try {
    const rawJson = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(rawJson) as Partial<SessionPayload>;
    if (payload.role !== "editor") return false;
    if (typeof payload.exp !== "number" || Date.now() >= payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads and verifies the HTTP-only admin session cookie for the current request.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
    return verifyAdminSessionToken(sessionCookie?.value);
  } catch {
    return false;
  }
}

/**
 * Cookie options for setting the admin session cookie.
 */
export function getAdminCookieOptions() {
  const isSecure =
    process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

/**
 * Validates that a state-changing request originates from the same host (CSRF defense).
 */
export function verifySameOrigin(request: Request | NextRequest): boolean {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "none") {
    return false;
  }

  const host = (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""
  )
    .split(",")[0]
    .trim()
    .toLowerCase();

  if (!host) return false;

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const originHost = new URL(origin).host.toLowerCase();
      return originHost === host;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererHost = new URL(referer).host.toLowerCase();
      return refererHost === host;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Extracts a normalized client identifier for rate limiting.
 */
export function getClientRateLimitKey(request: Request | NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = (forwardedFor ? forwardedFor.split(",")[0] : realIp || "unknown").trim();
  return ip || "unknown";
}

function pruneExpiredRateLimits(now: number) {
  if (loginAttemptsMap.size < 200) return;
  for (const [key, entry] of loginAttemptsMap.entries()) {
    if (now > entry.lockedUntil && now - entry.firstFailureAt > LOGIN_WINDOW_MS) {
      loginAttemptsMap.delete(key);
    }
  }
}

/**
 * Checks whether a client key is currently rate-limited for login attempts.
 */
export function checkLoginRateLimit(clientKey: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  pruneExpiredRateLimits(now);

  const entry = loginAttemptsMap.get(clientKey);
  if (!entry) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.lockedUntil - now) / 1000)),
    };
  }

  if (now - entry.firstFailureAt > LOGIN_WINDOW_MS) {
    loginAttemptsMap.delete(clientKey);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Records a failed login attempt and locks the client key if threshold is reached.
 */
export function recordFailedLogin(clientKey: string): {
  locked: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const existing = loginAttemptsMap.get(clientKey);

  if (!existing || now - existing.firstFailureAt > LOGIN_WINDOW_MS) {
    loginAttemptsMap.set(clientKey, {
      failures: 1,
      firstFailureAt: now,
      lockedUntil: 0,
    });
    return { locked: false, retryAfterSeconds: 0 };
  }

  existing.failures += 1;
  if (existing.failures >= MAX_LOGIN_ATTEMPTS) {
    existing.lockedUntil = now + LOGIN_WINDOW_MS;
    loginAttemptsMap.set(clientKey, existing);
    return {
      locked: true,
      retryAfterSeconds: Math.ceil(LOGIN_WINDOW_MS / 1000),
    };
  }

  loginAttemptsMap.set(clientKey, existing);
  return { locked: false, retryAfterSeconds: 0 };
}

/**
 * Clears failed login history for a client key after a successful login.
 */
export function clearLoginFailures(clientKey: string): void {
  loginAttemptsMap.delete(clientKey);
}
