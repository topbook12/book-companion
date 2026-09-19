import { NextRequest, NextResponse } from "next/server";
import { listActiveChapters, findChapterByCode } from "@/lib/chapters";

/**
 * Code → chapter unlock lookup. Reads from data/chapters.json (portable,
 * git-tracked, serverless-safe). Logs are skipped in production because
 * the serverless filesystem is read-only — we only log in local dev via
 * console (best-effort). Returns bilingual error messages on failure.
 */
export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const body = await request.json().catch(() => ({}));
    const rawCode = typeof body?.code === "string" ? body.code : "";
    // Normalize: uppercase + strip ALL non-alphanumeric so both
    // "IFB-IELTS-01" and "IFBIELTS01" match the stored code.
    const code = rawCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

    // Small delay so the UI can show its premium loading state and slow
    // down brute-force attempts a little.
    await new Promise((res) => setTimeout(res, 650));

    if (!code) {
      // Best-effort log in local dev (ignored on Vercel — no writable FS).
      console.log("[unlock] empty code");
      return NextResponse.json(
        {
          ok: false,
          errorBn: "কোড লিখুন।",
          errorEn: "Please enter a code.",
        },
        { status: 400 }
      );
    }

    const match = await findChapterByCode(code);

    if (!match) {
      console.log(`[unlock] miss code=${code}`);
      return NextResponse.json(
        {
          ok: false,
          errorBn: "কোডটি সঠিক নয় — বইয়ের পৃষ্ঠা আবার দেখুন।",
          errorEn: "Incorrect code — please check your book again.",
        },
        { status: 404 }
      );
    }

    console.log(`[unlock] hit code=${code} chapter=${match.chapterNumber}`);

    return NextResponse.json({
      ok: true,
      chapter: {
        code: match.code,
        chapter: match.chapterNumber,
        titleBn: match.titleBn,
        titleEn: match.titleEn,
        descriptionBn: match.descriptionBn,
        descriptionEn: match.descriptionEn,
        duration: match.duration,
        videoId: match.videoId,
        category: match.category,
      },
      _ms: Date.now() - startedAt,
    });
  } catch (e) {
    console.error("[unlock] error", e);
    return NextResponse.json(
      {
        ok: false,
        errorBn: "কিছু একটা গন্ডগোল হয়েছে। আবার চেষ্টা করুন।",
        errorEn: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Lightweight preview for backwards compatibility.
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
