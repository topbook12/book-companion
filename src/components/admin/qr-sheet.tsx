"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Printer, Loader2, FileText } from "lucide-react";

/**
 * Renders a single printable sheet containing every chapter's QR card.
 * Triggered by the admin toolbar "সব QR প্রিন্ট করুন" button.
 *
 * Opens a dedicated print window with print-ready CSS so the printer can
 * directly use the output (or the user can "Save as PDF" for the book
 * designer / publisher).
 */

type SheetChapter = {
  code: string;
  chapterNumber: number;
  titleBn: string;
  titleEn: string;
  duration?: string;
};

type QrItem = { chapter: SheetChapter; dataUrl: string };

export function PrintAllQrSheet({
  chapters,
  siteLabel,
}: {
  chapters: SheetChapter[];
  siteLabel?: string;
}) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://ideaforgebd.com";
  const label = siteLabel || "ideaforgebd.com";
  const [items, setItems] = useState<QrItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const out: QrItem[] = [];
      for (const c of chapters) {
        try {
          const url = `${origin}/?code=${encodeURIComponent(c.code)}`;
          const dataUrl = await QRCode.toDataURL(url, {
            width: 360,
            margin: 1,
            errorCorrectionLevel: "H",
            color: { dark: "#0b3b2e", light: "#fffdf5" },
          });
          out.push({ chapter: c, dataUrl });
        } catch {
          // skip
        }
      }
      if (active) {
        setItems(out);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [chapters, origin]);

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-700 dark:text-amber-300" strokeWidth={2} />
      </div>
    );
  }

  return (
    <div id="qr-sheet-root" className="qr-print-sheet">
      <div className="sheet-header">
        <div className="sheet-brand">
          <div className="sheet-brand-mark">IF</div>
          <div>
            <div className="sheet-brand-name">IdeaForge BD</div>
            <div className="sheet-brand-sub">Study Abroad Companion · QR Print Sheet</div>
          </div>
        </div>
        <div className="sheet-meta">
          <div>{items.length} অধ্যায় · chapters</div>
          <div className="sheet-meta-url">{label}</div>
        </div>
      </div>

      <div className="sheet-grid">
        {items.map(({ chapter, dataUrl }) => (
          <SheetCard
            key={chapter.code}
            chapter={chapter}
            dataUrl={dataUrl}
            siteLabel={label}
          />
        ))}
      </div>

      <div className="sheet-footer">
        প্রিন্ট করে প্রতিটি কার্ড সংশ্লিষ্ট অধ্যায়ের শেষ পৃষ্ঠায় যোগ করুন। · Print and place each
        card at the end of its chapter.
      </div>
    </div>
  );
}

function SheetCard({
  chapter,
  dataUrl,
  siteLabel,
}: {
  chapter: SheetChapter;
  dataUrl: string;
  siteLabel: string;
}) {
  const unlockUrl = `/?code=${encodeURIComponent(chapter.code)}`;
  return (
    <div className="sheet-card">
      <div className="sheet-card-top">
        <div className="sheet-card-brand">
          <div className="sheet-card-mark">IF</div>
          <div>
            <div className="sheet-card-brand-name">IdeaForge BD</div>
            <div className="sheet-card-brand-sub">Study Abroad Companion</div>
          </div>
        </div>
        <div className="sheet-card-ch">CH {String(chapter.chapterNumber).padStart(2, "0")}</div>
      </div>

      <div className="sheet-card-title">{chapter.titleBn}</div>
      <div className="sheet-card-subtitle">{chapter.titleEn}</div>

      <div className="sheet-card-body">
        <div className="sheet-card-qr">
          <img src={dataUrl} alt={`QR for ${chapter.code}`} width={150} height={150} />
        </div>
        <div className="sheet-card-code-wrap">
          <div className="sheet-card-code-label">কোড · Code</div>
          <div className="sheet-card-code">{chapter.code}</div>
          {chapter.duration ? (
            <div className="sheet-card-duration">⏱ {chapter.duration}</div>
          ) : null}
        </div>
      </div>

      <div className="sheet-card-instr">
        <span className="font-semibold">কীভাবে দেখবেন:</span> QR স্ক্যান করুন অথবা উপরের কোডটি লিখুন{" "}
        <span className="font-semibold" style={{ color: "#a16207" }}>{siteLabel}</span>-এ। তারপর "ভিডিও আনলক করুন" বাটনে চাপ দিন।
      </div>
      <div className="sheet-card-instr-en">
        Scan the QR or type the code at <strong>{siteLabel}</strong>, then press Unlock to watch this chapter's video.
      </div>
    </div>
  );
}

