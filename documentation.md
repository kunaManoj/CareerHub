# CareerHub technical documentation

## 1. Product summary

CareerHub is a single-page job platform for the Indian market. It combines a public job board, candidate workflow, employer publishing console, resume-to-role matching, and a Supabase persistence layer.

The product is designed as a polished demonstration application. It uses real database reads and writes, while keeping authentication out of the demo path so the complete workflow can be evaluated quickly.

## 2. Product workflows

### Candidate workflow

1. The board loads companies, jobs, and applications from Supabase.
2. A candidate searches by role, skill, company, category, tag, or location.
3. Results can be refined with category, contract type, experience level, remote-only, and minimum-salary filters.
4. A candidate opens a job drawer to review the company, salary, workplace, responsibilities, requirements, benefits, similar roles, and careers URL.
5. If the employer supplied a careers URL, the candidate can follow it from the job action bar or from inside the CareerHub application modal. This opens the employer's site in a new tab.
6. The candidate can alternatively submit an application directly to CareerHub, save the role locally, or do both.
7. The dashboard shows CareerHub applications, status, timeline notes, and withdrawal action.
8. Newly created applications in the current browser session move through the demo lifecycle automatically: submitted, reviewing, shortlisted, and interview.

### Employer workflow

1. The employer opens **Post a job**.
2. The form validates listing content, salary ordering, minimum content, and optional URL format.
3. The service finds an existing company by name or creates a new company record.
4. The service inserts the job into Supabase.
5. The new job is added to the current board immediately and opened in the detail drawer.

### Resume matching workflow

1. A candidate drops a text-readable resume file, selects a file, pastes resume text, or loads a sample profile.
2. The browser reads the text locally. Files are limited to 2 MB.
3. The client extracts skills from a maintained dictionary.
4. Each live job is scored against matching tags, title terms, category, and level.
5. The top five non-zero matches are presented with a score, matched skills, salary, company, and actions to view or apply.

No resume content is sent to Supabase by this feature.

## 3. Application features

### Board and discovery

- Live role, company, and new-this-week counters.
- Featured-role rail on larger screens.
- Search input with `/` keyboard focus shortcut and location datalist suggestions.
- Debounced search input and filter-result shimmer.
- Active filter chips with individual removal and clear-all behavior.
- Desktop filter rail and mobile filter panel.
- Newest, salary-high-to-low, and salary-low-to-high sorting.
- Eight-result initial view with load-more pagination.
- Recently viewed strip backed by local storage.
- Salary formatting in Indian units (K, L, and Cr).

### Job details

- Accessible modal drawer with Escape and backdrop close behavior.
- Featured badge, company branding, salary band, posting age, workplace, contract type, and applicant count.
- Responsibilities, requirements, benefits, company profile, similar roles, and external careers link.
- Save, apply, already-applied, and employer-careers-link states.
- Two application paths: submit through CareerHub or open the employer's external careers page.

### Candidate dashboard

- Active application count, interview-stage count, and saved-role count.
- Applications and saved roles tabs.
- Application status badges and progress timeline.
- Timeline notes and dates stored with each application.
- Confirm-before-withdraw flow for eligible applications.
- Empty states that return users to the board.

### Employer console

The form supports:

- Role title and company identity
- Sector and location
- Remote, hybrid, or on-site workplace
- Full-time, contract, part-time, or internship type
- Junior, mid-level, senior, or lead level
- Engineering, design, product, data, marketing, sales, operations, or finance category
- Minimum and maximum annual salary in INR
- Comma-separated tags and benefits
- Multi-line responsibilities and requirements
- Role summary and optional careers URL

### Communication and feedback

- Success, informational, and lifecycle-update toast notifications.
- Auto-dismiss and manual-dismiss toast behavior.
- Empty database screen with a copyable seed command.
- Setup screen when public Supabase variables are missing.
- Backend error screen with a refresh action when initial data loading fails.

## 4. Frontend architecture

```text
src/main.tsx
  -> src/App.tsx
     -> AppProvider (src/context/AppContext.tsx)
        -> Shell and page components
           -> src/services/api.ts
              -> src/services/supabaseApi.ts
                 -> src/services/supabaseClient.ts
                    -> Supabase
```

### `src/main.tsx`

Bootstraps React, loads global CSS, and mounts `App` into the root element.

### `src/App.tsx`

Composes the shell, navigation, board, footer, job drawer, application modal, dashboard, employer page, loading states, and error state. It also owns board-specific presentation components such as search, result lists, active chips, and empty states.

### `src/context/AppContext.tsx`

Owns shared runtime state:

- Companies, jobs, and applications
- Selected job and application modal state
- Current page and dashboard tab
- Search and filter state
- Saved and recently viewed IDs
- Initial loading and backend error state
- Toast messages

It exposes typed actions for navigation, filtering, saving, applying, withdrawing, posting jobs, and subscribing to alerts.

### `src/services/api.ts`

