# CareerHub

A live job platform for the Indian market — job seekers search, match, apply and track
applications in real time; employers publish roles that go live on the board instantly.

Live demo: https://careerhub-eight.vercel.app/
GitHub: https://github.com/kunaManoj/CareerHub

---

## Project status

This project is production-ready for a demonstration deployment using:
- Vite + React + TypeScript frontend
- Supabase PostgreSQL backend
- Vercel hosting
- GitHub Actions CI/CD

---

## Product overview

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

The pipeline lives in `.github/workflows/ci-cd.yml` and runs on every push and PR.

### Workflow behavior
- Quality gate runs on every push and pull request
- It installs dependencies, runs TypeScript checks, and builds the app
- The production deploy job runs only on `main`
- Deployment is handled through Vercel with the Vercel CLI

### Required GitHub secrets
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Production hosting
The app is deployed to Vercel as a static SPA. It talks to Supabase at runtime through environment variables, so no serverless backend or custom Node service is required.

---

## Production readiness checklist

- Vercel project connected to GitHub repository
- Supabase project configured with schema from `backend/schema.sql`
- Seed data loaded with `npm run seed`
- Required environment variables set in Vercel
- GitHub Actions workflow configured for quality checks and production deploys
- Documentation added in `documentation.md`

---

## Related documentation

- `documentation.md` — full project overview and architecture notes
- `SETUP.md` — local setup steps and environment instructions
- `backend/README.md` — backend design notes and Supabase architecture