/**
 * Opens a print window containing only the QR sheet.
 */
export function printQrSheet(
  chapters: SheetChapter[],
  siteLabel: string
): void {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://ideaforgebd.com";

  // We render the sheet synchronously to HTML (without waiting for async QR
  // generation). Instead, we generate all QR data URLs first, then open the
  // print window with the fully-formed HTML.
  (async () => {
    const items: { chapter: SheetChapter; dataUrl: string }[] = [];
    for (const c of chapters) {
      try {
        const url = `${origin}/?code=${encodeURIComponent(c.code)}`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 360,
          margin: 1,
          errorCorrectionLevel: "H",
          color: { dark: "#0b3b2e", light: "#fffdf5" },
        });
        items.push({ chapter: c, dataUrl });
      } catch {
        // skip
      }
    }

    const cardsHtml = items
      .map(({ chapter, dataUrl }) => {
        const ch = String(chapter.chapterNumber).padStart(2, "0");
        return `
        <div class="sheet-card">
          <div class="sheet-card-top">
            <div class="sheet-card-brand">
              <div class="sheet-card-mark">IF</div>
              <div>
                <div class="sheet-card-brand-name">IdeaForge BD</div>
                <div class="sheet-card-brand-sub">Study Abroad Companion</div>
              </div>
            </div>
            <div class="sheet-card-ch">CH ${ch}</div>
          </div>
          <div class="sheet-card-title">${escapeHtml(chapter.titleBn)}</div>
          <div class="sheet-card-subtitle">${escapeHtml(chapter.titleEn)}</div>
          <div class="sheet-card-body">
            <div class="sheet-card-qr"><img src="${dataUrl}" width="150" height="150" alt="QR" /></div>
            <div class="sheet-card-code-wrap">
              <div class="sheet-card-code-label">কোড · Code</div>
              <div class="sheet-card-code">${escapeHtml(chapter.code)}</div>
              ${chapter.duration ? `<div class="sheet-card-duration">⏱ ${escapeHtml(chapter.duration)}</div>` : ""}
            </div>
          </div>
          <div class="sheet-card-instr"><span class="font-semibold">কীভাবে দেখবেন:</span> QR স্ক্যান করুন অথবা উপরের কোডটি লিখুন <span class="font-semibold" style="color:#a16207">${siteLabel}</span>-এ। তারপর "ভিডিও আনলক করুন" বাটনে চাপ দিন।</div>
          <div class="sheet-card-instr-en">Scan the QR or type the code at <strong>${siteLabel}</strong>, then press Unlock to watch this chapter's video.</div>
        </div>`;
      })
      .join("");

    const html = `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8" />
<title>IdeaForge BD — QR Print Sheet</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, 'Tiro Bangla', serif; background: #fff; color: #0b3b2e; padding: 18mm 14mm; }
  @page { margin: 10mm; }
  .sheet-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0b3b2e; padding-bottom: 10px; margin-bottom: 18px; }
  .sheet-brand { display: flex; align-items: center; gap: 10px; }
  .sheet-brand-mark { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #0b3b2e, #14503f); color: #fbbf24; display: grid; place-items: center; font-weight: 700; font-size: 13px; box-shadow: 0 0 0 1px rgba(180,140,40,0.4); }
  .sheet-brand-name { font-weight: 700; font-size: 16px; letter-spacing: -0.01em; }
  .sheet-brand-sub { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #6b5d3f; }
  .sheet-meta { text-align: right; font-size: 11px; color: #6b5d3f; }
  .sheet-meta-url { font-style: italic; }
  .sheet-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .sheet-card { border: 2px solid rgba(180,140,40,0.4); border-radius: 14px; padding: 16px; background: #fffdf5; break-inside: avoid; page-break-inside: avoid; }
  .sheet-card-top { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(180,140,40,0.25); padding-bottom: 8px; }
  .sheet-card-brand { display: flex; align-items: center; gap: 8px; }
  .sheet-card-mark { width: 28px; height: 28px; border-radius: 6px; background: linear-gradient(135deg, #0b3b2e, #14503f); color: #fbbf24; display: grid; place-items: center; font-weight: 700; font-size: 10px; box-shadow: 0 0 0 1px rgba(180,140,40,0.4); }
  .sheet-card-brand-name { font-weight: 700; font-size: 12px; color: #0b3b2e; }
  .sheet-card-brand-sub { font-size: 8px; letter-spacing: 0.16em; text-transform: uppercase; color: #6b5d3f; }
  .sheet-card-ch { background: #0b3b2e; color: #fbbf24; padding: 3px 8px; border-radius: 5px; font-size: 9px; font-weight: 700; letter-spacing: 0.05em; }
  .sheet-card-title { font-size: 15px; font-weight: 600; line-height: 1.25; margin-top: 8px; color: #0b3b2e; }
  .sheet-card-subtitle { font-size: 11px; font-style: italic; color: #6b5d3f; margin-top: 2px; }
  .sheet-card-body { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
  .sheet-card-qr { width: 150px; height: 150px; flex-shrink: 0; border: 1px solid rgba(180,140,40,0.3); border-radius: 8px; overflow: hidden; background: #fffdf5; }
  .sheet-card-qr img { display: block; }
  .sheet-card-code-wrap { flex: 1; min-width: 0; }
  .sheet-card-code-label { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #6b5d3f; font-weight: 600; }
  .sheet-card-code { font-family: ui-monospace, 'Courier New', monospace; font-size: 15px; font-weight: 700; letter-spacing: 0.06em; color: #0b3b2e; padding: 6px 8px; background: rgba(180,140,40,0.08); border-radius: 6px; border: 1px dashed rgba(180,140,40,0.35); margin-top: 4px; word-break: break-all; }
  .sheet-card-duration { font-size: 10px; color: #6b5d3f; margin-top: 8px; }
  .sheet-card-instr { font-size: 10px; line-height: 1.4; color: #0b3b2e; border-top: 1px solid rgba(180,140,40,0.25); margin-top: 12px; padding-top: 8px; }
  .sheet-card-instr .font-semibold { font-weight: 600; }
  .sheet-card-instr-en { font-size: 9px; font-style: italic; color: #6b5d3f; margin-top: 4px; }
  .sheet-footer { margin-top: 18px; border-top: 1px solid rgba(180,140,40,0.25); padding-top: 10px; text-align: center; font-size: 10px; color: #6b5d3f; font-style: italic; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <div class="sheet-header">
    <div class="sheet-brand">
      <div class="sheet-brand-mark">IF</div>
      <div>
        <div class="sheet-brand-name">IdeaForge BD</div>
        <div class="sheet-brand-sub">Study Abroad Companion · QR Print Sheet</div>
      </div>
    </div>
    <div class="sheet-meta">
      <div>${items.length} অধ্যায় · chapters</div>
      <div class="sheet-meta-url">${siteLabel}</div>
    </div>
  </div>
  <div class="sheet-grid">
    ${cardsHtml}
  </div>
  <div class="sheet-footer">প্রিন্ট করে প্রতিটি কার্ড সংশ্লিষ্ট অধ্যায়ের শেষ পৃষ্ঠায় যোগ করুন। · Print and place each card at the end of its chapter.</div>
</body>
</html>`;

    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      // Don't auto-close — let user save as PDF if they want.
    }, 600);
  })();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Toolbar trigger button. Parent handles the actual print call.
 */
export function PrintAllButton({
  chapters,
  siteLabel = "ideaforgebd.com",
}: {
  chapters: SheetChapter[];
  siteLabel?: string;
}) {
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  const handle = () => {
    if (busy) return;
    setBusy(true);
    try {
      printQrSheet(chapters, siteLabel);
    } finally {
      setTimeout(() => setBusy(false), 1200);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handle}
      disabled={busy || chapters.length === 0}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-50/60 px-3 text-xs font-semibold text-emerald-900 transition-colors hover:bg-amber-50 disabled:opacity-60 dark:bg-amber-400/10 dark:text-amber-200"
      title="সব অধ্যায়ের QR কোড একসাথে প্রিন্ট করুন"
    >
      {busy ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
          তৈরি হচ্ছে…
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" strokeWidth={2.25} />
          সব QR প্রিন্ট করুন
          <Printer className="h-3.5 w-3.5" strokeWidth={2.5} />
        </>
      )}
    </button>
  );
}
