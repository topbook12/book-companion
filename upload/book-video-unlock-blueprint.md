# [Book Name TBD] — Video Unlock Companion Tool
### Product Blueprint — IdeaForge BD

**Assumptions stated up front (confirm before build):**
- Web-only, single lightweight page — no app, no PWA install step needed
- No student accounts — code entry alone gates access
- Same code is printed identically in every physical book copy (accepted trade-off: simplicity over per-copy security)
- No separate payment/monetization on this site at MVP — the physical book is the paid product; this tool is a value-add bundled into it
- Videos are hosted on YouTube (Unlisted), embedded via IFrame

---

## 1. Project Overview

A single-page companion tool for the study-abroad guide book. Each chapter of the book carries a printed access code. A reader types (or scans a QR code that auto-fills) that code on this page, and it unlocks the exact YouTube video tied to that chapter — nothing else. There's no login, no dashboard, no app: just a code box and a locked video player, designed to make the printed book (not a photocopy or PDF scan) the only easy way in.

## 2. Problem & Target Users

**Who:** Bangladeshi students preparing to apply for higher education abroad — reading the printed/PDF guide book for IELTS/SOP/visa/scholarship guidance.

**Real problem:** Some parts of the application process (SOP writing walkthroughs, interview prep, document formatting demos) are explained better on video than in print. But if those videos are just sitting publicly findable on YouTube, they undercut the reason to buy the book — anyone can screenshot the topic name and search for it. The lock mechanic exists to keep the video content feeling exclusive to buyers, not to solve a technical piracy problem.

**Bangladesh context note:** Access codes and PDFs circulate fast in BD student Facebook groups and WhatsApp groups. This design accepts that reality rather than fighting it — see the honesty flag in Section 7.

## 3. Business Model & Revenue Strategy

- The book (print + PDF) is the actual revenue product, sold through the existing coaching-style print/distribution channel.
- This website does not charge anything and has no ads at MVP — its only job is to protect and add value to book sales, not generate independent revenue.
- Any future monetization on top of this tool is listed under Premium Features below as optional next steps, not part of the current build.

## 4. MVP / Core Features

| Feature | Description | Why it's core |
|---|---|---|
| Code entry field | Single input box + submit button on the homepage | The entire product is this one interaction |
| Code → video lookup | Matches entered code against a fixed list mapping chapter code → YouTube video ID | Core unlock logic |
| Video playback | Embeds the matched YouTube video (Unlisted) via IFrame player once code is correct | Delivers the actual reward |
| Wrong-code message | Clear bilingual error ("কোডটি সঠিক নয় / Incorrect code, please check your book") | Prevents confusion, no accounts to fall back on for support |
| Bilingual UI | Bangla-primary with English labels mixed in, matching the book's own bilingual style | Matches how the book itself reads |
| Mobile-first responsive layout | Single page, no heavy JS framework, fast load on 3G/4G | Most readers will open this on a phone |
| Editable code list | Code-to-video mapping kept in one simple config file (JSON) that Topu can update himself | Lets Topu add/fix chapters without touching site logic |
| "How this works" note | One short paragraph explaining the code is inside the physical book | Sets expectation for first-time visitors who land here without a book |

## 5. Premium Features (not in MVP — future paid add-ons)

| Feature | Description | Monetization Rationale |
|---|---|---|
| Bonus video pack code | A second, separately-sold code unlocking extra content (mock interview reactions, SOP teardown examples) | Upsell beyond the base book price without reprinting the whole book |
| Live doubt-solving session code | A code that reveals a scheduled WhatsApp/Zoom Q&A link | Creates a recurring reason to re-engage buyers instead of a one-time unlock |
| Downloadable checklist/template pack | SOP templates, document checklists, unlocked by a premium code | Low-cost digital add-on that justifies a "Deluxe edition" price tier |

## 6. Future / Scalability Roadmap

| Feature | Phase | Growth Rationale |
|---|---|---|
| Anonymous code-usage analytics | Phase 2 | Shows which chapters/videos get watched most — informs what to expand in the next book edition |
| Per-copy unique codes + redemption tracking | Phase 2 | Upgrade path if code-leaking meaningfully hurts book sales later |
| Lightweight optional accounts | Phase 3 | Enables recognizing returning readers across future book editions or add-on courses |
| Move off YouTube to a controlled player | Phase 3 | Removes dependence on YouTube's embed/removal policies once volume justifies hosting cost |
| Expand into a full platform (mock tests, mentor booking) | Phase 3 | Turns a one-off book add-on into an ongoing product line, if demand shows up |

## 7. Bangladesh-Specific Considerations

- **Payment:** Not applicable on this site at MVP — the book itself is sold through the existing print/coaching distribution flow, separate from this tool.
- **Trust:** No payment or personal data is collected here, so trust-building is mainly about clarity — the page should make it obvious in one glance that you just need your book's code, nothing else.
- **Connectivity:** Keep this to one lightweight HTML page with no heavy framework — students will often be on inconsistent mobile data, and the YouTube player already handles adaptive quality on its own.
- **Language:** Bangla-primary, English mixed in for technical terms — matching the book's own bilingual style.
- **Honesty flag on the code model:** Because the same code is printed in every copy and there are no accounts, once a code is shared in a Facebook or WhatsApp group — which is common behavior in BD student communities — that video becomes effectively public for anyone who has the code, indefinitely. This was discussed and accepted for simplicity. If leak rate becomes a real problem later, Section 6's per-copy tracking option addresses it without a full rebuild.
- **QR + typed code, both:** Print both a scannable QR code and the plain text code underneath it in the book. Many entry-level phone cameras scan QR codes unreliably, and a reader watching on a laptop next to their book will prefer typing it manually.

## 8. Success Metrics (KPIs)

- Number of unique code-entry sessions vs. estimated books in circulation (rough adoption rate, since there are no accounts to track individuals)
- Code entries per chapter (which topics get watched most)
- Wrong-code attempt rate (high rate signals unclear printing or confusing instructions)
- Video watch-through rate per chapter (via YouTube's own video analytics)
- Direct qualitative feedback from readers (e.g., a WhatsApp number or short feedback link shown after a video)

## 9. Notes for the Dev Team

**Assumptions made (confirm before build):**
- Single-page web app, no PWA install prompt, no native app
- No backend database or user accounts — code list is a static config file
- Code list is small enough (per book edition) to live in a JSON file Topu edits directly

**Open decisions still needed from Topu:**
- Final working name for the book/site (not yet decided)
- Should the code list be editable without a redeploy (e.g., fetched live from a Google Sheet) or is updating and redeploying before each print run acceptable?
- Should the QR code encode a direct link that auto-fills the code (e.g., `site.com/unlock?code=XYZ`), or should it just be a visual backup next to the typed code? (Recommend supporting both.)
- Final code format/length — needs to be decided together with the printer for QR legibility at the book's final page size
- Site launch timing — book's print deadline is December; confirm whether this tool must go live simultaneously or can follow shortly after (PDF release could point to a temporary "coming soon" page)

**Flagged technical realism:**
- YouTube videos must be at least "Unlisted" to embed anywhere outside the owner's account. This code page controls the *convenient* path to the video — it does not make the video technically un-shareable once someone has the link.
