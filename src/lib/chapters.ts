import { promises as fs } from "fs";
import path from "path";

/**
 * Chapters data layer — a portable JSON-file adapter.
 *
 * Why JSON instead of Prisma/SQLite?
 *  - Vercel (and other serverless hosts) use ephemeral filesystems — a
 *    SQLite db file resets on cold starts and is not shared across
 *    serverless function instances.
 *  - The chapter list is tiny (≈ 8-20 rows) and changes rarely. Storing it
 *    as a JSON file in the repo makes it version-controlled and trivially
 *    portable.
 *
 * Behavior:
 *  - Reads from `data/chapters.json` (always works — the file is bundled).
 *  - Writes (create/update/delete) only succeed in local dev, where the
 *    filesystem is writable. In production (Vercel serverless), writes
 *    return `false` and the admin UI shows a "edit data/chapters.json +
 *    git push" hint instead. This is the trade-off for zero-DB simplicity
 *    and guaranteed persistence across deploys.
 */

export type Chapter = {
  id: string;
  code: string;
  chapterNumber: number;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  duration: string;
  videoId: string;
  category: "ielts" | "sop" | "visa" | "scholarship" | "interview";
  isActive: boolean;
  sortOrder: number;
};

type ChaptersFile = {
  _meta: { description?: string; version?: number; lastUpdated?: string };
  chapters: Chapter[];
};

const DATA_PATH = path.join(process.cwd(), "data", "chapters.json");

/**
 * Whether the current runtime allows writing to the data file.
 * On Vercel/serverless this is `false` (read-only FS).
 */
export function canWriteChapters(): boolean {
  // VERCEL env var is set by the Vercel platform on every serverless fn.
  // Also treat any production runtime as read-only to be safe.
  if (process.env.VERCEL) return false;
  if (process.env.READ_ONLY_DATA === "1") return false;
  return true;
}

/* ---------------- read ---------------- */

let cache: { data: ChaptersFile; mtime: number } | null = null;

async function readRaw(): Promise<ChaptersFile> {
  try {
    const stat = await fs.stat(DATA_PATH);
    const mtime = stat.mtimeMs;
    // Simple in-memory cache keyed on file mtime — refreshes if the file
    // changes (e.g. after a dashboard write or a git pull on the server).
    if (cache && cache.mtime === mtime) return cache.data;
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as ChaptersFile;
    cache = { data: parsed, mtime };
    return parsed;
  } catch (err) {
    // If the file is somehow missing/unreadable, return an empty set
    // instead of crashing — the public page can render an empty state.
    console.error("Failed to read data/chapters.json:", err);
    return { _meta: {}, chapters: [] };
  }
}

/** Invalidate the cache (call after writes). */
function bustCache() {
  cache = null;
}

export async function listChapters(): Promise<Chapter[]> {
  const { chapters } = await readRaw();
  return [...chapters].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listActiveChapters(): Promise<Chapter[]> {
  const all = await listChapters();
  return all.filter((c) => c.isActive);
}

export async function findChapterByCode(
  normalizedCode: string
): Promise<Chapter | null> {
  const all = await listActiveChapters();
  return (
    all.find((c) => c.code.replace(/[^A-Z0-9]/g, "") === normalizedCode) ?? null
  );
}

export async function getChapterById(id: string): Promise<Chapter | null> {
  const all = await listChapters();
  return all.find((c) => c.id === id) ?? null;
}

/* ---------------- write (local dev only) ---------------- */

async function writeRaw(next: ChaptersFile): Promise<void> {
  next._meta = {
    ...(next._meta || {}),
    lastUpdated: new Date().toISOString(),
  };
  const json = JSON.stringify(next, null, 2) + "\n";
  await fs.writeFile(DATA_PATH, json, "utf-8");
  bustCache();
}

function genId(): string {
  // Stable, URL-safe-ish id. Avoids pulling in `crypto.randomUUID`'s
  // polyfill concerns on serverless.
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `ch-${ts}${rnd}`;
}

function normalizeCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
}

const VALID_CATEGORIES = [
  "ielts",
  "sop",
  "visa",
  "scholarship",
  "interview",
] as const;
type Category = (typeof VALID_CATEGORIES)[number];

