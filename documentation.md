# CareerHub Documentation

## 1. Project Overview

CareerHub is a job board platform for job seekers and employers. It allows candidates to:

- browse live jobs
- filter jobs by category, type, level, salary, and location
- save roles to a shortlist
- view job details
- apply for jobs
- track application status over time
- upload or paste a resume for role matching

It allows employers to:

- post new jobs
- publish job listings instantly
- create company entries when needed

The product is built as a Vite + React + TypeScript frontend and uses Supabase as the real backend database.

---

## 2. Business Value

CareerHub solves a real hiring workflow problem:

- job seekers can discover active opportunities quickly
- employers can publish roles without a custom backend setup
- companies and candidates interact through a single live data system
- applications and job lifecycle are tracked in real time

The app is designed around a modern recruitment board workflow, where all business data is live and persisted in a database instead of static mock data.

---

## 3. Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Custom SVG icon system

### Backend / Data Storage
- Supabase
- PostgreSQL inside Supabase
- Row Level Security (RLS)

### Deployment
- Vercel for hosting
- GitHub Actions for CI/CD

---

## 4. Folder Structure

### Root level
- package.json — app scripts and dependencies
- vite.config.js — Vite config
- tsconfig.json — TypeScript config
- index.html — main HTML entry
- .env.local — local environment config for Supabase
- .github/workflows/ci-cd.yml — CI/CD pipeline

### Backend
- backend/schema.sql — PostgreSQL schema and RLS policies
- backend/README.md — backend architecture notes

### Scripts
- scripts/seed-supabase.ts — inserts seed data into Supabase

### Source Code
- src/App.tsx — main app layout and board UI
- src/context/AppContext.tsx — global state and app actions
- src/services/api.ts — single data access boundary
- src/services/supabaseClient.ts — Supabase client setup
- src/services/supabaseApi.ts — database queries and row mapping
- src/types.ts — domain models for jobs, companies, applications, etc.
- src/components — UI screens and reusable components

---

## 5. How the Frontend Works

The app starts in App.tsx and uses AppProvider from AppContext.

### App flow
1. The app loads companies, jobs, and applications.
2. It builds the board UI using filtered job data.
3. Users can search, sort, filter, save, and apply.
4. Application status changes follow a simulated hiring lifecycle.
5. Data is stored in Supabase and read from there.

### Global app state
AppContext manages:

- companies
- jobs
- applications
- selected job
- saved job IDs
- recent job IDs
- active filters
- dashboard tab
- toasts and UI notifications

This state is kept in memory while the app runs, and some browser-specific UI preferences are stored in localStorage.

---

## 6. How the Backend Works

CareerHub uses a single backend: Supabase.

There is no local custom Node API server. Instead, the frontend talks directly to Supabase through a typed service layer.

### Data flow
- UI calls functions from src/services/api.ts
- api.ts delegates to src/services/supabaseApi.ts
- supabaseApi.ts queries Supabase tables
- Supabase returns rows from PostgreSQL
- data is mapped from snake_case database fields to camelCase app objects

### Key backend files
- src/services/supabaseClient.ts
  - creates the Supabase client from env vars
- src/services/supabaseApi.ts
  - all database reads and writes happen here
- backend/schema.sql
  - database tables, indexes, and RLS rules

---

## 7. Real Data Storage

The app stores real data in Supabase tables.

### Tables in schema.sql
- companies
- jobs
- applications
- job_alerts

### What each table stores
#### companies
- company id
- name
- sector
- location
- size
- founded year
- about text
- brand color

#### jobs
- title
- company id
- location
- remote / hybrid / on-site status
- job type
- level
- category
- salary range
- tags
- summary
- responsibilities
- requirements
- benefits

#### applications
- candidate name
- email
- cover note
- portfolio
- expected salary
- status
- timeline of hiring progress

#### job_alerts
- email
- criteria
- created date

Important: saved jobs and recent jobs are intentionally stored in localStorage, not in Supabase, because they are user-preference data rather than shared application data.

---

