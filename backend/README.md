# CareerHub backend

CareerHub uses Supabase as its only business-data backend. Supabase provides hosted PostgreSQL, the API client used by the frontend, and Row Level Security policies defined in `schema.sql`.

## Setup

1. Create a Supabase project.
2. Open the SQL Editor.
3. Run the full contents of `backend/schema.sql`.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local`.
5. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` for seeding only.
6. Run `npm run seed` from the repository root.
7. Start the app with `npm run dev`.

The SQL file is idempotent. Tables and indexes use `IF NOT EXISTS`, and managed policies are dropped before recreation, so the script can be safely re-run during setup.

For the full local and deployment procedure, see [../SETUP.md](../SETUP.md).

## Architecture

```text
React component
  -> src/context/AppContext.tsx
  -> src/services/api.ts
  -> src/services/supabaseApi.ts
  -> src/services/supabaseClient.ts
  -> Supabase REST API / PostgreSQL
```

`api.ts` is the public service boundary. UI components do not query Supabase directly. `supabaseApi.ts` owns query construction and converts database snake_case fields to the camelCase domain contracts in `src/types.ts`.

## Tables

### `companies`

Company profile and presentation fields:

- `id`, `name`, `sector`, `location`
- `size`, `founded`, `about`, `brand`
- `created_at`

### `jobs`

Job listing fields:

- `id`, `company_id`, `title`, `location`
- `remote`, `type`, `level`, `category`
- `salary_min`, `salary_max`, `tags`, `posted_at`
- `featured`, `applicants`, `summary`
- `responsibilities`, `requirements`, `benefits`
- `careers_url`, `created_at`

The foreign key from `jobs.company_id` to `companies.id` cascades on company deletion. Indexes support posting-date, category, and workplace filtering.

### `applications`

Candidate submission fields:

- `id`, `job_id`, `candidate_name`, `email`
- `cover_note`, `portfolio`, `expected_salary`
- `status`, `applied_at`, `timeline`, `created_at`

`timeline` is JSONB and contains entries shaped like `{ status, at, note }`. Indexes support job and status lookups.

### `job_alerts`

Stores `email`, the serialized `criteria` string, and `created_at`. The table uses a generated `bigserial` ID.

## Constraints

The schema enforces:

- Valid workplace values: `Remote`, `Hybrid`, `On-site`
- Valid job types: `Full-time`, `Contract`, `Part-time`, `Internship`
- Valid levels: `Junior`, `Mid-level`, `Senior`, `Lead`
- Valid categories: Engineering, Design, Product, Data, Marketing, Sales, Operations, Finance
- Non-negative salaries and `salary_max >= salary_min`
- Non-negative applicant counters
- Valid application statuses: submitted, reviewing, shortlisted, interview, offered, rejected, withdrawn

## RLS policy model

All four tables have RLS enabled.

The supplied policies are intentionally permissive demo policies because the demo app has no login screen:

| Table | Demo access |
| --- | --- |
| `companies` | Public reads; anonymous company inserts |
| `jobs` | Public reads; anonymous inserts and applicant-counter updates |
| `applications` | Anonymous reads, inserts, and updates |
| `job_alerts` | Anonymous inserts |

This policy set is suitable for a controlled demonstration database, not for storing production candidate information. The policy section in `schema.sql` includes guidance for replacing anonymous writes with authenticated policies.

## Data flows

### Reads

- `fetchCompanies()` reads companies ordered by name.
- `fetchJobs()` reads jobs ordered by posting date descending.
- `fetchApplications()` reads applications ordered by applied date descending.

### Applications

`createApplication()` creates a client-generated application ID, inserts the application and initial timeline, then increments the related job's applicant counter. `withdrawApplication()` appends a withdrawn entry and reloads applications.

### Publishing

`postJob()` looks up a company case-insensitively by name. If no row exists, it creates a company with a deterministic brand color, then inserts the job. The UI updates immediately after both writes succeed.

### Alerts

`subscribeAlert()` inserts an email and a human-readable representation of the current filters.

### Lifecycle updates

The frontend simulates progress for applications created during the current browser session. `persistProgress()` updates status and timeline JSONB entries in Supabase.

## Seeding

The cross-platform seeder is `scripts/seed-supabase.ts`. It:

1. Loads environment variables from the process, `.env.local`, or `.env`.
2. Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS.
3. Maps domain records to database rows.
4. Upserts 10 companies, 30 jobs, and 3 sample applications by primary key.

The service-role key is never imported by frontend code. Keep it local or in a secure administrative environment.

## Production hardening checklist

- Add Supabase Auth and identity-scoped ownership columns.
- Restrict application reads and updates to candidates and authorized employers.
- Restrict job creation and editing to authenticated employer accounts.
- Replace anonymous counter updates with a transaction or server-side function.
- Validate and rate-limit public forms.
- Add audit logging and privacy/retention controls for candidate data.
- Move privileged seeding and administrative operations out of a developer workstation when operational scale requires it.
- Add monitoring and backups appropriate to the data sensitivity.

## Troubleshooting

### `Supabase is not configured`

The app cannot find one or both `VITE_` variables. Add them to `.env.local` and restart Vite.

### Empty board

The tables exist but contain no records. Apply the schema and run `npm run seed` with the service-role key.

### Permission denied

Confirm that the schema was run completely and that the intended demo policies exist. Do not solve a client permission issue by exposing the service-role key to the browser.

### Seed credentials missing

Set `SUPABASE_SERVICE_ROLE_KEY` and provide the project URL as `SUPABASE_URL` or `VITE_SUPABASE_URL`.
