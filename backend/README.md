# CareerHub — Backend (Supabase)

CareerHub has a **single backend: Supabase** (hosted Postgres + Row Level Security).
There is no bundled or local-data fallback — every job, company, application,
posting and alert is read from and written to your database.

## Architecture

```
UI component
   │  await api.createApplication(payload)
   ▼
src/services/api.ts            ← single data-access boundary (typed endpoints)
   ▼
src/services/supabaseApi.ts    ← Supabase queries + snake_case ↔ camelCase mapping
   ▼
src/services/supabaseClient.ts ← boot-time config (VITE_SUPABASE_URL / _ANON_KEY)
   ▼
Supabase (Postgres + RLS)
```

- `api.ts` is the only module the UI talks to. Pure client concerns (filtering,
  formatting, resume matching) live here; every persistence call is delegated to
  `supabaseApi.ts`.
- If the two env vars are missing at boot, the app renders a **setup screen**
  (`src/components/BackendSetup.tsx`) instead of the board — it never silently
  serves stale or fake data.
- Per-browser UI state (saved roles, recently-viewed) intentionally stays in
  `localStorage`; it is a viewing preference, not user data.

## Setup (≈10 minutes)

1. Create a project at [supabase.com](https://supabase.com) (region: Mumbai / ap-south-1).
2. **SQL Editor → New query → paste `backend/schema.sql` → Run.**
   Creates `companies`, `jobs`, `applications`, `job_alerts` + indexes + RLS policies.
3. **Settings → API** — fill `.env.local` (see `.env.example`):
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...   # seeder only — never commit .env.local
   ```
4. **Seed the data**:
   ```bash
   npm run seed
   ```
   The seeder reads `.env.local` (or explicit `SUPABASE_URL` /
   `SUPABASE_SERVICE_ROLE_KEY` env vars). Re-runnable — rows upsert on primary keys.
5. Restart `npm run dev` → `http://localhost:3000`. The footer badge reads
   **“Live API · Supabase”**.

## What runs where

| Concern | Implementation |
|---|---|
| Board / company reads | `select` on `jobs`, `companies` (public-read RLS) |
| Apply / withdraw | `insert` / `update` on `applications` (timeline stored as JSONB) |
| Employer posting | find-or-create `companies` row + `jobs` insert |
| Lifecycle transitions | client engine persists via `persistProgress()` |
| Job alerts | `insert` on `job_alerts` |
| Saved / recently-viewed | `localStorage` (per-browser UI state, by design) |

## Hardening for production

The schema ships with **demo-mode RLS** (anon writes allowed) so every flow works
without a login screen — ideal for an assessment demo. The commented policies at the
bottom of `schema.sql` show the auth-scoped replacements: enable Supabase Auth,
prefix application ids with `auth.uid()`, and swap the policies.

## Deploying (Vercel)

Add the same two `VITE_` variables under **Vercel → Project → Settings →
Environment Variables**, then redeploy. The build (`npm run build`) is a static SPA
that talks to Supabase at runtime, so no server or cold-start configuration is needed.
