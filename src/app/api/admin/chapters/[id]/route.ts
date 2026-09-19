import { NextRequest, NextResponse } from "next/server";
import { updateChapter, deleteChapter } from "@/lib/chapters";
import { requireAdmin } from "@/lib/auth";

const VALID_CATEGORIES = ["ielts", "sop", "visa", "scholarship", "interview"] as const;
type Category = (typeof VALID_CATEGORIES)[number];

type UpdateInput = {
  code?: string;
  chapterNumber?: number;
  titleBn?: string;
  titleEn?: string;
  descriptionBn?: string;
  descriptionEn?: string;
  duration?: string;
  videoId?: string;
  category?: Category;
  isActive?: boolean;
  sortOrder?: number;
};

/* PUT /api/admin/chapters/[id] — update a chapter */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const input = (await request.json().catch(() => ({}))) as UpdateInput;
    const result = await updateChapter(id, input);
    if (!result.ok) {
      const status =
        result.reason === "readonly"
          ? 405
          : result.reason === "notfound"
          ? 404
          : result.reason === "duplicate"
          ? 409
          : 400;
      return NextResponse.json({ ok: false, error: result.error }, { status });
    }
    return NextResponse.json({ ok: true, chapter: result.chapter });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}

/* DELETE /api/admin/chapters/[id] — delete a chapter */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const result = await deleteChapter(id);
    if (!result.ok) {
      const status =
        result.reason === "readonly" ? 405 : result.reason === "notfound" ? 404 : 400;
      return NextResponse.json({ ok: false, error: result.error }, { status });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
