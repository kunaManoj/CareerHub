# CareerHub

[![CI/CD](https://github.com/kunaManoj/careerhub/actions/workflows/deploy.yml/badge.svg)](https://github.com/kunaManoj/careerhub/actions/workflows/deploy.yml)

A live job platform for the Indian market — job seekers search, match, apply and track
applications in real time; employers publish roles that go live on the board instantly.

## Features

**Job seeker**
- Search across roles, skills and companies (press `/` to focus) with city autocomplete
- Filters:categories, contract types, experience levels, remote-only, minimum salary
- Sort by recency or salary, load-more pagination, recently-viewed strip
- Save/shortlist roles, full job detail drawer with similar-role suggestions
- Validated application flow with a live status timeline
  (Submitted → Review → Shortlist → Interview → Offer) that progresses with timeline notes
- Resume match: drop a resume (or paste text) and get scored top-5 role recommendations

**Employer**
- Post-a-job console with full validation; listings appear on the board immediately

**Platform**
- All salaries in INR (LPA / Cr formatting), Indian companies across Hyderabad, Bengaluru,
  Mumbai, Pune, Chennai and Gurugram, plus remote roles
- Single backend: Supabase (Postgres + RLS) — no bundled-data fallback
- Keyboard accessible, `prefers-reduced-motion` aware, ~133KB gzipped bundle

## Tech stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18 · TypeScript · Vite 6 · Tailwind CSS 4 · hand-built SVG icon system |
| Backend    | Supabase (Postgres + Row Level Security) via a typed service layer (`src/services/api.ts` → `supabaseApi.ts`) |
| Database   | PostgreSQL via Supabase — schema in `backend/schema.sql` |

## Getting started

> **New here?** Follow [`SETUP.md`](./SETUP.md) — a five-step checklist from empty
> Supabase project to a running local app.

```bash
npm install
npm run dev       # local development
npm run build     # production build → dist/
npm run preview   # serve the production build
```

## Connecting the backend (required, ~10 minutes)

CareerHub has a single backend — Supabase. Until it's configured, the app shows a
setup screen rather than the board (it never falls back to bundled data).

1. Create a project at [supabase.com](https://supabase.com) (region: Mumbai recommended).
2. Open **SQL Editor**, paste and run `backend/schema.sql` (idempotent — safe to re-run).
3. Copy `.env.example` → `.env.local` and fill, from **Settings → API**:
   - `VITE_SUPABASE_URL` — the project URL
   - `VITE_SUPABASE_ANON_KEY` — the anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` — used only by the seeder; never commit this file
4. Seed the data:
   ```bash
   npm run seed
   ```
   Works on any shell — the seeder reads `.env.local`. (On bash/zsh you can also pass
   `SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm run seed`.)
5. Start the dev server — the board loads from your database, the footer badge reads
   **Live API · Supabase**, and the app serves at `http://localhost:3000`.

Full architecture notes in `backend/README.md`.

## Project structure

```
backend/
  schema.sql            PostgreSQL schema + RLS policies (Supabase-ready)
  README.md             Backend architecture & migration guide
scripts/
  seed-supabase.ts      One-command database seeder
src/
  types.ts              Domain contracts (Job, Application, Company, Filters…)
  data/seed.ts          Seed dataset: 10 companies, 30 roles (used only by the seeder)
  services/
    api.ts              Data-access boundary — delegates to Supabase + client-side engines
    supabaseClient.ts   Boot-time Supabase configuration
    supabaseApi.ts      Supabase queries (snake_case ↔ domain mapping)
  context/              Global state, actions, lifecycle simulation tick
  components/           12 UI components (board, drawer, modals, dashboard, employer console, setup screen)
  icons.tsx             Hand-drawn SVG icon system + brand mark
  hooks.tsx             Scroll reveal, count-up, reduced-motion hooks
```

## Scripts

| Command             | Purpose |
|---------------------|---------|
| `npm run dev`       | Start the development server (`http://localhost:3000`) |
| `npm run build`     | Production build → `dist/` |
| `npm run preview`   | Serve the production build locally |
| `npm run typecheck` | Strict TypeScript check with no emit |
| `npm run seed`      | Load companies, jobs and sample applications into Supabase (re-runnable) |

## CI/CD & deployment

The pipeline lives in `.github/workflows/deploy.yml` and runs on every push and PR:

| Job | Runs on | What it does |
|---|---|---|
| **Quality gate** | every push & PR | `npm ci` → `typecheck` → `build` (with Supabase env inlined); uploads `dist/` as an artifact on `main` |
| **Deploy to Vercel** | `main` only, after quality passes | pulls the Vercel project env, builds with `vercel build --prod`, and promotes to production via `vercel deploy --prebuilt --prod` |

Concurrent runs on the same branch are cancelled automatically, so the newest commit
always wins.

**Repository secrets** (GitHub → Settings → Secrets and variables → Actions):

| Secret | Value |
|---|---|
| `VERCEL_TOKEN` | Vercel account token (vercel.com → Account → Tokens) |
| `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` | from `.vercel/project.json` after `npx vercel link` |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | inlined into the client bundle at build time |

The production build is a static SPA talking to Supabase at runtime, so Vercel needs
no server, functions or cold-start configuration.
