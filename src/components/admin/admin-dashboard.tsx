"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Lock,
  User,
  Loader2,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  KeyRound,
  ShieldCheck,
  BookOpen,
  Star,
  QrCode,
  GripVertical,
  Power,
  Sparkles,
  RotateCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import QrCard, { QrCardActions } from "./qr-card";
import { PrintAllButton } from "./qr-sheet";

/* ================================================================== */
/*  Types                                                             */
/* ================================================================== */
type Category = "ielts" | "sop" | "visa" | "scholarship" | "interview";

type Chapter = {
  id: string;
  code: string;
  chapterNumber: number;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  duration: string;
  videoId: string;
  category: Category;
  isActive: boolean;
  sortOrder: number;
};

type AuthState = "loading" | "unauthenticated" | "authenticated";

const CATEGORY_LABELS: Record<Category, { bn: string; en: string }> = {
  ielts: { bn: "আইইলটস", en: "IELTS" },
  sop: { bn: "SOP", en: "Statement of Purpose" },
  visa: { bn: "ভিসা", en: "Visa" },
  scholarship: { bn: "স্কলারশিপ", en: "Scholarship" },
  interview: { bn: "ইন্টারভিউ", en: "Interview" },
};

/* ================================================================== */
/*  Main component — driven by parent via `open` prop                 */
/* ================================================================== */
export function AdminDashboard({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [auth, setAuth] = useState<AuthState>("loading");
  const [username, setUsername] = useState("");
  const reduce = useReducedMotion();

  // Check session on mount + when overlay opens (external state sync).
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      const data = await res.json();
      if (data.ok && data.authenticated) {
        setAuth("authenticated");
        setUsername(data.username);
      } else {
        setAuth("unauthenticated");
        setUsername("");
      }
    } catch {
      setAuth("unauthenticated");
    }
  }, []);

  useEffect(() => {
    if (open) {
      // Re-sync session from server whenever the overlay opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      checkSession();
    }
  }, [open, checkSession]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuth("unauthenticated");
    setUsername("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-stretch justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-emerald-950/70 backdrop-blur-md"
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative m-0 w-full max-w-5xl overflow-hidden bg-background shadow-2xl shadow-emerald-950/40 sm:m-auto sm:my-6 sm:max-h-[92vh] sm:rounded-[1.5rem] sm:border sm:border-amber-500/30"
          >
            {/* Header bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-5 py-3.5 backdrop-blur-xl sm:px-7">
              <div className="flex items-center gap-3">
                <span className="relative grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-700 to-emerald-900 ring-1 ring-amber-400/30">
                  <ShieldCheck className="h-4.5 w-4.5 text-amber-300" strokeWidth={1.75} />
                </span>
                <div className="leading-tight">
                  <div className="font-display text-base font-semibold text-emerald-950 dark:text-cream">
                    Admin Dashboard
                  </div>
                  <div className="font-bangla-body text-[11px] text-muted-foreground">
                    {auth === "authenticated"
                      ? `${username} · লগইন হয়েছে`
                      : "নিয়ন্ত্রণ প্যানেল · Control panel"}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            {/* Body */}
            <div className="premium-scroll max-h-[calc(92vh-64px)] overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <AnimatePresence mode="wait">
                {auth === "loading" && (
                  <LoadingState key="loading" />
                )}
                {auth === "unauthenticated" && (
                  <LoginCard
                    key="login"
                    onSuccess={(name) => {
                      setAuth("authenticated");
                      setUsername(name);
                    }}
                  />
                )}
                {auth === "authenticated" && (
                  <ChapterManager key="manager" onLogout={handleLogout} />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================================================================== */
/*  Loading state                                                     */
/* ================================================================== */
function LoadingState() {
  return (
    <div className="grid place-items-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-700 dark:text-amber-300" strokeWidth={2} />
    </div>
  );
}

/* ================================================================== */
/*  Login card                                                        */
/* ================================================================== */
function LoginCard({ onSuccess }: { onSuccess: (username: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "লগইন ব্যর্থ।");
        setLoading(false);
        return;
      }
      onSuccess(data.username);
    } catch {
      setError("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-md"
    >
      <div className="glass-card relative overflow-hidden rounded-2xl p-7 sm:p-9">
        <div className="absolute -right-6 -top-8 font-display text-[8rem] leading-none text-amber-500/10">
          &#96;
        </div>
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-50/50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-900 dark:bg-amber-400/10 dark:text-amber-200">
            <KeyRound className="h-3 w-3" strokeWidth={2.5} />
            Admin only · শুধু এডমিন
          </span>
          <h2 className="mt-4 font-bangla text-2xl font-normal text-emerald-950 dark:text-cream">
            এডমিন লগইন
          </h2>
          <p className="mt-1 font-display text-sm italic text-muted-foreground">
            Sign in to manage chapters and video links.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin-user" className="mb-1.5 block font-bangla-body text-xs font-medium text-muted-foreground">
                ইউজারনেম · Username
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
                <input
                  id="admin-user"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="h-11 w-full rounded-xl border border-border bg-background/70 pl-10 pr-3 text-sm outline-none transition-colors focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-pw" className="mb-1.5 block font-bangla-body text-xs font-medium text-muted-foreground">
                পাসওয়ার্ড · Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
                <input
                  id="admin-pw"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-11 w-full rounded-xl border border-border bg-background/70 pl-10 pr-10 text-sm outline-none transition-colors focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-50/70 px-3.5 py-2.5 text-sm dark:bg-rose-500/10"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" strokeWidth={2.25} />
                <span className="font-bangla-body text-rose-700 dark:text-rose-200">{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                  যাচাই হচ্ছে…
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" strokeWidth={2.5} />
                  লগইন করুন
                </>
              )}
            </button>
          </form>

          <div className="mt-5 rounded-lg border border-amber-500/20 bg-amber-50/40 px-3.5 py-2.5 text-[11px] leading-relaxed text-muted-foreground dark:bg-amber-400/5">
            <span className="font-bangla-body">
              ডিফল্ট ইউজারনেম: <code className="font-mono font-semibold text-emerald-800 dark:text-amber-200">admin</code>
              <br />
              পাসওয়ার্ড বইয়ের সাথে আলাদাভাবে দেওয়া আছে। প্রথম লগইনের পর পরিবর্তন করুন।
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Chapter manager (authenticated)                                  */
/* ================================================================== */
function ChapterManager({ onLogout }: { onLogout: () => void }) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Chapter | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [stats, setStats] = useState({ total: 0, active: 0, totalUnlocks: 0 });
  // When set, the chapter row with this id auto-opens its QR preview — used to
  // surface the freshly-generated QR card immediately after a chapter is created.
  const [autoOpenQrForId, setAutoOpenQrForId] = useState<string | null>(null);
  // Whether chapter edits are allowed in the current runtime (Vercel = false).
  const [canWrite, setCanWrite] = useState(true);
  const [readOnlyReason, setReadOnlyReason] = useState("");

  const fetchChapters = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/chapters", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "লোড ব্যর্থ।");
      } else {
        setChapters(data.chapters);
        const active = data.chapters.filter((c: Chapter) => c.isActive).length;
        setStats({ total: data.chapters.length, active, totalUnlocks: 0 });
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChapters();
    // Detect read-only runtime (Vercel serverless). Drives the "edit
    // data/chapters.json + git push" hint in production.
    fetch("/api/admin/capabilities", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setCanWrite(!!data.canWrite);
        if (!data.canWrite) {
          setReadOnlyReason(
            data.environment === "vercel"
              ? "প্রোডাকশন (Vercel) — সার্ভারলেস ফাইল সিস্টেম রিড-ওনলি"
              : "রিড-ওনলি মোড"
          );
        }
      })
      .catch(() => {
        /* ignore — assume writable */
      });
  }, [fetchChapters]);

  const handleCreate = () => {
    if (!canWrite) {
      alert(
        "প্রোডাকশনে ড্যাশবোর্ড থেকে অধ্যায় যোগ করা যায় না। data/chapters.json ফাইল এডিট করে গিট পুশ করুন।"
      );
      return;
    }
    setEditing(null);
    setFormMode("create");
    setShowForm(true);
  };
  const handleEdit = (c: Chapter) => {
    if (!canWrite) {
      alert(
        "প্রোডাকশনে ড্যাশবোর্ড থেকে অধ্যায় পরিবর্তন করা যায় না। data/chapters.json ফাইল এডিট করে গিট পুশ করুন।"
      );
      return;
    }
    setEditing(c);
    setFormMode("edit");
    setShowForm(true);
  };
  const handleDelete = async (c: Chapter) => {
    if (!canWrite) {
      alert(
        "প্রোডাকশনে ড্যাশবোর্ড থেকে অধ্যায় মুছা যায় না। data/chapters.json ফাইল এডিট করে গিট পুশ করুন।"
      );
      return;
    }
    if (!confirm(`"${c.titleBn}" মুছবেন? (Code: ${c.code})`)) return;
    try {
      const res = await fetch(`/api/admin/chapters/${c.id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchChapters();
      }
    } catch {
      // ignore
    }
  };
  const handleToggle = async (c: Chapter) => {
    if (!canWrite) {
      alert(
        "প্রোডাকশনে ড্যাশবোর্ড থেকে অধ্যায় টগল করা যায় না। data/chapters.json এডিট করুন।"
      );
      return;
    }
    try {
      const res = await fetch(`/api/admin/chapters/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      if (res.ok) await fetchChapters();
    } catch {
      // ignore
    }
  };

  const handleFormClose = async (result: { refresh: boolean; createdId?: string } | boolean) => {
    // Support both the new object-shape and the old boolean-shape for safety.
    const refresh = typeof result === "boolean" ? result : result.refresh;
    const createdId = typeof result === "object" ? result.createdId : undefined;
    setShowForm(false);
    setEditing(null);
    if (refresh) {
      await fetchChapters();
      if (createdId) {
        // Auto-open the QR card for the freshly-created chapter so the admin
        // immediately sees the QR they will print into the book.
        setAutoOpenQrForId(createdId);
        // Clear the auto-open flag after a while so subsequent manual toggles
        // of the same row behave normally.
        setTimeout(() => setAutoOpenQrForId(null), 6000);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Read-only mode banner (Vercel/production) */}
      {!canWrite && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-50/70 p-4 text-emerald-950 dark:bg-amber-400/10 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300">
              <AlertCircle className="h-4.5 w-4.5" strokeWidth={2.25} />
            </span>
            <div className="leading-tight">
              <div className="font-bangla text-sm font-medium">
                প্রোডাকশন রিড-অনলি মোড · {readOnlyReason}
              </div>
              <p className="mt-1 font-bangla-body text-[12px] leading-relaxed text-muted-foreground">
                এডিট/যোগ/মুছে ফেলা ড্যাশবোর্ড থেকে সম্ভব নয়।{" "}
                <code className="font-mono font-semibold text-emerald-800 dark:text-amber-200">
                  data/chapters.json
                </code>{" "}
                ফাইল এডিট করে গিট পুশ করুন — Vercel স্বয়ংক্রিয়ভাবে রিডিপ্লয় করবে।
                <span className="mt-0.5 block font-display text-[11px] italic text-muted-foreground/80">
                  Edit <strong>data/chapters.json</strong> and push to git — Vercel
                  auto-redeploys. QR download / print still work here.
                </span>
              </p>
            </div>
          </div>
          <a
            href="https://github.com/ideaforgebd/book-companion/edit/main/data/chapters.json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-amber-500/40 bg-background/70 px-3 text-xs font-semibold transition-colors hover:bg-amber-50"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.5} />
            JSON এডিট করুন
          </a>
        </motion.div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={BookOpen} label="মোট অধ্যায়" value={stats.total} />
        <StatCard icon={Power} label="অ্যাক্টিভ" value={stats.active} accent="emerald" />
        <StatCard icon={ShieldCheck} label="নিষ্ক্রিয়" value={stats.total - stats.active} accent="muted" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 backdrop-blur">
        <div>
          <h3 className="font-display text-base font-semibold text-emerald-950 dark:text-cream">
            অধ্যায় ও ভিডিও লিঙ্ক
          </h3>
          <p className="font-display text-xs italic text-muted-foreground">
            Chapters · video links · QR codes
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PrintAllButton
            chapters={chapters.map((c) => ({
              code: c.code,
              chapterNumber: c.chapterNumber,
              titleBn: c.titleBn,
              titleEn: c.titleEn,
              duration: c.duration,
            }))}
            siteLabel="ideaforgebd.com"
          />
          <Button
            variant="outline"
            onClick={fetchChapters}
            size="sm"
            className="h-9 rounded-lg border-border bg-background/60 backdrop-blur"
          >
            <RotateCw className="h-4 w-4" strokeWidth={2} />
            রিফ্রেশ
          </Button>
          <Button
            onClick={handleCreate}
            size="sm"
            disabled={!canWrite}
            className="btn-gold h-9 rounded-lg border-0 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            title={canWrite ? "নতুন অধ্যায় যোগ করুন" : "প্রোডাকশনে ড্যাশবোর্ড থেকে যোগ করা যায় না — data/chapters.json এডিট করুন"}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            {canWrite ? "নতুন অধ্যায়" : "নতুন অধ্যায় (রিড-অনলি)"}
          </Button>
          <Button
            variant="ghost"
            onClick={onLogout}
            size="sm"
            className="h-9 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            লগআউট
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-50/70 px-4 py-3 text-sm dark:bg-rose-500/10">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" strokeWidth={2.25} />
          <span className="font-bangla-body text-rose-700 dark:text-rose-200">{error}</span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-emerald-700 dark:text-amber-300" strokeWidth={2} />
        </div>
      ) : chapters.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border py-16 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
          <p className="mt-3 font-bangla-body text-sm text-muted-foreground">
            এখনও কোনো অধ্যায় নেই। "নতুন অধ্যায়" বাটনে চাপ দিন।
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {chapters.map((c) => (
            <ChapterRow
              key={c.id}
              chapter={c}
              autoOpenQr={autoOpenQrForId === c.id}
              onEdit={() => handleEdit(c)}
              onDelete={() => handleDelete(c)}
              onToggle={() => handleToggle(c)}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <ChapterForm
            mode={formMode}
            initial={editing}
            onClose={handleFormClose}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ================================================================== */
/*  Stat card                                                         */
/* ================================================================== */
function StatCard({
  icon: Icon,
  label,
  value,
  accent = "gold",
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
  accent?: "gold" | "emerald" | "muted";
}) {
  const accentClass =
    accent === "emerald"
      ? "from-emerald-600 to-emerald-800"
      : accent === "muted"
      ? "from-stone-500 to-stone-700"
      : "from-amber-600 to-amber-700";
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3.5 backdrop-blur">
      <div className="flex items-center gap-2.5">
        <span className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${accentClass} text-white shadow-sm`}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <div className="leading-tight">
          <div className="font-display text-xl font-semibold text-emerald-950 dark:text-cream">
            {value}
          </div>
          <div className="font-bangla-body text-[10px] text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Chapter row                                                       */
/* ================================================================== */
function ChapterRow({
  chapter,
  autoOpenQr,
  onEdit,
  onDelete,
  onToggle,
}: {
  chapter: Chapter;
  autoOpenQr?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrCardRef = useRef<HTMLDivElement | null>(null);
  const meta = CATEGORY_LABELS[chapter.category];

  // Open automatically when the parent flags this row (e.g. after creation).
  useEffect(() => {
    if (autoOpenQr) {
      // Parent-driven event propagation — surface the freshly-created
      // chapter's QR card so the admin can immediately download/print it.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowQr(true);
      // Scroll the QR card into view so the admin sees it immediately.
      setTimeout(() => {
        qrCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
    }
  }, [autoOpenQr]);

  const unlockUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?code=${encodeURIComponent(chapter.code)}`
      : `/?code=${chapter.code}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(unlockUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const safeFilename = `QR-${chapter.code.replace(/[^A-Z0-9-]/gi, "-")}.png`;

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-card/60 backdrop-blur transition-colors ${
        chapter.isActive ? "border-border" : "border-border opacity-60"
      }`}
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        {/* Left: number + content */}
        <div className="flex flex-1 items-start gap-3.5">
          <span className="font-display text-2xl font-semibold text-amber-700/40 dark:text-amber-300/30">
            {String(chapter.chapterNumber).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bangla text-sm font-medium text-emerald-950 dark:text-cream">
                {chapter.titleBn}
              </h4>
              <span className="rounded-full bg-emerald-900/5 px-2 py-0.5 font-bangla-body text-[10px] text-emerald-800 dark:bg-amber-400/10 dark:text-amber-200">
                {meta.bn}
              </span>
              {!chapter.isActive && (
                <span className="rounded-full bg-stone-200/70 px-2 py-0.5 text-[10px] font-medium text-stone-600 dark:bg-stone-700/40 dark:text-stone-300">
                  নিষ্ক্রিয়
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate font-display text-xs italic text-muted-foreground">
              {chapter.titleEn}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <KeyRound className="h-3 w-3 text-amber-600 dark:text-amber-300" strokeWidth={2} />
                {chapter.code}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-600 dark:text-amber-300" strokeWidth={2} />
                {chapter.duration}
              </span>
              <span className="inline-flex items-center gap-1">
                <ExternalLink className="h-3 w-3 text-amber-600 dark:text-amber-300" strokeWidth={2} />
                youtu.be/{chapter.videoId}
              </span>
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => setShowQr((s) => !s)}
            className={`grid h-9 w-9 place-items-center rounded-lg border transition-colors ${
              showQr
                ? "border-amber-500/50 bg-amber-50/70 text-emerald-800 dark:bg-amber-400/15 dark:text-amber-200"
                : "border-border bg-background/60 text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Show QR"
            title="QR কোড দেখুন / ডাউনলোড / প্রিন্ট"
          >
            <QrCode className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            onClick={copyLink}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background/60 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Copy unlock link"
            title="আনলক লিঙ্ক কপি"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
            ) : (
              <Copy className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
          <button
            onClick={onToggle}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background/60 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Toggle active"
            title={chapter.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
          >
            <Power className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            onClick={onEdit}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background/60 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Edit"
            title="সম্পাদনা করুন"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            onClick={onDelete}
            className="grid h-9 w-9 place-items-center rounded-lg border border-rose-500/30 bg-rose-50/40 text-rose-600 transition-colors hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300"
            aria-label="Delete"
            title="মুছে ফেলুন"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* QR expansion — premium printable card + download / print actions */}
      <AnimatePresence>
        {showQr && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden border-t border-amber-500/20 bg-amber-50/30 dark:bg-amber-400/5"
          >
            <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-start">
              {/* The printable QR card (this DOM node is what gets downloaded as PNG) */}
              <div className="flex justify-center lg:justify-start">
                <div ref={qrCardRef} className="w-full max-w-[360px]">
                  <QrCard
                    chapter={{
                      code: chapter.code,
                      chapterNumber: chapter.chapterNumber,
                      titleBn: chapter.titleBn,
                      titleEn: chapter.titleEn,
                      duration: chapter.duration,
                      category: chapter.category,
                    }}
                    unlockUrl={unlockUrl}
                    compact
                  />
                </div>
              </div>

              {/* Right: explanation + actions */}
              <div className="flex-1 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-50/50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-900 dark:bg-amber-400/10 dark:text-amber-200">
                  <QrCode className="h-3 w-3" strokeWidth={2.5} />
                  বইয়ে প্রিন্ট করার জন্য তৈরি
                </div>
                <h4 className="font-bangla text-base font-normal text-emerald-950 dark:text-cream">
                  এই অধ্যায়ের QR কোড তৈরি হয়ে গেছে
                </h4>
                <p className="font-bangla-body text-[13px] leading-relaxed text-muted-foreground">
                  উপরের QR কার্ডটি ডাউনলোড করে বা প্রিন্ট করে বইয়ের এই অধ্যায়ের শেষ পৃষ্ঠায়
                  বসিয়ে দিন। পাঠক যখন এই QR স্ক্যান করবে, সে সরাসরি এই পেজে চলে আসবে —
                  কোড পূরণ হয়ে থাকবে, শুধু <span className="font-semibold text-emerald-800 dark:text-amber-200">"ভিডিও আনলক করুন"</span> চাপলেই ভিডিও খুলবে।
                </p>
                <p className="font-display text-xs italic text-foreground/65">
                  This QR encodes the unlock URL — readers scanning it from the book land directly
                  here with the code pre-filled, ready to press unlock.
                </p>

                <div className="pt-1">
                  <QrCardActions cardRef={qrCardRef} filename={safeFilename} />
                </div>

                <div className="rounded-lg border border-amber-500/20 bg-amber-50/30 px-3.5 py-2.5 dark:bg-amber-400/5">
                  <div className="font-bangla-body text-[11px] text-muted-foreground">
                    <span className="font-semibold text-emerald-800 dark:text-amber-200">আনলক লিংক:</span>{" "}
                    <span className="font-mono break-all text-foreground/80">{unlockUrl}</span>
                  </div>
                  <div className="mt-1.5 font-bangla-body text-[11px] text-muted-foreground">
                    অথবা বইয়ে শুধু কোড প্রিন্ট করতে পারেন:{" "}
                    <code className="font-mono font-semibold text-emerald-800 dark:text-amber-200">{chapter.code}</code>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  Chapter form (create / edit)                                      */
/* ================================================================== */
function ChapterForm({
  mode,
  initial,
  onClose,
}: {
  mode: "create" | "edit";
  initial: Chapter | null;
  onClose: (result: { refresh: boolean; createdId?: string }) => void;
}) {
  const [form, setForm] = useState({
    code: initial?.code ?? "",
    chapterNumber: initial?.chapterNumber ?? "",
    titleBn: initial?.titleBn ?? "",
    titleEn: initial?.titleEn ?? "",
    descriptionBn: initial?.descriptionBn ?? "",
    descriptionEn: initial?.descriptionEn ?? "",
    duration: initial?.duration ?? "",
    videoId: initial?.videoId ?? "",
    category: (initial?.category ?? "ielts") as Category,
    isActive: initial?.isActive ?? true,
    sortOrder: initial?.sortOrder ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const reduce = useReducedMotion();

  const set = (k: keyof typeof form, v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const payload = {
        code: form.code.trim(),
        chapterNumber: form.chapterNumber === "" ? undefined : Number(form.chapterNumber),
        titleBn: form.titleBn.trim(),
        titleEn: form.titleEn.trim(),
        descriptionBn: form.descriptionBn.trim(),
        descriptionEn: form.descriptionEn.trim(),
        duration: form.duration.trim(),
        videoId: form.videoId.trim(),
        category: form.category,
        isActive: form.isActive,
        sortOrder: form.sortOrder === "" ? undefined : Number(form.sortOrder),
      };
      const url =
        mode === "create"
          ? "/api/admin/chapters"
          : `/api/admin/chapters/${initial!.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "সংরক্ষণ ব্যর্থ।");
        setLoading(false);
        return;
      }
      // On create, surface the new chapter's id so the manager can auto-open
      // its QR card immediately.
      onClose({
        refresh: true,
        createdId: mode === "create" ? data.chapter?.id : undefined,
      });
    } catch {
      setError("নেটওয়ার্ক সমস্যা।");
      setLoading(false);
    }
  };

  // Lock scroll behind form too
  const formRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[110] flex items-stretch justify-center sm:items-center"
    >
      <div className="absolute inset-0 bg-emerald-950/50 backdrop-blur-sm" onClick={() => onClose({ refresh: false })} />
      <motion.div
        ref={formRef}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="premium-scroll relative m-0 h-full w-full max-w-2xl overflow-y-auto bg-background shadow-2xl sm:m-4 sm:max-h-[88vh] sm:rounded-2xl sm:border sm:border-amber-500/30"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/90 px-5 py-3.5 backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-2.5">
            {mode === "create" ? (
              <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-300" strokeWidth={1.75} />
            ) : (
              <Pencil className="h-5 w-5 text-amber-600 dark:text-amber-300" strokeWidth={1.75} />
            )}
            <h3 className="font-display text-base font-semibold text-emerald-950 dark:text-cream">
              {mode === "create" ? "নতুন অধ্যায় যোগ করুন" : "অধ্যায় সম্পাদনা"}
            </h3>
          </div>
          <button
            onClick={() => onClose({ refresh: false })}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4 px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="কোড · Code" hint="বইয়ে প্রিন্ট হবে · যেমন IFB-IELTS-01">
              <input
                required
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="IFB-XXXX-XX"
                className="input-premium"
                maxLength={32}
              />
            </Field>
            <Field label="ক্যাটাগরি · Category">
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="input-premium"
              >
                {(Object.keys(CATEGORY_LABELS) as Category[]).map((k) => (
                  <option key={k} value={k}>
                    {CATEGORY_LABELS[k].bn} · {CATEGORY_LABELS[k].en}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="অধ্যায় নম্বর · Chapter #">
              <input
                type="number"
                min={1}
                value={form.chapterNumber}
                onChange={(e) => set("chapterNumber", e.target.value)}
                placeholder="auto"
                className="input-premium"
              />
            </Field>
            <Field label="সময়কাল · Duration">
              <input
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder="14:32"
                className="input-premium"
              />
            </Field>
            <Field label="ক্রম · Sort order">
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", e.target.value)}
                placeholder="auto"
                className="input-premium"
              />
            </Field>
          </div>

          <Field label="বাংলা শিরোনাম · Bengali title">
            <input
              required
              value={form.titleBn}
              onChange={(e) => set("titleBn", e.target.value)}
              placeholder="অধ্যায়ের বাংলা নাম"
              className="input-premium font-bangla-body"
            />
          </Field>
          <Field label="English title">
            <input
              required
              value={form.titleEn}
              onChange={(e) => set("titleEn", e.target.value)}
              placeholder="Chapter title in English"
              className="input-premium font-display"
            />
          </Field>

          <Field label="বাংলা বিবরণ · Bengali description">
            <textarea
              value={form.descriptionBn}
              onChange={(e) => set("descriptionBn", e.target.value)}
              placeholder="এই ভিডিওটি কী শেখায়"
              rows={2}
              className="input-premium font-bangla-body resize-none"
            />
          </Field>
          <Field label="English description">
            <textarea
              value={form.descriptionEn}
              onChange={(e) => set("descriptionEn", e.target.value)}
              placeholder="What this video teaches"
              rows={2}
              className="input-premium font-display resize-none"
            />
          </Field>

          <Field label="YouTube ভিডিও ID · Video ID" hint="শুধু ID, পুরো URL নয় — যেমন dQw4w9WgXcQ">
            <input
              required
              value={form.videoId}
              onChange={(e) => set("videoId", e.target.value)}
              placeholder="dQw4w9WgXcQ"
              className="input-premium font-mono"
            />
          </Field>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-card/60 px-4 py-3 backdrop-blur">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="h-4 w-4 accent-emerald-600"
            />
            <span className="font-bangla-body text-sm text-foreground">
              সক্রিয় · Active (পাঠকরা এই কোড ব্যবহার করতে পারবে)
            </span>
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-50/70 px-4 py-3 text-sm dark:bg-rose-500/10">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" strokeWidth={2.25} />
              <span className="font-bangla-body text-rose-700 dark:text-rose-200">{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onClose({ refresh: false })}
              className="h-11 rounded-xl px-4 text-sm font-medium"
            >
              বাতিল
            </Button>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                  সংরক্ষণ হচ্ছে…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                  {mode === "create" ? "যোগ করুন" : "সংরক্ষণ করুন"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Field wrapper + premium input class                               */
/* ================================================================== */
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block font-bangla-body text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && (
        <p className="font-bangla-body text-[10px] text-muted-foreground/70">{hint}</p>
      )}
    </div>
  );
}

/* Local helper for framer-motion reduced-motion */
function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Initial sync from the external media-query state on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduce(m.matches);
    const handler = () => setReduce(m.matches);
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, []);
  return reduce;
}