This is the public service boundary used by UI code. It delegates persistence to Supabase and contains pure client utilities for:

- Company lookup maps
- Filtering and sorting
- Application lifecycle simulation
- Local-storage preferences
- Salary/date formatting
- Resume skill extraction and scoring

### `src/services/supabaseApi.ts`

Contains all database reads and writes. It maps PostgreSQL snake_case rows to the application camelCase domain model and maps write payloads in the reverse direction.

### `src/services/supabaseClient.ts`

Creates the Supabase client only when both public Vite variables are present. Otherwise, the application renders the setup screen before mounting the data-dependent app shell.

## 5. Data model

The schema is in `backend/schema.sql` and is intended to mirror `src/types.ts`.

### `companies`

Stores company identity and presentation data: ID, name, sector, location, size, founded year, about text, brand color, and timestamps.

### `jobs`

Stores the complete listing: company relationship, title, location, workplace policy, type, level, category, annual INR salary bounds, tags, posting date, featured flag, applicant counter, summary, responsibilities, requirements, benefits, careers URL, and timestamps.

Constraints restrict workplace, type, level, and category values. Salary values cannot be negative and the maximum cannot be below the minimum.

### `applications`

Stores the candidate submission, job relationship, contact details, cover note, optional portfolio, expected salary, status, applied date, and a JSONB timeline. Status values include submitted, reviewing, shortlisted, interview, offered, rejected, and withdrawn.

### `job_alerts`

Stores an email address, a text description of the active filter criteria, and creation time.

### Browser-local state

Saved and recently viewed job IDs are stored in local storage under versioned keys. They are preferences tied to the current browser, not shared business records.

## 6. Database access and mutation flows

### Initial load

The provider requests companies, jobs, and applications in parallel. Successful data is placed in state and the board renders. A rejected request produces the recoverable backend error screen rather than leaving the loading skeleton active indefinitely.

### Apply

`createApplication` creates an application ID, writes the submitted timeline entry, inserts the application, and increments the job's public applicant counter. The provider updates its local application and job state after the write succeeds.

### Withdraw

The service reads the application, appends a withdrawn timeline entry, updates the status, and reloads applications. The UI requires confirmation and disables withdrawal for offered, rejected, or already withdrawn applications.

### Lifecycle simulation

Only applications created during the current page session are advanced automatically. At approximately 12 seconds, 100 seconds, and 360 seconds, the client may move an application to reviewing, shortlisted, and interview. Each transition appends a timeline entry and is persisted through `persistProgress`.

### Job publishing

The service normalizes the company name into an ID seed, finds a matching company, creates one if needed, and inserts the job. The new company and job are merged into current React state.

### Job alerts

The current query, category selections, and remote-only setting are serialized into a readable criteria string and inserted with the subscriber email.

## 7. Security model

### Public client values

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are intended for browser use. They do not provide administrative access by themselves; database access is controlled by RLS policies.

### Seeder secret

`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and is used only by the local seeder. It must never be exposed to the browser, committed, or placed in a public deployment variable.

### Current demo-mode policies

The schema enables RLS but allows anonymous reads and writes for the demo workflow. This makes the board, application, employer, counter, and alert flows work without authentication. It is not an identity-secured production policy.

### Production hardening

For a real deployment:

1. Enable Supabase Auth.
2. Associate applications with authenticated candidate IDs.
3. Restrict application reads and updates to the owning candidate or authorized employer.
4. Restrict job creation and updates to authenticated employer accounts.
5. Validate alert subscriptions and rate-limit public writes.
6. Add server-side validation, abuse protection, audit logging, and privacy controls.

## 8. Styling and accessibility

- Tailwind utility classes are combined with design tokens and custom CSS in `src/index.css`.
- The app uses semantic labels, `aria-label`, `role="dialog"`, `aria-modal`, `aria-live`, `aria-pressed`, and `role="switch"` where appropriate.
- `:focus-visible` outlines are defined globally.
- Modals support Escape and backdrop closing.
- Responsive breakpoints provide mobile filter controls and adaptive layouts.
- The `prefers-reduced-motion` media query disables or minimizes animations.

## 9. CI/CD and deployment

`.github/workflows/ci-cd.yml` runs on pushes to `main` and pull requests. Its quality job runs `npm ci`, `npm run typecheck`, and `npm run build`. The deployment job runs only for `main` after the quality job passes and invokes the Vercel CLI with repository secrets.

The app is a static SPA hosted on Vercel and connects directly to Supabase at runtime. Setup instructions and required secrets are in `SETUP.md`.

## 10. Validation and known scope

The repository provides strict TypeScript checking and a production build as automated quality gates. It does not currently include a dedicated unit, integration, end-to-end, or lint script.

The resume engine is deterministic keyword matching. The application lifecycle is a demonstration simulation. Anonymous demo-mode writes are intentionally permissive. These constraints are documented so an evaluator can distinguish implemented demo behavior from production hardening work.
