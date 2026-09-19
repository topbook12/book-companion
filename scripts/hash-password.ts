/**
 * Helper: hash a password for the ADMIN_PASSWORD_HASH env var.
 *
 * Usage:
 *   bun scripts/hash-password.ts
 *   bun scripts/hash-password.ts "my-secret-password"
 *
 * Then copy the printed "salt:hash" string into Vercel → Project → Settings →
 * Environment Variables as ADMIN_PASSWORD_HASH. Also set ADMIN_USERNAME
 * (e.g. "admin") and ADMIN_SESSION_SECRET (a long random string).
 *
 * NEVER commit your real password or hash to git. The .env.local file is
 * already git-ignored.
 */
import { scryptSync, randomBytes } from "crypto";
import * as fs from "fs";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const arg = process.argv[2];
let password = arg ?? "";
if (!password) {
  // Interactive prompt via stdin.
  process.stdout.write("Enter admin password: ");
  const fd = process.stdin.fd;
  const buf = Buffer.alloc(1024);
  let n = 0;
  try {
    n = fs.readSync(fd, buf, 0, 1024, null);
  } catch {
    n = 0;
  }
  password = buf.toString("utf8", 0, n).replace(/\r?\n$/, "");
  process.stdout.write("\n");
}

if (!password) {
  console.error("No password provided. Pass it as an argument or via stdin.");
  process.exit(1);
}

const hash = hashPassword(password);
console.log("\n========================================");
console.log("  ADMIN_PASSWORD_HASH (copy this)");
console.log("========================================");
console.log(hash);
console.log("========================================");
console.log("Set the following env vars on Vercel:");
console.log("  ADMIN_USERNAME        = admin");
console.log("  ADMIN_PASSWORD_HASH   = <the value above>");
console.log("  ADMIN_SESSION_SECRET  = <any long random string>");
console.log("========================================\n");
