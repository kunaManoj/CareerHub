# CareerHub

CareerHub is a live job-board application for the Indian market. Candidates can discover roles, compare transparent salary ranges, save opportunities, apply, and follow application progress. Employers can publish structured job listings that appear on the board immediately.

- Live demo: https://careerhub-eight.vercel.app/
- Repository: https://github.com/kunaManoj/CareerHub

## What the product demonstrates

### Candidate experience

- Search jobs by title, skill, company, category, tag, or location.
- Use location suggestions and the `/` keyboard shortcut to focus search.
- Filter by category, contract type, experience level, remote-only status, and minimum annual salary.
- Sort by newest, highest salary, or lowest salary.
- Browse featured roles, recently viewed roles, and progressively loaded results.
- Open a job detail drawer with company information, responsibilities, requirements, benefits, salary, similar roles, and an external careers link when available.
- Choose between applying inside CareerHub or following the employer's careers URL. When a careers URL is provided, it appears both in the job action bar and inside the CareerHub application modal.
- Save roles to a personal shortlist stored in browser local storage.
- Submit an application with validation for name, email, cover note, portfolio, and expected salary.
- Review applications in a dashboard with status badges, timeline notes, and withdrawal support.
- Try resume matching by uploading a text-readable resume, pasting resume text, or using one of the sample profiles. The client extracts known skills and returns the top five matching roles.
- Subscribe to job alerts for the current filter criteria.

### Employer experience

- Open the employer console from the main navigation.
- Publish a role with company, workplace, employment type, seniority, category, salary range, tags, summary, responsibilities, requirements, benefits, and an optional careers URL.
- Receive inline validation for required fields, salary ordering, content length, and URL format.
- Create a new company record when the company does not already exist.
- See a successfully published role appear on the board immediately.

### Platform experience

- Live reads and writes through Supabase PostgreSQL.
- Typed domain models and a dedicated service layer for database access.
- PostgreSQL constraints, indexes, and Row Level Security policies in the supplied schema.
- Loading skeletons, empty states, toast notifications, visible backend setup guidance, and a recoverable backend error screen.
- Responsive layouts for desktop and mobile, keyboard-friendly controls, semantic labels, focus-visible styles, and reduced-motion support.
- Indian salary formatting in INR, LPA, and crore notation.

## Architecture at a glance

```text
React UI
  -> AppContext state and actions
  -> src/services/api.ts
  -> src/services/supabaseApi.ts
  -> Supabase PostgreSQL + Row Level Security
```

CareerHub has one business-data source: Supabase. If the two public `VITE_SUPABASE_*` variables are missing, the application shows a setup screen instead of serving bundled job data. Saved and recently viewed role IDs are intentionally browser-local preferences.

## Technology stack

| Area | Technology |
| --- | --- |
| UI | React 18, TypeScript, Vite |
| Styling | Tailwind CSS 4 via the Vite plugin, custom CSS, hand-built SVG icons |
| Backend | Supabase JavaScript client |
| Database | Supabase-hosted PostgreSQL |
| Security | PostgreSQL constraints and Supabase Row Level Security |
| Hosting | Vercel static deployment |
| Automation | GitHub Actions |

## Run locally

The complete setup is documented in [SETUP.md](./SETUP.md). The short version is:

```bash
npm ci
npm run dev
```

The application requires a Supabase project configured with the schema and public client variables. Without them, the setup screen explains what is missing.

### Environment variables

Copy `.env.example` to `.env.local` and provide:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

The seeder additionally requires `SUPABASE_SERVICE_ROLE_KEY`. This is an administrative secret and must remain in `.env.local` or in a secure CI environment. It must never be placed in client code, committed to Git, or included in a repository ZIP.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the locked dependency tree |
| `npm run dev` | Start the Vite development server on port 3000 |
| `npm run typecheck` | Run strict TypeScript validation without emitting files |
| `npm run build` | Create the production bundle in `dist/` |
| `npm run preview` | Serve the production bundle locally |
| `npm run seed` | Upsert sample companies, jobs, and applications into Supabase |

## Project layout

```text
backend/
  schema.sql              Supabase tables, constraints, indexes, and RLS
  README.md               Backend setup and data model notes
scripts/
  seed-supabase.ts        Cross-platform database seeder
src/
  App.tsx                 Board, shell, navigation, and global page composition
  types.ts                Shared domain contracts
  context/
    AppContext.tsx        Global state, actions, loading, and lifecycle updates
  components/
    BackendSetup.tsx      Missing-configuration screen
    Dashboard.tsx         Applications and saved-role dashboard
    FilterRail.tsx        Filters and alert subscription
    JobDetail.tsx         Job detail drawer
    PostJobForm.tsx       Employer publishing workflow
    ResumeMatch.tsx       Client-side resume matching
    ...                    Reusable UI components and icon system
  data/seed.ts            Demo records consumed by the seeder only
  services/
    api.ts                Public service boundary and client-side engines
    supabaseApi.ts        Supabase reads, writes, and row mapping
    supabaseClient.ts     Environment-based Supabase bootstrap
  hooks.tsx               Reveal, count-up, and reduced-motion hooks
  index.css               Design tokens, animations, and responsive styling
```

## Database and seed data

Run `backend/schema.sql` in the Supabase SQL editor before seeding. The schema is idempotent and creates:

- `companies`
- `jobs`
- `applications`
- `job_alerts`

The current demo seed contains 10 companies, 30 jobs, and 3 sample applications. Run `npm run seed` after adding the service-role key to `.env.local`.

## CI/CD and deployment

The workflow in `.github/workflows/ci-cd.yml`:

1. Runs on pushes to `main` and on pull requests.
2. Installs dependencies with `npm ci`.
3. Runs `npm run typecheck`.
4. Runs `npm run build`.
5. Uploads the production artifact on `main`.
6. Deploys `main` to Vercel after the quality job succeeds.

Configure these GitHub Actions secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

The frontend is a static SPA. Supabase is accessed directly at runtime; no custom Node server is required.

## Scope and production notes

This repository is ready as a demonstration deployment. The supplied SQL uses demo-mode anonymous write policies so the complete flow works without a login screen. Before using the product with real candidate or employer data, add Supabase Auth and replace the anonymous application, job-posting, counter-update, and alert policies with identity-scoped policies.

Resume matching is deliberately client-side keyword scoring, not an ML service. New application status changes are simulated for applications created in the current browser session and persisted through Supabase. The current repository does not include a separate automated test suite or lint script; the quality gate currently covers strict TypeScript checking and a production build.

## Further documentation

- [SETUP.md](./SETUP.md) - local setup, seeding, deployment, and troubleshooting
- [documentation.md](./documentation.md) - product, architecture, data flow, and operational notes
- [backend/README.md](./backend/README.md) - database schema, RLS, and backend operations
