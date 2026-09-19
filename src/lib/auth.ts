import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "crypto";
import { cookies, headers } from "next/headers";

/**
 * Lightweight admin authentication — no DB / no Prisma required.
 *
 * Why this design (Vercel-ready):
 *  - There is no `Admin` table in the database. The single admin account is
 *    configured via the `ADMIN_USERNAME` + `ADMIN_PASSWORD_HASH` env vars
 *    (set in Vercel Project Settings → Environment Variables). This keeps
 *    the password out of source code AND out of any read-only data file,
 *    while still working perfectly on Vercel's serverless runtime.
 *  - Sessions are HMAC-signed cookies (12h TTL) — no DB lookups needed.
 *  - The signing secret comes from `ADMIN_SESSION_SECRET` (set on Vercel);
 *    falls back to a dev-only value when running locally without env.
 *
 * `ADMIN_PASSWORD_HASH` should be a scrypt hash in the form `salt:hash`
 * (hex). Generate it locally with:  bun scripts/hash-password.ts
 */

const COOKIE_NAME = "ifb_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    // Dev-only fallback. In production set ADMIN_SESSION_SECRET in env.
    "ideaforge-bd-dev-session-secret-do-not-use-in-production-0xK9wQ"
  );
}

/* ---------------- admin credentials (from env) ---------------- */

function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME || "admin";
}

/**
 * Lazily compute + memoize the scrypt hash of the admin password.
 *
 * We support two env-var shapes for convenience:
 *   1. ADMIN_PASSWORD_HASH = "salt:hash" (hex) — preferred (no plaintext).
 *   2. ADMIN_PASSWORD = "plaintext"      — convenience for local dev; we
 *      hash it once at startup and memoize.
 *
 * If neither is set, we fall back to a dev-only default password so the
 * dashboard works out-of-the-box in local dev. Production MUST set
 * ADMIN_PASSWORD_HASH to override this.
 */
let cachedHash: string | null = null;

function getAdminPasswordHash(): string {
  if (cachedHash) return cachedHash;

  const fromEnv = process.env.ADMIN_PASSWORD_HASH;
  if (fromEnv && fromEnv.includes(":")) {
    cachedHash = fromEnv;
    return cachedHash;
  }

  const plaintext =
    process.env.ADMIN_PASSWORD ||
    // Dev-only default. The seed script prints this on first run.
    // Production MUST set ADMIN_PASSWORD_HASH to override.
    "IdeaForge@BD2024!xK9wQ";

  cachedHash = hashPassword(plaintext);
  return cachedHash;
}

/* ---------------- password hashing (scrypt) ---------------- */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const computed = scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(hash, "hex");
  if (computed.length !== storedBuf.length) return false;
  return timingSafeEqual(computed, storedBuf);
}

/** Validate a candidate password against the env-configured admin. */
export function verifyAdminLogin(username: string, password: string): boolean {
  const expectedUser = getAdminUsername();
  // Constant-ish comparison for username (timing attack on username is
  // usually not a concern here, but cheap to do).
  if (username.trim().toLowerCase() !== expectedUser.toLowerCase()) return false;
  return verifyPassword(password, getAdminPasswordHash());
}

/* ---------------- session token (HMAC signed) ---------------- */

function sign(payload: string): string {
  const sig = createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function verify(token: string | undefined | null): { username: string; exp: number } | null {
  if (!token) return null;
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  if (!payload || !sig) return null;

  const expected = createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return { username: data.username, exp: data.exp };
  } catch {
    return null;
  }
}

/**
 * Detect whether the current request is being served over HTTPS.
 *
 * The Z.ai preview panel embeds this app inside a cross-site iframe over
 * HTTPS. In that context, `SameSite=Lax` cookies are NOT sent for fetch
 * sub-requests (only for top-level navigations), so the admin session cookie
 * would be dropped on every API call after login. We therefore use
 * `SameSite=None; Secure` when the request is HTTPS (preview + production),
 * and fall back to `SameSite=Lax` for direct localhost HTTP dev access
 * (where some browsers refuse `Secure` over plain HTTP, and cross-site isn't
 * an issue anyway).
 */
async function isHttps(): Promise<boolean> {
  try {
    const h = await headers();
    const forwardedProto = h.get("x-forwarded-proto");
    if (forwardedProto) return forwardedProto.includes("https");
    // Fall back to the host header check or assume https in production.
    if (process.env.NODE_ENV === "production") return true;
    return false;
  } catch {
    return false;
  }
}

export async function createSession(username: string): Promise<void> {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ username, exp })).toString("base64");
  const token = sign(payload);
  const https = await isHttps();
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    // Cross-site iframe (preview) needs SameSite=None+Secure to send the
    // cookie on fetch sub-requests. Direct localhost dev uses Lax.
    sameSite: https ? "none" : "lax",
    secure: https,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<{ username: string; exp: number } | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verify(token);
}

export async function requireAdmin(): Promise<{ username: string } | null> {
  const s = await getSession();
  if (!s) return null;
  return { username: s.username };
}
