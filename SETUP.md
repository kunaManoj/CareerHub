# CareerHub — Quickstart Checklist

Everything below runs from the repository root.

## 0 · Prerequisites
- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project

## 1 · Database (once)
- [ ] Supabase → **SQL Editor** → paste the full contents of `backend/schema.sql` → **Run**
      *(idempotent — safe to re-run any time)*

## 2 · Environment
- [ ] Copy `.env.example` → `.env.local` (already done if you received this repo configured)
- [ ] Fill from **Supabase → Settings → API**:
      ```
      VITE_SUPABASE_URL=https://your-project.supabase.co
      VITE_SUPABASE_ANON_KEY=eyJ...        ← the anon public key
      ```

## 3 · Seed data (once)
Uses the **service_role** key (Settings → API). Recommended (any shell, incl. PowerShell):
add one line to `.env.local` (gitignored — never committed):
```
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
```
then run:
```bash
npm run seed
```
*(The seeder reads `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` from the environment
or from `.env` / `.env.local`, and falls back to `VITE_SUPABASE_URL` for the project.)*

Inline alternatives — **bash/zsh:**
```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key \
npm run seed
```
**PowerShell:**
```powershell
$env:SUPABASE_URL="https://your-project.supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."; npm run seed
```
Expected output:
```
→ Seeding CareerHub…
  ✓ 10 companies
  ✓ 30 jobs
  ✓ 3 applications
Done.
```

## 4 · Run
```bash
npm install
npm run dev        # → http://localhost:3000
```
The footer should read **Live API · Supabase**.

## 5 · Production build
```bash
npm run build      # → dist/
npm run preview    # serve the production build locally
```

## Deploying (Vercel)
1. Import the Git repository in Vercel (Framework: Vite).
2. Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
3. Build command `npm run build`, output directory `dist`.

## Key safety
- `anon key` — public by design; safe in the client. RLS policies guard it.
- `service_role key` — bypasses all security. Use only for seeding/admin,
  store it only in `.env.local` (gitignored), keep it out of Git,
  and rotate it if it was ever shared.