export type CreateInput = {
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

export type UpdateInput = Partial<CreateInput>;

/** Returns { ok, chapter?, error?, reason? } */
export async function createChapter(
  input: CreateInput
): Promise<
  | { ok: true; chapter: Chapter }
  | { ok: false; error: string; reason?: "readonly" | "duplicate" | "invalid" }
> {
  if (!canWriteChapters()) {
    return {
      ok: false,
      error:
        "প্রোডাকশনে অধ্যায় যোগ করা যায় না — data/chapters.json ফাইল এডিট করে গিট পুশ করুন।",
      reason: "readonly",
    };
  }
  const code = normalizeCode(input.code);
  if (code.length < 3) {
    return { ok: false, error: "কোড অন্তত ৩ অক্ষরের হতে হবে।", reason: "invalid" };
  }
  if (!input.titleBn?.trim() || !input.titleEn?.trim()) {
    return {
      ok: false,
      error: "বাংলা ও English শিরোনাম দিন।",
      reason: "invalid",
    };
  }
  if (!input.videoId?.trim()) {
    return { ok: false, error: "YouTube ভিডিও ID দিন।", reason: "invalid" };
  }
  if (!VALID_CATEGORIES.includes(input.category)) {
    return { ok: false, error: "category সঠিক নয়।", reason: "invalid" };
  }

  const { chapters } = await readRaw();
  if (chapters.some((c) => c.code === code)) {
    return {
      ok: false,
      error: "এই কোড ইতিমধ্যে ব্যবহৃত হচ্ছে। / Code already in use.",
      reason: "duplicate",
    };
  }

  const maxChapter = chapters.reduce(
    (m, c) => Math.max(m, c.chapterNumber),
    0
  );
  const chapterNumber = input.chapterNumber ?? maxChapter + 1;
  const sortOrder = input.sortOrder ?? chapterNumber;
  const chapter: Chapter = {
    id: genId(),
    code,
    chapterNumber,
    titleBn: input.titleBn.trim(),
    titleEn: input.titleEn.trim(),
    descriptionBn: input.descriptionBn?.trim() ?? "",
    descriptionEn: input.descriptionEn?.trim() ?? "",
    duration: input.duration?.trim() || "—",
    videoId: input.videoId.trim(),
    category: input.category,
    isActive: input.isActive ?? true,
    sortOrder,
  };
  chapters.push(chapter);
  await writeRaw({ _meta: (await readRaw())._meta, chapters });
  return { ok: true, chapter };
}

export async function updateChapter(
  id: string,
  patch: UpdateInput
): Promise<
  | { ok: true; chapter: Chapter }
  | { ok: false; error: string; reason?: "readonly" | "notfound" | "duplicate" | "invalid" }
> {
  if (!canWriteChapters()) {
    return {
      ok: false,
      error:
        "প্রোডাকশনে অধ্যায় পরিবর্তন করা যায় না — data/chapters.json এডিট করে গিট পুশ করুন।",
      reason: "readonly",
    };
  }
  const { chapters } = await readRaw();
  const idx = chapters.findIndex((c) => c.id === id);
  if (idx === -1) {
    return { ok: false, error: "Chapter not found.", reason: "notfound" };
  }
  const current = chapters[idx];

  // Apply patch with validation
  let next: Chapter = { ...current };
  if (patch.code !== undefined) {
    const newCode = normalizeCode(patch.code);
    if (newCode.length < 3) {
      return { ok: false, error: "কোড অন্তত ৩ অক্ষরের।", reason: "invalid" };
    }
    if (newCode !== current.code) {
      if (chapters.some((c) => c.code === newCode)) {
        return {
          ok: false,
          error: "এই কোড ইতিমধ্যে ব্যবহৃত হচ্ছে।",
          reason: "duplicate",
        };
      }
    }
    next.code = newCode;
  }
  if (patch.category !== undefined) {
    if (!VALID_CATEGORIES.includes(patch.category)) {
      return { ok: false, error: "category সঠিক নয়।", reason: "invalid" };
    }
    next.category = patch.category;
  }
  if (patch.titleBn !== undefined) next.titleBn = patch.titleBn.trim();
  if (patch.titleEn !== undefined) next.titleEn = patch.titleEn.trim();
  if (patch.descriptionBn !== undefined)
    next.descriptionBn = patch.descriptionBn.trim();
  if (patch.descriptionEn !== undefined)
    next.descriptionEn = patch.descriptionEn.trim();
  if (patch.duration !== undefined) next.duration = patch.duration.trim();
  if (patch.videoId !== undefined) next.videoId = patch.videoId.trim();
  if (patch.chapterNumber !== undefined) next.chapterNumber = patch.chapterNumber;
  if (patch.sortOrder !== undefined) next.sortOrder = patch.sortOrder;
  if (patch.isActive !== undefined) next.isActive = patch.isActive;

  chapters[idx] = next;
  await writeRaw({ _meta: (await readRaw())._meta, chapters });
  return { ok: true, chapter: next };
}

export async function deleteChapter(
  id: string
): Promise<{ ok: true } | { ok: false; error: string; reason?: "readonly" | "notfound" }> {
  if (!canWriteChapters()) {
    return {
      ok: false,
      error:
        "প্রোডাকশনে অধ্যায় মুছা যায় না — data/chapters.json এডিট করে গিট পুশ করুন।",
      reason: "readonly",
    };
  }
  const { chapters } = await readRaw();
  const idx = chapters.findIndex((c) => c.id === id);
  if (idx === -1) {
    return { ok: false, error: "Chapter not found.", reason: "notfound" };
  }
  chapters.splice(idx, 1);
  await writeRaw({ _meta: (await readRaw())._meta, chapters });
  return { ok: true };
}