## 8. How Jobs Are Loaded

When the app starts, it calls:

- fetchCompanies()
- fetchJobs()
- fetchApplications()

These functions read data from Supabase.

### Job filtering and sorting
Filters are applied in api.ts using pure client-side logic.

It supports:
- text search by role or company
- location matching
- remote-only toggles
- category filters
- type filters
- level filters
- minimum salary filter
- newest or salary sorting

---

## 9. How Job Posting Works

When an employer posts a job:

1. PostJobForm sends the payload to AppContext
2. publishJob calls api.postJob
3. supabaseApi.postJob does the following:
   - creates or finds the company row
   - inserts a new row into jobs
4. the job appears instantly on the board

This is saved into Supabase, not the browser memory.

---

## 10. How Application Submission Works

When a candidate applies for a job:

1. ApplyModal collects the candidate details
2. AppContext calls api.createApplication
3. Supabase inserts a new application row
4. the job’s applicants count is incremented
5. the app updates the candidate dashboard and toast notifications

Applications store a full timeline such as:
- submitted
- reviewing
- shortlisted
- interview
- offered
- rejected
- withdrawn

This lifecycle is persisted in the applications table and kept in the JSON timeline field.

---

## 11. How Resume Matching Works

The app includes a resume matching feature.

### Process
- user pastes resume text or uploads a resume
- app extracts known skill keywords from the text
- each job is scored against the resume skill set
- the top matching jobs are shown as recommendations

This is a client-side scoring engine and does not require a backend ML service.

---

## 12. CI/CD Pipeline

GitHub Actions is used to automate quality checks and deployments.

### Workflow file
- .github/workflows/ci-cd.yml

### Jobs
#### quality
Runs on every push and PR.

It does:
- checkout repository
- install dependencies
- run TypeScript checks
- run production build
- upload build artifact

#### deploy-production
Runs only on the main branch.

It does:
- install dependencies
- build the app
- deploy to Vercel using the Vercel CLI

This means the production site is automatically updated whenever code is pushed to main.

---

## 13. Deployment Setup

The project is hosted on Vercel.

### Required Vercel configuration
- project imported into Vercel
- Vercel token created
- project and org IDs saved as GitHub secrets

### Required environment variables
In Vercel project settings, the app expects:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Optional but helpful:

- VITE_APP_ENV=production

The same values are also used locally in .env.local.

---

## 14. Local Environment Setup

The local project uses .env.local with values like:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

These are required for local development and seeding.

### Local startup
```bash
npm install
npm run dev
```

### Production build
```bash
npm run build
```

### Seed database
```bash
npm run seed
```

---

## 15. Database Seeding

When the database is empty, the app needs seed data.

The seeding script reads from the local environment and inserts:
- companies
- jobs
- applications

This creates a working product demo without requiring manual SQL inserts for each record.

---

## 16. Security Notes

The app is intentionally designed with a demo-friendly security model.

### Public-facing values
- VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are public client variables.
- They are safe in the browser because Supabase policies protect the database.

### Admin-only value
- SUPABASE_SERVICE_ROLE_KEY is sensitive and bypasses row-level security.
- It should only be used in local seeding or admin scripts, never in the frontend or in Git.

---

## 17. Current Deployment Status

The app is live on Vercel and connected to Supabase.

Production URL:
- https://careerhub-eight.vercel.app/

GitHub repository:
- https://github.com/kunaManoj/CareerHub

---

## 18. Final Summary

CareerHub is a full-stack job platform built as a frontend-first app with a live Supabase backend.

The project demonstrates:
- real database-driven job listing
- live application flow
- employer posting workflow
- CI/CD deployment automation
- proper environment-based deployment configuration

In simple terms:

- the frontend is React and Vite
- the backend is Supabase PostgreSQL
- the data lives in companies, jobs, applications, and job_alerts tables
- the app is deployed on Vercel and updated automatically through GitHub Actions

This is a complete live SaaS-style demo project with real data persistence, deployment automation, and full app workflow coverage.
