import { NextResponse } from "next/server";
import { canWriteChapters } from "@/lib/chapters";

/**
 * Tells the admin dashboard whether chapter edits are allowed in the
 * current runtime. Used to render the "edit data/chapters.json + git push"
 * hint in production (Vercel's read-only filesystem).
 *
 * Public (no auth) — this only reveals a boolean, nothing sensitive.
 */
export async function GET() {
  return NextResponse.json({
    canWrite: canWriteChapters(),
    environment: process.env.VERCEL ? "vercel" : process.env.NODE_ENV,
  });
}
