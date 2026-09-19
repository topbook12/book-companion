"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  QrCode,
  ArrowRight,
  ArrowUpRight,
  PlayCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Compass,
  PenLine,
  Stamp,
  ScrollText,
  Star,
  Maximize2,
  ScanLine,
  Volume2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

/* ------------------------------------------------------------------ */
/*  Static chapter preview (public metadata only — no codes, no IDs)  */
/* ------------------------------------------------------------------ */
type PreviewChapter = {
  chapter: number;
  titleBn: string;
  titleEn: string;
  duration: string;
  category: "ielts" | "sop" | "visa" | "scholarship" | "interview";
};

const CATEGORY_META: Record<
  PreviewChapter["category"],
  { bn: string; en: string; icon: typeof BookOpen; accent: string }
> = {
  ielts: { bn: "আইইলটস", en: "IELTS", icon: Stamp, accent: "from-emerald-600 to-emerald-700" },
  sop: { bn: "SOP", en: "Statement of Purpose", icon: PenLine, accent: "from-amber-600 to-amber-700" },
  visa: { bn: "ভিসা", en: "Visa", icon: ShieldCheck, accent: "from-rose-700 to-rose-800" },
  scholarship: { bn: "স্কলারশিপ", en: "Scholarship", icon: Star, accent: "from-yellow-600 to-amber-700" },
  interview: { bn: "ইন্টারভিউ", en: "Interview", icon: Compass, accent: "from-teal-700 to-emerald-800" },
};

/* ------------------------------------------------------------------ */
/*  Code formatter — uppercase + keep alphanumerics & hyphens          */
/* ------------------------------------------------------------------ */
function formatCode(raw: string): string {
  // Uppercase, allow letters, numbers, and hyphens; trim everything else.
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 14);
}

type UnlockedChapter = {
  code: string;
  chapter: number;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  duration: string;
  videoId: string;
  category: PreviewChapter["category"];
};

type Status = "idle" | "loading" | "unlocked" | "error";

