import { NextRequest, NextResponse } from "next/server";
import { listChapters, createChapter } from "@/lib/chapters";
import { requireAdmin } from "@/lib/auth";

const VALID_CATEGORIES = ["ielts", "sop", "visa", "scholarship", "interview"] as const;
type Category = (typeof VALID_CATEGORIES)[number];

type ChapterInput = {
  code: string;
  chapterNumber?: number;
  titleBn: string;
  titleEn: string;
  descriptionBn?: string;
  descriptionEn?: string;
  duration?: string;
  videoId: string;
  category: Category;
  isActive?: boolean;
  sortOrder?: number;
};

/* GET /api/admin/chapters — list all chapters (admin only) */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const chapters = await listChapters();
  return NextResponse.json({ ok: true, chapters });
}

/* POST /api/admin/chapters — create a new chapter (admin only; local dev) */
export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const input = (await request.json().catch(() => ({}))) as ChapterInput;
    const result = await createChapter(input);
    if (!result.ok) {
      const status =
        result.reason === "readonly"
          ? 405 // Method Not Allowed (read-only filesystem)
          : result.reason === "duplicate"
          ? 409
          : 400;
      return NextResponse.json({ ok: false, error: result.error }, { status });
    }
    return NextResponse.json({ ok: true, chapter: result.chapter });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server error creating chapter." },
      { status: 500 }
    );
  }
}
