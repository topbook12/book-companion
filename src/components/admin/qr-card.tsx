"use client";

import { forwardRef, useEffect, useState } from "react";
import QRCode from "qrcode";
import { toPng } from "html-to-image";
import { Download, Printer, Loader2 } from "lucide-react";

/**
 * Premium printable QR card for a single chapter.
 *
 * This is what the admin downloads / prints and physically inserts into the
 * book. It contains:
 *   - The book branding (IdeaForge BD)
 *   - The chapter number + bilingual title
 *   - A large, scannable QR that encodes the unlock URL (?code=IFB-XXXX-XX)
 *   - The human-readable code as a typed fallback (per the blueprint's
 *     "QR + typed code, both" rule — entry-level phone cameras scan unreliably)
 *   - Short bilingual instructions
 *
 * The card is designed to look good both on-screen and on paper. It uses a
 * fixed-ish aspect ratio and print-safe colors.
 */

export type QrCardChapter = {
  code: string;
  chapterNumber: number;
  titleBn: string;
  titleEn: string;
  duration?: string;
  category?: string;
};

const QrCard = forwardRef<
  HTMLDivElement,
  {
    chapter: QrCardChapter;
    unlockUrl: string;
    siteLabel?: string;
    compact?: boolean;
  }
>(function QrCard({ chapter, unlockUrl, siteLabel = "ideaforgebd.com", compact = false }, ref) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(unlockUrl, {
      width: compact ? 360 : 480,
      margin: 1,
      errorCorrectionLevel: "H", // high — survives a little ink bleed in print
      color: {
        dark: "#0b3b2e", // deep emerald
        light: "#fffdf5", // warm cream
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl("");
      });
    return () => {
      active = false;
    };
  }, [unlockUrl, compact]);

  return (
    <div
      ref={ref}
      className="qr-card relative flex flex-col overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-[#fffdf5] text-emerald-950"
      style={{
        width: "100%",
        maxWidth: compact ? 360 : 420,
        padding: compact ? 18 : 24,
        boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 0 0 1px rgba(180,140,40,0.18)",
      }}
    >
      {/* Top brand strip */}
      <div className="flex items-center justify-between border-b border-amber-700/25 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="grid place-items-center rounded-lg"
            style={{
              width: 34,
              height: 34,
              background: "linear-gradient(135deg, #0b3b2e, #14503f)",
              boxShadow: "0 0 0 1px rgba(180,140,40,0.4)",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <div className="leading-tight">
            <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", color: "#0b3b2e" }}>
              IdeaForge <span style={{ color: "#a16207" }}>BD</span>
            </div>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6b5d3f" }}>
              Study Abroad Companion
            </div>
          </div>
        </div>
        <div
          className="rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: "#0b3b2e", color: "#fbbf24" }}
        >
          Ch {String(chapter.chapterNumber).padStart(2, "0")}
        </div>
      </div>

      {/* Chapter title */}
      <div className="mt-3">
        <div style={{ fontFamily: "Georgia, 'Tiro Bangla', serif", fontSize: compact ? 15 : 17, fontWeight: 500, lineHeight: 1.25, color: "#0b3b2e" }}>
          {chapter.titleBn}
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11, color: "#6b5d3f", marginTop: 2 }}>
          {chapter.titleEn}
        </div>
      </div>

      {/* QR + code row */}
      <div className="mt-4 flex items-center gap-4">
        <div
          className="shrink-0 overflow-hidden rounded-lg"
          style={{
            width: compact ? 140 : 168,
            height: compact ? 140 : 168,
            background: "#fffdf5",
            border: "1px solid rgba(180,140,40,0.3)",
          }}
        >
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={`QR for ${chapter.code}`} width={compact ? 140 : 168} height={compact ? 140 : 168} style={{ display: "block" }} />
          ) : (
            <div className="grid h-full w-full place-items-center" style={{ fontSize: 10, color: "#6b5d3f" }}>
              QR…
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6b5d3f", fontWeight: 600 }}>
            কোড · Code
          </div>
          <div
            className="mt-1 break-all"
            style={{
              fontFamily: "ui-monospace, 'Courier New', monospace",
              fontSize: compact ? 15 : 17,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#0b3b2e",
              padding: "6px 8px",
              background: "rgba(180,140,40,0.08)",
              borderRadius: 6,
              border: "1px dashed rgba(180,140,40,0.35)",
            }}
          >
            {chapter.code}
          </div>
          {chapter.duration ? (
            <div className="mt-2 flex items-center gap-1.5" style={{ fontSize: 10, color: "#6b5d3f" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {chapter.duration}
            </div>
          ) : null}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 border-t border-amber-700/25 pt-3">
        <div style={{ fontSize: 11, lineHeight: 1.45, color: "#0b3b2e" }}>
          <span style={{ fontWeight: 600 }}>কীভাবে দেখবেন:</span> QR স্ক্যান করুন অথবা উপরের কোডটি লিখুন{" "}
          <span style={{ fontWeight: 600, color: "#a16207" }}>{siteLabel}</span>-এ। তারপর "ভিডিও আনলক করুন" বাটনে চাপ দিন।
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 10, color: "#6b5d3f", marginTop: 4 }}>
          Scan the QR or type the code at <span style={{ fontWeight: 600, fontStyle: "normal" }}>{siteLabel}</span>, then press Unlock to watch this chapter's video.
        </div>
      </div>

      {/* Footer line */}
      <div className="mt-3 flex items-center justify-between" style={{ fontSize: 9, color: "#8a7a52" }}>
        <span style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>Book Companion Tool</span>
        <span style={{ fontStyle: "italic" }}>{siteLabel}</span>
      </div>
    </div>
  );
});

export default QrCard;

/* ------------------------------------------------------------------ */
/*  Download + Print helpers                                          */
/* ------------------------------------------------------------------ */

export async function downloadCardAsPng(node: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toPng(node, {
    pixelRatio: 3, // crisp for print
    cacheBust: true,
    backgroundColor: "#fffdf5",
  });
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/**
 * Print a single QR card. We create a hidden iframe, write the card's HTML
 * cloned into it, and call print. This keeps the rest of the page out of the
 * print job.
 */
export function printCard(node: HTMLElement): void {
  const w = window.open("", "_blank", "width=520,height=720");
  if (!w) return;
  const style = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; font-family: Georgia, serif; }
    @page { margin: 12mm; }
  `;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>QR — print</title><style>${style}</style></head><body>${node.outerHTML}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
    w.close();
  }, 350);
}

/* ------------------------------------------------------------------ */
/*  Action buttons (Download PNG + Print)                             */
/* ------------------------------------------------------------------ */

export function QrCardActions({
  cardRef,
  filename,
  onPrinted,
}: {
  cardRef: React.RefObject<HTMLDivElement | null>;
  filename: string;
  onPrinted?: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      await downloadCardAsPng(cardRef.current, filename);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      // ignore
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!cardRef.current) return;
    printCard(cardRef.current);
    onPrinted?.();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="btn-gold inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition-all disabled:opacity-60"
      >
        {downloading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
            ডাউনলোড হচ্ছে…
          </>
        ) : done ? (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            সম্পন্ন
          </>
        ) : (
          <>
            <Download className="h-4 w-4" strokeWidth={2.5} />
            QR কার্ড ডাউনলোড
          </>
        )}
      </button>
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-700/30 bg-emerald-700/5 px-4 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-700/10 dark:text-amber-200"
      >
        <Printer className="h-4 w-4" strokeWidth={2.5} />
        প্রিন্ট করুন
      </button>
    </div>
  );
}