/* ================================================================== */
/*  PAGE                                                              */
/* ================================================================== */
export default function Home() {
  const [adminOpen, setAdminOpen] = useState(false);
  const openAdmin = useRef<(() => void) | null>(null);

  // Trigger admin via keyboard shortcut (Ctrl/Cmd + Shift + A) or #admin hash
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === "#admin") setAdminOpen(true);
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);

    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setAdminOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("hashchange", checkHash);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Provide a global hook for the footer's "admin" link
  useEffect(() => {
    openAdmin.current = () => setAdminOpen(true);
    (window as unknown as { __openAdmin?: () => void }).__openAdmin =
      openAdmin.current;
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col paper-texture noise-overlay overflow-x-hidden">
      {/* Ambient orbs */}
      <AmbientBackground />

      <SiteNav />
      <main className="flex-1 relative z-10">
        <Hero />
        <UnlockExperience />
        <ChaptersPreview />
        <HowItWorks />
        <HonorNote />
      </main>
      <SiteFooter onOpenAdmin={() => setAdminOpen(true)} />
      <AdminDashboard open={adminOpen} onClose={() => setAdminOpen(false)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Ambient background orbs                                           */
/* ------------------------------------------------------------------ */
function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="orb-emerald absolute -top-40 -left-32 h-[40rem] w-[40rem] rounded-full opacity-60" />
      <div className="orb-gold absolute top-1/3 -right-40 h-[34rem] w-[34rem] rounded-full opacity-50" />
      <div className="orb-emerald absolute bottom-0 left-1/4 h-[30rem] w-[30rem] rounded-full opacity-40" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sticky nav                                                        */
/* ------------------------------------------------------------------ */
function SiteNav() {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="absolute inset-0 backdrop-blur-xl bg-background/60 border-b border-border/60" />
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#top" className="group flex items-center gap-3">
          <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 shadow-lg shadow-emerald-900/20 ring-1 ring-amber-400/30">
            <BookOpen className="h-5 w-5 text-amber-300" strokeWidth={1.75} />
            <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-amber-400 ring-2 ring-background">
              <KeyRound className="h-2.5 w-2.5 text-emerald-900" strokeWidth={2.5} />
            </span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-emerald-950 dark:text-cream">
              IdeaForge<span className="text-gold-foil"> BD</span>
            </span>
            <span className="mt-0.5 font-bangla-body text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Study Abroad Companion
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-1 sm:flex">
          <a
            href="#how"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            কীভাবে কাজ করে
          </a>
          <a
            href="#chapters"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            অধ্যায়সমূহ
          </a>
          <a
            href="#unlock"
            className="btn-gold inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all"
          >
            <KeyRound className="h-4 w-4" strokeWidth={2.25} />
            কোড আনলক করুন
          </a>
        </div>

        <a
          href="#unlock"
          className="btn-gold inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold sm:hidden"
        >
          <KeyRound className="h-4 w-4" strokeWidth={2.25} />
          আনলক
        </a>
      </nav>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                              */
/* ------------------------------------------------------------------ */
function Hero() {
  const reduce = useReducedMotion();
  const fade = useMemo(
    () => ({
      hidden: { opacity: 0, y: reduce ? 0 : 18 },
      visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
      }),
    }),
    [reduce]
  );

  return (
    <section id="top" className="relative pt-10 sm:pt-16 lg:pt-20 pb-6">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Copy */}
          <motion.div initial="hidden" animate="visible" variants={fade} className="relative">
            <motion.div variants={fade} custom={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-50/60 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-900 dark:bg-amber-400/10 dark:text-amber-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" strokeWidth={2} />
                Companion to the printed book
              </span>
            </motion.div>

            <motion.h1
              variants={fade}
              custom={1}
              className="mt-5 font-bangla text-[2.1rem] font-normal leading-[1.18] text-emerald-950 dark:text-cream sm:text-5xl lg:text-[3.4rem]"
            >
              বইয়ের ভেতরেই লুকিয়ে আছে
              <br />
              <span className="text-gold-foil font-display italic">আপনার পরবর্তী ধাপ</span>
            </motion.h1>

            <motion.p
              variants={fade}
              custom={2}
              className="mt-4 max-w-xl font-bangla-body text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              প্রিন্ট করা বইয়ের প্রতিটি অধ্যায়ের পাতায় একটি কোড আছে। সেই কোড লিখুন, আর খুলে যাবে
              সেই অধ্যায়ের এক্সক্লুসিভ ভিডিও — যেখানে এসওপি, ভিসা আর স্কলারশিপের জটিল পথ হাঁটার
              মানচিত্রটা ভেঙে বলা হয়েছে।
            </motion.p>

            <motion.p
              variants={fade}
              custom={3}
              className="mt-3 max-w-xl font-display text-sm italic text-foreground/85 sm:text-base"
            >
              Inside every printed chapter lies a code — and behind every code,
              a video that turns the page into preparation.
            </motion.p>

            <motion.div variants={fade} custom={4} className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#unlock"
                className="btn-gold inline-flex h-12 items-center gap-2.5 rounded-xl px-6 text-sm font-semibold transition-all"
              >
                <KeyRound className="h-4.5 w-4.5" strokeWidth={2.25} />
                কোড দিয়ে আনলক করুন
                <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
              </a>
              <a
                href="#how"
                className="inline-flex h-12 items-center gap-2.5 rounded-xl border border-border bg-card/60 px-6 text-sm font-semibold text-foreground backdrop-blur transition-all hover:border-amber-500/40 hover:bg-card"
              >
                <Compass className="h-4 w-4 text-amber-600 dark:text-amber-300" strokeWidth={2} />
                কীভাবে কাজ করে
              </a>
            </motion.div>

            <motion.div
              variants={fade}
              custom={5}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground"
            >
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                লগইন দরকার নেই
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                কোনো পেমেন্ট নেই
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                মোবাইলে সহজ
              </span>
            </motion.div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] sm:aspect-[5/5] lg:aspect-[4/5]">
              {/* Frame */}
              <div className="absolute inset-0 overflow-hidden rounded-[1.75rem] border border-amber-500/30 shadow-2xl shadow-emerald-950/25">
                <img
                  src="/assets/book-key.png"
                  alt="An open leather-bound book with a small golden key resting on its pages."
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/55 via-transparent to-amber-900/20" />
              </div>

              {/* Floating "code" ticket */}
              <motion.div
                animate={reduce ? undefined : { y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-4 sm:-left-8 w-[60%] max-w-[260px]"
              >
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bangla-body text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      Chapter 3 · SOP
                    </span>
                    <QrCode className="h-4 w-4 text-emerald-700 dark:text-amber-300" strokeWidth={1.75} />
                  </div>
                  <div className="mt-2 font-mono text-lg font-semibold tracking-[0.18em] text-emerald-950 dark:text-cream">
                    IFB-SOP-03
                  </div>
                  <div className="mt-1 gold-rule" />
                  <div className="mt-2 font-bangla-body text-[11px] text-muted-foreground">
                    বইয়ের পৃষ্ঠা ৪৭-এ প্রিন্ট করা
                  </div>
                </div>
              </motion.div>

              {/* Floating "unlocked" pill */}
              <motion.div
                animate={reduce ? undefined : { y: [0, 10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="absolute -top-4 -right-3 sm:-right-6"
              >
                <div className="glass-card flex items-center gap-2.5 rounded-full px-4 py-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-700 text-amber-200">
                    <Lock className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="font-bangla-body text-[11px] font-medium text-emerald-950 dark:text-cream">
                    ভিডিও লক করা — কোড দিন
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Unlock experience (the centerpiece)                               */
/* ------------------------------------------------------------------ */
function UnlockExperience() {
  const reduce = useReducedMotion();
  const [codeValue, setCodeValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorBn, setErrorBn] = useState("");
  const [errorEn, setErrorEn] = useState("");
  const [chapter, setChapter] = useState<UnlockedChapter | null>(null);
  const [prefilledFromUrl, setPrefilledFromUrl] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const unlockCardRef = useRef<HTMLDivElement>(null);

  // Pre-fill from ?code= query param (QR convenience) + auto-scroll to the card
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const preset = params.get("code");
    if (preset) {
      // One-time external sync from URL params on mount — safe to set state here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCodeValue(formatCode(preset));
      setPrefilledFromUrl(true);
      // Auto-scroll to the unlock card so a QR-scanner lands right on it.
      setTimeout(() => {
        unlockCardRef.current?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "center",
        });
        inputRef.current?.focus();
      }, 350);
    }
  }, [reduce]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeValue(formatCode(e.target.value));
    if (status === "error") {
      setStatus("idle");
      setErrorBn("");
      setErrorEn("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErrorBn("");
    setErrorEn("");
    setChapter(null);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeValue }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorBn(data.errorBn ?? "কোডটি সঠিক নয়।");
        setErrorEn(data.errorEn ?? "Incorrect code.");
        return;
      }
      setChapter(data.chapter as UnlockedChapter);
      setStatus("unlocked");
      // Smooth scroll to video after a beat
      setTimeout(() => {
        videoRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      }, 250);
    } catch {
      setStatus("error");
      setErrorBn("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।");
      setErrorEn("Network error — please try again.");
    }
  };

  const reset = () => {
    setStatus("idle");
    setChapter(null);
    setErrorBn("");
    setErrorEn("");
    setCodeValue("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <section id="unlock" className="relative py-12 sm:py-16 lg:py-20 scroll-mt-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* QR prefill notice — shown only when the code was pre-filled via URL */}
        <AnimatePresence>
          {prefilledFromUrl && status !== "unlocked" && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5 overflow-hidden"
            >
              <div className="glass-card flex items-start gap-3 rounded-2xl border-l-4 border-l-amber-500 p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-700 to-emerald-900 text-amber-300 ring-1 ring-amber-400/30">
                  <ScanLine className="h-4.5 w-4.5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <div className="font-bangla text-sm font-medium text-emerald-950 dark:text-cream">
                    বইয়ের QR স্ক্যান করেছেন — কোড প্রি-ফিলড আছে
                  </div>
                  <p className="mt-0.5 font-bangla-body text-[12px] leading-relaxed text-muted-foreground">
                    নিচের বাক্সে আপনার অধ্যায়ের কোড পূরণ হয়ে আছে। শুধু{" "}
                    <span className="font-semibold text-emerald-800 dark:text-amber-200">
                      "ভিডিও আনলক করুন"
                    </span>{" "}
                    বাটনে চাপ দিন, ভিডিও খুলে যাবে — ফুলস্ক্রিনেও দেখতে পারবেন।
                  </p>
                  <p className="mt-0.5 font-display text-[11px] italic text-muted-foreground/80">
                    Your chapter code is pre-filled — just press unlock to watch.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
          {/* ---- Unlock card ---- */}
          <motion.div
            ref={unlockCardRef}
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative scroll-mt-24"
          >
            <div className="glass-card rounded-[1.5rem] p-6 sm:p-8 noise-overlay">
              {/* Eyebrow */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-50/50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-900 dark:bg-amber-400/10 dark:text-amber-200">
                  <KeyRound className="h-3 w-3" strokeWidth={2.5} />
                  Unlock
                </span>
                <span className="font-bangla-body text-[11px] text-muted-foreground">
                  ধাপ ১ / ১
                </span>
              </div>

              {/* Heading */}
              <h2 className="mt-5 font-bangla text-2xl font-normal leading-snug text-emerald-950 dark:text-cream sm:text-3xl">
                আপনার বইয়ের কোড দিন
              </h2>
              <p className="mt-1.5 font-display text-sm italic text-muted-foreground">
                Enter the code printed in your book.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <motion.div
                  animate={
                    status === "error" && !reduce ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }
                  }
                  transition={{ duration: 0.45 }}
                  className="input-gold-glow relative rounded-2xl border border-border/80 bg-background/70 p-1.5 backdrop-blur transition-colors"
                >
                  <label htmlFor="unlock-code" className="sr-only">
                    বইয়ের কোড
                  </label>
                  <input
                    id="unlock-code"
                    ref={inputRef}
                    type="text"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    inputMode="text"
                    placeholder="IFB-XXXX-XX"
                    value={codeValue}
                    onChange={handleCodeChange}
                    maxLength={14}
                    className="w-full rounded-xl bg-transparent px-4 py-3.5 font-mono text-lg font-semibold tracking-[0.18em] text-emerald-950 outline-none placeholder:text-muted-foreground/60 dark:text-cream sm:text-xl"
                    aria-invalid={status === "error"}
                    aria-describedby="unlock-error"
                  />
                  {/* Decorative chip on the right */}
                  <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 rounded-md bg-amber-400/15 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300 sm:inline-flex">
                    <QrCode className="h-3 w-3" strokeWidth={2.25} />
                    QR
                  </span>
                </motion.div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "loading" || codeValue.replace(/-/g, "").length < 4}
                  className="btn-gold inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                      যাচাই হচ্ছে…
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" strokeWidth={2.5} />
                      ভিডিও আনলক করুন
                      <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                    </>
                  )}
                </button>

                {/* Error */}
                <AnimatePresence>
                  {status === "error" && (
                    <motion.div
                      id="unlock-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-50/70 px-4 py-3 text-sm dark:bg-rose-500/10">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" strokeWidth={2.25} />
                        <div className="space-y-0.5">
                          <div className="font-bangla-body font-medium text-rose-700 dark:text-rose-200">
                            {errorBn || "কোডটি সঠিক নয়।"}
                          </div>
                          <div className="font-display text-xs italic text-rose-600/80 dark:text-rose-300/80">
                            {errorEn || "Incorrect code, please check your book."}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Helper */}
                <div className="flex items-start gap-2.5 pt-1 text-[12px] text-muted-foreground">
                  <ScrollText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-300" strokeWidth={2} />
                  <p className="font-bangla-body leading-relaxed">
                    কোডটি আপনার বইয়ের প্রতিটি অধ্যায়ের শেষ পৃষ্ঠায় প্রিন্ট করা — টেক্সট ও QR উভয় আকারে।
                    <span className="font-display italic"> Code is printed at the end of each chapter.</span>
                  </p>
                </div>

                {/* Try a sample pill */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="font-bangla-body text-[11px] text-muted-foreground">ডেমো দেখতে:</span>
                  {["IFB-IELTS-01", "IFB-SOP-03"].map((demo) => (
                    <button
                      key={demo}
                      type="button"
                      onClick={() => setCodeValue(demo)}
                      className="rounded-full border border-border bg-card/60 px-2.5 py-1 font-mono text-[11px] font-medium tracking-wider text-foreground/80 transition-colors hover:border-amber-500/40 hover:text-foreground"
                    >
                      {demo}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            {/* Decorative corner stamp */}
            <div className="pointer-events-none absolute -right-3 -top-3 hidden h-16 w-16 rotate-12 sm:block">
              <div className="grid h-full w-full place-items-center rounded-full border-2 border-dashed border-amber-500/40 bg-amber-50/40 backdrop-blur dark:bg-amber-400/10">
                <Stamp className="h-5 w-5 text-amber-700 dark:text-amber-300" strokeWidth={1.75} />
              </div>
            </div>
          </motion.div>

          {/* ---- Video frame (locked / unlocked) ---- */}
          <div ref={videoRef} className="relative scroll-mt-28">
            <AnimatePresence mode="wait">
              {status === "unlocked" && chapter ? (
                <UnlockedVideo key="unlocked" chapter={chapter} onReset={reset} />
              ) : (
                <LockedVideo key="locked" />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Locked video frame                                                */
/* ------------------------------------------------------------------ */
function LockedVideo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.985 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <div className="relative overflow-hidden rounded-[1.5rem] border border-emerald-900/30 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 shadow-2xl shadow-emerald-950/40">
        {/* 16:9 frame */}
        <div className="relative aspect-video w-full">
          {/* Blurred book backdrop */}
          <img
            src="/assets/book-key.png"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-2xl"
          />
          {/* Scanline shimmer */}
          <div className="scanline-shimmer absolute inset-0" />
          {/* Grid overlay */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />

          {/* Center lock */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="lock-pulse mx-auto grid h-20 w-20 place-items-center rounded-full border border-amber-400/50 bg-amber-400/15 backdrop-blur shadow-[0_0_30px_-4px] shadow-amber-400/40">
                <Lock className="h-8 w-8 text-amber-200" strokeWidth={1.75} />
              </div>
              <div className="mt-5 font-bangla text-xl font-normal text-cream">
                ভিডিওটি লক করা আছে
              </div>
              <div className="mt-1 font-display text-sm italic text-amber-200/70">
                The chapter video is locked.
              </div>
              <div className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-2 rounded-full border border-amber-400/25 bg-emerald-950/60 px-4 py-1.5 font-bangla-body text-[11px] text-amber-100/80 backdrop-blur">
                <KeyRound className="h-3 w-3" strokeWidth={2.25} />
                কোড দিন, ভিডিও খুলে যাবে
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 border-t border-amber-400/15 bg-emerald-950/80 px-4 py-2.5 backdrop-blur">
            <div className="flex items-center gap-2 font-bangla-body text-[11px] text-cream/70">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Locked · Companion Video
            </div>
            <div className="font-mono text-[10px] tracking-widest text-cream/50">
              YOUTUBE · UNLISTED
            </div>
          </div>
        </div>
      </div>

      {/* Below frame */}
      <div className="mt-4 flex items-start gap-2.5 text-[12px] text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-amber-300" strokeWidth={2} />
        <p className="font-bangla-body leading-relaxed">
          ভিডিও শুধুমাত্র বইয়ের পাঠকদের জন্য — কোড ছাড়া এখানে পৌঁছানো কঠিন।
          <span className="font-display italic"> Exclusive to readers of the book.</span>
        </p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Unlocked video frame                                              */
/* ------------------------------------------------------------------ */
function UnlockedVideo({
  chapter,
  onReset,
}: {
  chapter: UnlockedChapter;
  onReset: () => void;
}) {
  const meta = CATEGORY_META[chapter.category];
  const Icon = meta.icon;
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = async () => {
    const el = videoWrapRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch {
      // Some browsers block fullscreen on cross-origin iframes; ignore.
    }
  };

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.985 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      {/* Chapter header strip */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br ${meta.accent} px-3 py-1 text-[11px] font-medium text-white shadow-sm`}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
          {meta.bn} · Chapter {chapter.chapter}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-50/50 px-3 py-1 text-[11px] font-medium text-emerald-900 dark:bg-amber-400/10 dark:text-amber-200">
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} />
          আনলক হয়েছে
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <Clock className="h-3.5 w-3.5" strokeWidth={2} />
          {chapter.duration}
        </span>
      </div>

      {/* YouTube iframe + fullscreen button */}
      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="reveal-glow group relative overflow-hidden rounded-[1.5rem] border border-amber-500/40 shadow-2xl shadow-emerald-950/40"
      >
        <div
          ref={videoWrapRef}
          className="relative aspect-video w-full bg-emerald-950"
        >
          {/* Premium poster backdrop (covered by iframe once YouTube renders) */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-950 to-emerald-900"
          >
            <img
              src="/assets/book-key.png"
              alt=""
              aria-hidden
              className="h-full w-full scale-110 object-cover opacity-25 blur-xl"
            />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-amber-400/40 bg-amber-400/10 backdrop-blur">
                  <PlayCircle className="h-8 w-8 text-amber-300" strokeWidth={1.5} />
                </div>
                <div className="mt-3 font-display text-sm italic text-amber-100/80">
                  Loading companion video…
                </div>
              </div>
            </div>
          </div>
          {/* Actual YouTube embed */}
          <iframe
            src={`https://www.youtube.com/embed/${chapter.videoId}?rel=0&modestbranding=1&playsinline=1`}
            title={`${chapter.titleBn} — ${chapter.titleEn}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full bg-emerald-950"
            referrerPolicy="strict-origin-when-cross-origin"
          />

          {/* Fullscreen button (top-right corner, always visible on mobile, hover on desktop) */}
          <button
            type="button"
            onClick={enterFullscreen}
            className="absolute right-3 top-3 z-10 inline-flex h-9 items-center gap-1.5 rounded-lg border border-amber-400/40 bg-emerald-950/80 px-3 text-[11px] font-semibold text-amber-100 backdrop-blur transition-all hover:bg-emerald-950 hover:text-amber-50 sm:bg-emerald-950/70"
            aria-label={isFullscreen ? "Exit fullscreen" : "Watch in fullscreen"}
            title={isFullscreen ? "ফুলস্ক্রিন বন্ধ করুন" : "ফুলস্ক্রিনে দেখুন"}
          >
            <Maximize2 className="h-3.5 w-3.5" strokeWidth={2.5} />
            ফুলস্ক্রিন
          </button>

          {/* Volume hint (decorative) */}
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 hidden items-center gap-1.5 rounded-md bg-emerald-950/60 px-2 py-1 text-[10px] text-amber-100/70 backdrop-blur sm:inline-flex">
            <Volume2 className="h-3 w-3" strokeWidth={2} />
            YouTube · companion video
          </div>
        </div>
      </motion.div>

      {/* Title + description */}
      <div className="space-y-2">
        <h3 className="font-bangla text-xl font-normal leading-snug text-emerald-950 dark:text-cream sm:text-2xl">
          {chapter.titleBn}
        </h3>
        <p className="font-display text-sm italic text-foreground/80">{chapter.titleEn}</p>
        <p className="pt-1 font-bangla-body text-sm leading-relaxed text-muted-foreground">
          {chapter.descriptionBn}
        </p>
        <p className="font-display text-xs italic text-foreground/75">
          {chapter.descriptionEn}
        </p>
      </div>

      {/* Action row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={onReset}
            className="h-10 rounded-xl border-border bg-card/60 px-4 text-sm font-medium backdrop-blur hover:border-amber-500/40"
          >
            <KeyRound className="h-4 w-4" strokeWidth={2.25} />
            অন্য অধ্যায় আনলক করুন
          </Button>
          <button
            type="button"
            onClick={enterFullscreen}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-700/30 bg-emerald-700/5 px-4 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-700/10 dark:text-amber-200"
          >
            <Maximize2 className="h-4 w-4" strokeWidth={2.25} />
            ফুলস্ক্রিন
          </button>
        </div>
        <a
          href="#chapters"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-medium text-cream transition-colors hover:bg-emerald-800"
        >
          সব অধ্যায় দেখুন
          <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} />
        </a>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chapters preview (loaded from the DB via /api/chapters-preview)    */
/* ------------------------------------------------------------------ */
function ChaptersPreview() {
  const reduce = useReducedMotion();
  const [chapters, setChapters] = useState<PreviewChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/chapters-preview", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (active && data.chapters) setChapters(data.chapters);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="chapters" className="relative py-14 sm:py-20 scroll-mt-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-50/50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-900 dark:bg-amber-400/10 dark:text-amber-200">
              <ScrollText className="h-3 w-3" strokeWidth={2.5} />
              Inside the book
            </span>
            <h2 className="mt-3 font-bangla text-2xl font-normal text-emerald-950 dark:text-cream sm:text-3xl">
              অধ্যায় অনুযায়ী ভিডিও
            </h2>
            <p className="mt-1.5 font-display text-sm italic text-muted-foreground">
              One video per chapter — unlocked by one code per chapter.
            </p>
          </div>
          <p className="max-w-sm font-bangla-body text-sm text-muted-foreground sm:text-right">
            প্রতিটি কার্ডে শুধু অধ্যায়ের নাম ও সময়কাল দেখানো হয়েছে — ভিডিও দেখতে বইয়ের কোড লাগবে।
          </p>
        </div>

        {/* Horizontal scroll list */}
        <div className="premium-scroll -mx-5 mt-7 flex snap-x gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ChapterCardSkeleton key={i} />
              ))
            : chapters.map((c, i) => (
                <ChapterCard key={`${c.chapter}-${i}`} chapter={c} index={i} reduce={!!reduce} />
              ))}
        </div>
      </div>
    </section>
  );
}

function ChapterCardSkeleton() {
  return (
    <div className="flex min-w-[78%] snap-start flex-col rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur sm:min-w-0">
      <div className="flex items-center justify-between">
        <div className="h-8 w-10 rounded-md bg-muted/60 animate-pulse" />
        <div className="h-9 w-9 rounded-lg bg-muted/60 animate-pulse" />
      </div>
      <div className="mt-4 h-4 w-3/4 rounded bg-muted/60 animate-pulse" />
      <div className="mt-2 h-3 w-1/2 rounded bg-muted/40 animate-pulse" />
      <div className="mt-5 h-px bg-border/60" />
      <div className="mt-3 h-3 w-1/3 rounded bg-muted/40 animate-pulse" />
    </div>
  );
}

function ChapterCard({
  chapter,
  index,
  reduce,
}: {
  chapter: PreviewChapter;
  index: number;
  reduce: boolean;
}) {
  const meta = CATEGORY_META[chapter.category];
  const Icon = meta.icon;
  return (
    <motion.a
      href="#unlock"
      initial={{ opacity: 0, y: reduce ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex min-w-[78%] snap-start flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/70 p-5 backdrop-blur transition-all hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-xl hover:shadow-emerald-950/10 sm:min-w-0"
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="font-display text-3xl font-semibold text-amber-700/40 dark:text-amber-300/30">
          {String(chapter.chapter).padStart(2, "0")}
        </span>
        <span
          className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${meta.accent} text-white shadow-md`}
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-4 font-bangla text-base font-normal leading-snug text-emerald-950 dark:text-cream">
        {chapter.titleBn}
      </h3>
      <p className="mt-1 font-display text-xs italic text-muted-foreground">
        {chapter.titleEn}
      </p>

      {/* Bottom row */}
      <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-3">
        <span className="font-bangla-body text-[11px] font-medium text-muted-foreground">
          {meta.bn} · <span className="font-display italic">{meta.en}</span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/5 px-2 py-0.5 font-mono text-[10px] text-muted-foreground dark:bg-amber-400/10">
          <Clock className="h-3 w-3" strokeWidth={2} />
          {chapter.duration}
        </span>
      </div>

      {/* Lock overlay */}
      <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-50/40 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-amber-700 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 dark:bg-amber-400/10 dark:text-amber-200">
        <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
        Locked
      </div>
    </motion.a>
  );
}

/* ------------------------------------------------------------------ */
/*  How it works                                                      */
/* ------------------------------------------------------------------ */
function HowItWorks() {
  const reduce = useReducedMotion();
  const steps = [
    {
      n: "01",
      icon: BookOpen,
      titleBn: "বইটি পড়ুন",
      titleEn: "Read the book",
      descBn: "প্রতিটি অধ্যায় পড়ার পর শেষ পৃষ্ঠায় একটি কোড পাবেন — টেক্সট ও QR দু'আকারে।",
      descEn: "At the end of each chapter, find a code printed as text and a scannable QR.",
    },
    {
      n: "02",
      icon: KeyRound,
      titleBn: "কোডটি দিন",
      titleEn: "Enter or scan the code",
      descBn: "এই পাতায় কোডটি লিখুন বা বইয়ের QR স্ক্যান করেন — কোড স্বয়ংক্রিয়ভাবে পূরণ হবে।",
      descEn: "Type the code here, or scan the book's QR — the field fills itself in.",
    },
    {
      n: "03",
      icon: PlayCircle,
      titleBn: "ভিডিও দেখুন",
      titleEn: "Watch the companion video",
      descBn: "শুধু সেই অধ্যায়ের ভিডিও খুলে যাবে — বই আর ভিডিও একসাথে চলবে।",
      descEn: "Only that chapter's video unlocks — book and video run side by side.",
    },
  ];

  return (
    <section id="how" className="relative pt-10 pb-14 sm:pt-14 sm:pb-20 scroll-mt-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-50/50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-900 dark:bg-amber-400/10 dark:text-amber-200">
            <Compass className="h-3 w-3" strokeWidth={2.5} />
            How this works
          </span>
          <h2 className="mt-3 font-bangla text-2xl font-normal text-emerald-950 dark:text-cream sm:text-3xl">
            বই থেকে ভিডিও — তিন ধাপে
          </h2>
          <p className="mx-auto mt-1.5 max-w-md font-display text-sm italic text-muted-foreground">
            From the printed page to the unlocked video — in three small steps.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: reduce ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/70 p-6 backdrop-blur transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-emerald-950/10"
              >
                {/* Big number watermark */}
                <span className="pointer-events-none absolute -right-2 -top-4 font-display text-7xl font-bold text-emerald-900/5 dark:text-amber-300/10">
                  {s.n}
                </span>

                <div className="relative">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-amber-300 shadow-lg shadow-emerald-900/20 ring-1 ring-amber-400/30">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                      Step {s.n}
                    </span>
                    <span className="gold-rule h-px flex-1" />
                  </div>
                  <h3 className="mt-2 font-bangla text-lg font-normal text-emerald-950 dark:text-cream">
                    {s.titleBn}
                  </h3>
                  <p className="mt-0.5 font-display text-sm italic text-muted-foreground">
                    {s.titleEn}
                  </p>
                  <p className="mt-3 font-bangla-body text-sm leading-relaxed text-muted-foreground">
                    {s.descBn}
                  </p>
                  <p className="mt-1.5 font-display text-xs italic text-foreground/65">
                    {s.descEn}
                  </p>
                </div>

                {/* Connector arrow */}
                {i < steps.length - 1 && (
                  <div className="pointer-events-none absolute -right-2.5 top-1/2 hidden -translate-y-1/2 md:block">
                    <ArrowRight className="h-5 w-5 text-amber-600/50" strokeWidth={2} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Honor system note                                                 */
/* ------------------------------------------------------------------ */
function HonorNote() {
  return (
    <section className="relative py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <motion.figure
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card relative overflow-hidden rounded-2xl p-7 sm:p-10"
        >
          {/* Big quote mark */}
          <span className="pointer-events-none absolute -left-2 -top-8 font-display text-[10rem] leading-none text-amber-500/15 dark:text-amber-300/10">
            &ldquo;
          </span>

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-50/50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-900 dark:bg-amber-400/10 dark:text-amber-200">
              <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
              Honesty note · সততার কথা
            </span>

            <blockquote className="mt-4 font-bangla text-lg font-normal leading-relaxed text-emerald-950 dark:text-cream sm:text-xl">
              কোডটি প্রতিটি বইয়ের কপিতে একই প্রিন্ট করা — আর এখানে কোনো লগইন নেই। কোড একবার
              কোনো WhatsApp গ্রুপে চলে গেলে সেটি কার্যত সবার জন্য খোলা হয়ে যাবে। এই সরলতাটা
              ইচ্ছে করেই রাখা হয়েছে — প্রিন্ট করা বইয়ের প্রশংসা যারা করে, তাদের ভালোবাসার জন্য।
            </blockquote>

            <figcaption className="mt-4 font-display text-sm italic text-muted-foreground">
              We accept this as a trade for simplicity — the printed book is the paid product,
              this tool is its companion. If leaks ever hurt sales, per-copy codes can be added
              later without rebuilding anything.
            </figcaption>

            <div className="mt-6 flex items-center gap-3 border-t border-amber-500/15 pt-5">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-emerald-700 to-emerald-900 text-amber-300 ring-1 ring-amber-400/30">
                <BookOpen className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div className="leading-tight">
                <div className="font-display text-sm font-semibold text-emerald-950 dark:text-cream">
                  IdeaForge BD
                </div>
                <div className="font-bangla-body text-[11px] text-muted-foreground">
                  বইয়ের সঙ্গী টুল · Companion Tool
                </div>
              </div>
            </div>
          </div>
        </motion.figure>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer (sticky to bottom)                                         */
/* ------------------------------------------------------------------ */
function SiteFooter({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  return (
    <footer className="mt-auto relative z-10 border-t border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <a href="#top" className="flex items-center gap-3">
              <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 ring-1 ring-amber-400/30">
                <BookOpen className="h-5 w-5 text-amber-300" strokeWidth={1.75} />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight text-emerald-950 dark:text-cream">
                IdeaForge<span className="text-gold-foil"> BD</span>
              </span>
            </a>
            <p className="mt-3 max-w-xs font-bangla-body text-sm leading-relaxed text-muted-foreground">
              বাংলাদেশের স্টাডি-অ্যাব্রোড গাইড বইয়ের সঙ্গী — যেখানে প্রতিটি অধ্যায় একটি কোড,
              আর প্রতিটি কোড একটি ভিডিও।
            </p>
          </div>

          {/* Quick links */}
          <div>
            <div className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-emerald-950/70 dark:text-amber-200/70">
              দ্রুত লিংক · Quick links
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="#unlock" className="font-bangla-body text-muted-foreground transition-colors hover:text-foreground">
                  কোড আনলক করুন
                </a>
              </li>
              <li>
                <a href="#chapters" className="font-bangla-body text-muted-foreground transition-colors hover:text-foreground">
                  অধ্যায়সমূহ
                </a>
              </li>
              <li>
                <a href="#how" className="font-bangla-body text-muted-foreground transition-colors hover:text-foreground">
                  কীভাবে কাজ করে
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <div className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-emerald-950/70 dark:text-amber-200/70">
              সম্পর্কে · About
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="font-bangla-body text-muted-foreground">প্রিন্ট বই প্রকাশ: ডিসেম্বর</li>
              <li className="font-bangla-body text-muted-foreground">ভিডিও: YouTube Unlisted</li>
              <li className="font-bangla-body text-muted-foreground">কোনো পেমেন্ট নেই · No payment</li>
              <li className="font-bangla-body text-muted-foreground">কোনো লগইন নেই · No login</li>
            </ul>
          </div>
        </div>

        <div className="gold-rule mt-8" />

        <div className="mt-6 flex flex-col gap-3 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="font-bangla-body">
            © {new Date().getFullYear()} IdeaForge BD · সর্বস্বত্ব সংরক্ষিত · All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAdmin}
              className="group inline-flex items-center gap-1 font-display italic transition-colors hover:text-foreground"
              title="Admin dashboard · Ctrl/⌘ + Shift + A"
            >
              <Lock className="h-3 w-3 transition-colors group-hover:text-amber-600" strokeWidth={2} />
              Admin
            </button>
            <span className="text-muted-foreground/40">·</span>
            <span className="font-display italic">
              Built as a companion to the printed book, not a replacement for it.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
