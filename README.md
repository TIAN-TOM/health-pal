# Health Pal (健康生活伴侣)

[![CI](https://github.com/TIAN-TOM/health-pal/actions/workflows/ci.yml/badge.svg)](https://github.com/TIAN-TOM/health-pal/actions/workflows/ci.yml)

A Chinese-language, mobile-first health companion for elderly users managing chronic conditions — Ménière's disease and diabetes in particular. Alongside symptom and glucose tracking it bundles the things that keep an older user opening the app every day: check-ins, a points shop, casual games, family coordination and weather warnings.

Live at [health-pal.lovable.app](https://health-pal.lovable.app). The product UI is entirely Chinese.

## Design for elderly users

The target user is in their seventies, on a phone, possibly dizzy at the moment they reach for the app. That translates into concrete rules:

- Touch targets at least 44px; primary actions are full-width buttons.
- Global font scaling from 16px to 24px, set once and applied everywhere.
- No timed auto-navigation. Nothing disappears or redirects on its own.
- Form errors render inline with `aria-describedby` wiring, never toast-only.
- Informational text stays at readable contrast in light mode; dark mode remaps hardcoded light classes centrally in `src/index.css`.
- Emergency mode is reachable from the home screen in one tap.

## Features

**Health records** — Ménière/dizziness episodes with symptoms and triggers, blood glucose with meal context, medication schedules and dose logging, medical records and appointments, voice notes.

**Daily rhythm** — daily check-in with mood tracking and streaks, points awarded server-side with a small store to spend them in, guided breathing, a shelf of casual games (2048 and Tetris through to online-multiplayer Gomoku), daily English practice and a health education library.

**Family** — shared calendar, reminders, messages and an expense log for the household, plus member profiles with birthdays.

**Safety** — emergency mode with SOS contacts, an emergency-contact directory and severe-weather alert banners.

**Data and insight** — a daily data hub, AI-generated weekly health summaries, and a "prepare my records for a doctor or AI assistant" export in text or JSON.

**Admin** — user management, notification broadcast, daily-English content management and feedback triage behind a role check.

## Stack

- Vite, React 18, TypeScript with strict mode on
- shadcn/ui (Radix primitives) and Tailwind, trimmed to the 25 primitives actually used
- TanStack Query for the data layer
- Supabase: Postgres with row-level security on every table, Auth, Storage, Deno edge functions
- Installable PWA via web manifest; deliberately no service worker, so users never get stuck on a stale cached build
- Vitest (315 tests) and GitHub Actions running typecheck, lint, tests and build

## Architecture notes

A few decisions worth knowing before reading the code:

- **URL-driven page registry.** React Router owns a handful of top-level routes; the main app is a single route that reads `?page=` against a typed whitelist of 34 page ids ([src/lib/pageRegistry.ts](src/lib/pageRegistry.ts)) rendered through a lazy-loading `PageRenderer`. The system back button steps through visited pages, while in-app back buttons replace history entries so the stack never deepens.
- **The points economy is server-authoritative.** RLS denies client writes to points tables outright. Awards, spends and store purchases go through `SECURITY DEFINER` RPCs that price items server-side and cap game bonuses per day, so no client can pay itself.
- **Two notions of time.** Stored timestamps are true UTC; anything that means "today" (check-in days, streaks) uses the Beijing calendar day via [src/utils/beijingTime.ts](src/utils/beijingTime.ts). The distinction matters around midnight.
- **Edge functions** handle email reminders (pg_cron → scheduler → Resend), AI weekly reports, self-service account deletion and admin operations. Per-function JWT rules live in [supabase/config.toml](supabase/config.toml).
- **Built-in MCP server.** [src/lib/mcp/](src/lib/mcp) defines read-only tools over the signed-in user's own records (check-ins, symptoms, medications, weekly report), bundled by a Vite plugin into an edge function with OAuth consent — a user can connect an AI assistant to their data without exporting files.

## Local development

Requires Node 20+ (CI runs 22) and npm.

```sh
npm install     # .npmrc sets legacy-peer-deps=true — keep it; the dependency set has
                # known-benign peer conflicts (react-day-picker@8 vs date-fns@4)
npm run dev     # Vite dev server on http://localhost:8080
```

Environment variables are optional for a default run: without a `.env` the client falls back to the hosted demo project's publishable Supabase values (browser-safe by design; all access is enforced by RLS). To point at your own Supabase project, copy `.env.example` to `.env` and fill it in, then apply the schema:

```sh
supabase link --project-ref <your-ref>
supabase db push        # 60 migrations
```

Checks:

```sh
npm test            # vitest
npm run typecheck   # tsc -b
npm run lint
npm run build
```

Two edge functions call Lovable-hosted gateways (the Resend email relay and the AI weekly report) and will not work without a Lovable subscription; everything else is plain Supabase.

## Privacy

Health data is treated as sensitive. Collection is gated by a recorded, versioned consent (an append-only `user_consents` ledger behind a blocking dialog after sign-in), and a privacy centre in Settings shows the consent record and offers withdrawal, a full JSON export of the user's data, and targeted cleanup of emergency SMS logs. The app also ships an in-app privacy policy, terms and medical disclaimer (`/privacy`, `/terms`, `/disclaimer`) and self-service account deletion backed by an edge function that removes business data, uploaded files and the auth record. [PRIVACY.md](PRIVACY.md) maps these controls to the Australian Privacy Principles, including the parts still marked DRAFT.

## Origins

Scaffolded with Lovable, which still two-way syncs this repo and publishes the production build. Development since has been manual: a renovation pass removed roughly ten thousand lines of dead scaffold code, turned on strict TypeScript, migrated data fetching to TanStack Query and brought the test count to just under 300.
