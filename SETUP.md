# CareerHub setup guide

This guide takes the repository from a fresh clone to a working local app and then to a Vercel deployment.

## 1. Prerequisites

- Node.js 18 or newer
- npm
- A Supabase project
- Git, if cloning the repository
- A Vercel project and GitHub repository secrets for automated deployment

## 2. Install the project

From the repository root:

```bash
npm ci
```

Use `npm install` instead when creating or intentionally updating the lockfile.

## 3. Create the Supabase database

1. Create a project at [supabase.com](https://supabase.com).
2. Open the Supabase **SQL Editor**.
3. Paste the complete contents of `backend/schema.sql` and run it.
4. Confirm that the `companies`, `jobs`, `applications`, and `job_alerts` tables exist.

The schema is designed to be re-runnable. It creates the tables, constraints, indexes, and demo-mode RLS policies required by the app.

## 4. Configure local environment variables

Copy `.env.example` to `.env.local` and fill in the public client values from **Supabase > Settings > API**:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

To seed the database, also add the service-role key:

```text
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service-role key bypasses RLS. It is only read by `scripts/seed-supabase.ts`; never expose it through a `VITE_` variable, commit it, or share it in a repository link or ZIP.

`.env.local` is ignored by Git. A Git link will not include it, but manually verify that it is not staged with `git status` before submitting.

## 5. Seed the demo data

Run:

```bash
npm run seed
```

The seeder reads environment variables first, then `.env.local`, then `.env`. It uses the service-role key and upserts the current dataset by primary key, so it is safe to run again.

Expected records:

- 10 companies
- 30 jobs
- 3 sample applications

You can also provide the seeder variables directly.

PowerShell:

```powershell
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
npm run seed
```

Bash or zsh:

```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
npm run seed
```

## 6. Run the application

```bash
npm run dev
```

Open http://localhost:3000. With valid public keys and seeded tables, the footer shows `Live API - Supabase` and the board loads from Supabase.

If the public keys are missing, CareerHub intentionally shows a backend setup screen. If the keys are present but the database cannot be reached, it shows a recoverable connection error with technical details and a refresh action.

## 7. Verify the submission build

Run the same checks used by CI:

```bash
npm run typecheck
npm run build
npm run preview
```

The build output is written to `dist/`. It is generated output and is ignored by Git.

## 8. Deploy to Vercel with GitHub Actions

The deployment workflow is `.github/workflows/ci-cd.yml`. It runs the quality gate for every push and pull request, and deploys only the `main` branch after typechecking and building succeed.

### One-time Vercel setup

1. Create or import the Vercel project.
2. Link the local repository if needed with `npx vercel link`.
3. Collect the Vercel token, organization ID, and project ID.
4. Add the following GitHub Actions secrets under **Repository Settings > Secrets and variables > Actions**:

   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. Push to `main` and inspect the Actions tab.

The Vercel build receives the two `VITE_` variables at build time. The service-role key is not required by the deployed frontend and must not be added to Vercel frontend environment variables.

## 9. Safe submission checklist

Before sharing the Git repository link:

- Confirm `git status` shows only intended source or documentation changes.
- Confirm `.env.local` is not tracked or staged.
- Confirm no service-role key, Vercel token, or private credential appears in tracked files.
- Run `npm run typecheck` and `npm run build`.
- Confirm `backend/schema.sql` is included.
- Confirm the workflow is `.github/workflows/ci-cd.yml`.
- Confirm the live demo URL and repository URL in `README.md` are correct.

Do not submit `node_modules`, `dist`, `.vercel`, or `.env.local` as part of a manual archive.

## Troubleshooting

### The setup screen appears

Check that both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present in `.env.local`, then restart the Vite server. Vite reads environment variables at startup.

### The board says the database is empty

Run `npm run seed` after applying `backend/schema.sql`.

### The live board is unavailable

Check the Supabase URL, anon key, project status, table names, and RLS policies. The app's technical-details disclosure will show the failed operation.

### Seeding fails with missing credentials

Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` and ensure the URL is available as either `SUPABASE_URL` or `VITE_SUPABASE_URL`.
