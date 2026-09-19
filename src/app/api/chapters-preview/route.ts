import { NextResponse } from "next/server";
import { listActiveChapters } from "@/lib/chapters";

/**
 * Public preview of all *active* chapters.
 * Returns ONLY safe metadata (number, titles, duration, category) — never the
 * code or video ID, so this list can be shown on the public page without leaking.
 */
export async function GET() {
  const chapters = await listActiveChapters();
  return NextResponse.json({
    chapters: chapters.map((c) => ({
      chapterNumber: c.chapterNumber,
      titleBn: c.titleBn,
      titleEn: c.titleEn,
      duration: c.duration,
      category: c.category,
    })),
  });
}
