# IdeaForge BD — Book Video Unlock Companion Tool

A single-page bilingual (Bangla + English) companion tool for the IdeaForge BD
study-abroad guide book. Each chapter in the printed book carries a code (and a
QR code that encodes the unlock URL). Readers scan/type the code to unlock that
chapter's companion YouTube video. Includes a premium admin dashboard for
managing chapters + generating book-printable QR cards.

## Tech stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui + custom premium theme
- **Animation:** Framer Motion
- **Auth:** HMAC-signed session cookies (Node `crypto` scrypt) — no DB needed
- **Data:** `data/chapters.json` (git-tracked, serverless-safe) — **no database**
- **QR:** `qrcode` (client-side) + `html-to-image` (PNG export)
- **Deploy target:** Vercel (serverless)

## Architecture: why no database?

Vercel runs on serverless functions with an **ephemeral filesystem** — a
SQLite database file would reset on every cold start and wouldn't be shared
across function instances. Since the chapter list is tiny (~8-20 rows) and
changes rarely, we store it as `data/chapters.json` which is:

- ✅ **Git-tracked** — every chapter change is version-controlled
- ✅ **Serverless-safe** — bundled with the deployment, reads anywhere
- ✅ **Zero-ops** — no DB to provision, no migrations, no connection limits
- ✅ **Portable** — works on Vercel, Netlify, Cloudflare, self-hosted, anywhere

**Trade-off:** in production (read-only FS), chapters can't be added from the
dashboard — you edit `data/chapters.json` and `git push`. In local dev the
dashboard CAN write to the file (the filesystem is writable).

## Local development

```bash
bun install
bun run dev          # http://localhost:3000
```

The admin dashboard works out-of-the-box with the dev default password
(`IdeaForge@BD2024!xK9wQ`). To override, copy `.env.example` to `.env.local`
and set `ADMIN_USERNAME`, `ADMIN_PASSWORD` (or `ADMIN_PASSWORD_HASH`),
and `ADMIN_SESSION_SECRET`.

## Deploy on Vercel

### 1. Push to GitHub
```bash
git init && git add -A && git commit -m "IdeaForge BD book companion"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import on Vercel
- Go to <https://vercel.com/new>
- Import your GitHub repo
- Framework Preset: **Next.js** (auto-detected)
- Root Directory: `./`
- Build command / Install command: leave defaults
- Click **Deploy**

### 3. Set environment variables
In Vercel → Project → Settings → Environment Variables, add:

| Variable | Value | Notes |
|---|---|---|
| `ADMIN_USERNAME` | `admin` | The admin login username |
| `ADMIN_PASSWORD_HASH` | `<salt:hash>` | Generate locally with `bun scripts/hash-password.ts` |
| `ADMIN_SESSION_SECRET` | `<32+ random chars>` | Generate with `openssl rand -hex 32` |

> **Why `ADMIN_PASSWORD_HASH` instead of `ADMIN_PASSWORD`?**
> The hash form keeps the password out of the env-var audit log and avoids
> any chance of leaking plaintext via a misconfigured log. Generate with:
> ```bash
> bun scripts/hash-password.ts "your-strong-password-here"
> ```
> Copy the printed `salt:hash` string into `ADMIN_PASSWORD_HASH`.

### 4. Redeploy
After setting the env vars, trigger a redeploy (Vercel does this
automatically for new env-var assignments on Production).

### 5. Open the deployed site
- Reader page: `https://<your-project>.vercel.app/`
- QR prefill: `https://<your-project>.vercel.app/?code=IFB-SOP-03`
- Admin dashboard: `https://<your-project>.vercel.app/#admin`
  (or footer → Admin, or `Ctrl/⌘ + Shift + A`)

## Editing chapters in production

Because Vercel's filesystem is read-only, the dashboard's
**add / edit / delete** buttons return a friendly hint in production. To
update chapters:

1. Edit `data/chapters.json` locally (or directly on GitHub's web editor)
2. Commit + push
3. Vercel auto-redeploys; the new chapters are live within ~1 minute

The dashboard's **QR card download / print / "print all"** features DO work in
production — they're client-side and don't need a writable FS.

## Admin dashboard quick reference

| Action | Where |
|---|---|
| Open dashboard | Footer → "Admin" · `Ctrl/⌘+Shift+A` · URL `#admin` |
| Login | Username + password (env-configured) |
| Add chapter | "নতুন অধ্যায়" (local dev only — production: edit JSON) |
| View QR card | Click QR icon on any chapter row → QR auto-opens on create |
| Download QR PNG | "QR কার্ড ডাউনলোড" (3× resolution, print-ready) |
| Print single QR | "প্রিন্ট করুন" (opens native print dialog) |
| Print all QRs | Toolbar → "সব QR প্রিন্ট করুন" (full 2-column sheet) |
| Toggle active/inactive | Power icon on a chapter row |
| Logout | "লগআউট" |

## Public reader flow

1. Reader finds the chapter's QR code in the printed book (last page of chapter)
2. Scans it → lands on `https://site/?code=IFB-IELTS-01`
3. Page auto-scrolls to the unlock card + shows "বইয়ের QR স্ক্যান করেছেন" notice
4. Code is pre-filled in the input
5. Presses "ভিডিও আনলক করুন" → YouTube video unlocks
6. "ফুলস্ক্রিন" button at the top-right expands the video for immersive viewing

## Project structure

```
.
├── data/
│   └── chapters.json          # Source of truth — git-tracked, serverless-safe
├── scripts/
│   └── hash-password.ts       # Generate ADMIN_PASSWORD_HASH for Vercel env
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/{login,logout,session,chapters,chapters/[id]}/route.ts
│   │   │   ├── unlock/route.ts
│   │   │   └── chapters-preview/route.ts
│   │   ├── layout.tsx          # Bengali + Latin serif fonts
│   │   ├── page.tsx            # Premium single-page UI
│   │   └── globals.css         # Premium theme + utilities
│   ├── components/
│   │   ├── admin/
│   │   │   ├── admin-dashboard.tsx  # Admin overlay (login + chapter CRUD + QR)
│   │   │   ├── qr-card.tsx         # Premium printable QR card
│   │   │   └── qr-sheet.tsx        # "Print all" sheet generator
│   │   └── ui/                 # shadcn/ui components
│   └── lib/
│       ├── auth.ts             # scrypt + HMAC session (env-based admin)
│       ├── chapters.ts         # JSON-file adapter (read/write + cache)
│       └── utils.ts
├── public/assets/              # AI-generated hero + book-key images
├── vercel.json                 # Regions + security headers
└── .env.example                # Copy to .env.local for dev
```

## License & credits

Built for IdeaForge BD. Premium emerald + gold + cream bilingual UI.
All chapter content © IdeaForge BD. Companion videos hosted on YouTube (Unlisted).
