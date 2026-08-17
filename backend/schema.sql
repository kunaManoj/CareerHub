-- ============================================================
-- CareerHub — PostgreSQL schema (Supabase-compatible)
-- Mirrors src/types.ts exactly, so swapping the client service
-- layer (src/services/api.ts) to live endpoints is 1:1.
--
-- Run the whole file in the Supabase SQL editor. It is fully
-- idempotent: tables/indexes use IF NOT EXISTS and every policy
-- this file manages is dropped before being re-created, so the
-- script is always safe to re-run.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Companies
-- ------------------------------------------------------------
create table if not exists companies (
  id         text primary key,               -- e.g. 'co-arka'
  name       text not null,
  sector     text not null default 'Hiring on CareerHub',
  location   text not null,
  size       text not null default '1–50',
  founded    int  not null default extract(year from now())::int,
  about      text not null default '',
  brand      text not null default '#0d4a3b', -- hex used for the logo tile
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Jobs
-- ------------------------------------------------------------
create table if not exists jobs (
  id               text primary key,          -- e.g. 'ar-1'
  company_id       text not null references companies(id) on delete cascade,
  title            text not null,
  location         text not null,
  remote           text not null check (remote in ('Remote', 'Hybrid', 'On-site')),
  type             text not null check (type in ('Full-time', 'Contract', 'Part-time', 'Internship')),
  level            text not null check (level in ('Junior', 'Mid-level', 'Senior', 'Lead')),
  category         text not null check (category in
                     ('Engineering','Design','Product','Data','Marketing','Sales','Operations','Finance')),
  salary_min       int  not null check (salary_min >= 0),   -- annual, INR
  salary_max       int  not null check (salary_max >= salary_min),
  tags             text[] not null default '{}',
  posted_at        timestamptz not null default now(),
  featured         boolean not null default false,
  applicants       int not null default 0 check (applicants >= 0),
  summary          text not null,
  responsibilities text[] not null default '{}',
  requirements     text[] not null default '{}',
  benefits         text[] not null default '{}',
  careers_url      text,
  created_at       timestamptz not null default now()
);

create index if not exists jobs_posted_at_idx on jobs (posted_at desc);
create index if not exists jobs_category_idx  on jobs (category);
create index if not exists jobs_remote_idx    on jobs (remote);

-- ------------------------------------------------------------
-- Applications (with the full status timeline as JSONB)
-- ------------------------------------------------------------
create table if not exists applications (
  id              text primary key,           -- e.g. 'app-<ts>-<rand>'
  job_id          text not null references jobs(id) on delete cascade,
  candidate_name  text not null,
  email           text not null,
  cover_note      text not null,
  portfolio       text,
  expected_salary int,                        -- annual, INR
  status          text not null default 'submitted' check (status in
                    ('submitted','reviewing','shortlisted','interview','offered','rejected','withdrawn')),
  applied_at      timestamptz not null default now(),
  timeline        jsonb not null default '[]'::jsonb,   -- [{status, at, note}]
  created_at      timestamptz not null default now()
);

create index if not exists applications_job_idx    on applications (job_id);
create index if not exists applications_status_idx on applications (status);

-- ------------------------------------------------------------
-- Job alerts (the "alert me" subscription in the filter rail)
-- ------------------------------------------------------------
create table if not exists job_alerts (
  id         bigserial primary key,
  email      text not null,
  criteria   text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Saved / recently-viewed roles are per-browser UI state and
-- intentionally stay in localStorage — they are not user data
-- worth round-tripping to the server.
-- ------------------------------------------------------------

-- ============================================================
-- Row Level Security (Supabase)
--
-- DEMO MODE (below): the product is an assessment demo with no login
-- screen, so the anon key gets read + write access. Every board,
-- application and posting flow works out of the box.
--
-- PRODUCTION: replace the anon-write policies with auth-scoped ones, e.g.
--   create policy "verified employers post"  on jobs
--     for insert with check (auth.role() = 'authenticated');
--   create policy "candidates read own apps" on applications
--     for select using (auth.uid()::text = split_part(id, ':', 1));
-- and prefix application ids with auth.uid() at insert time.
-- ============================================================
alter table companies     enable row level security;
alter table jobs          enable row level security;
alter table applications  enable row level security;
alter table job_alerts    enable row level security;

-- Clean slate: drop any policies this file manages (incl. legacy names),
-- so the script can be re-run at any time without "already exists" errors.
drop policy if exists "board is public read"            on companies;
drop policy if exists "employers create companies"      on companies;
drop policy if exists "employers post (demo)"           on companies;

drop policy if exists "board is public read"            on jobs;
drop policy if exists "employers post jobs"             on jobs;
drop policy if exists "applicants counter"              on jobs;
drop policy if exists "employers post (demo)"           on jobs;
drop policy if exists "applicants counter (demo)"       on jobs;

drop policy if exists "candidates read applications"    on applications;
drop policy if exists "candidates apply"                on applications;
drop policy if exists "candidates update applications"  on applications;
drop policy if exists "candidates apply (demo)"         on applications;

drop policy if exists "anyone can subscribe"            on job_alerts;

-- companies: public board reads, employers may register while posting
create policy "board is public read"        on companies    for select using (true);
create policy "employers create companies"  on companies    for insert with check (true);

-- jobs: public reads, employer inserts, applicant-counter updates
create policy "board is public read"        on jobs         for select using (true);
create policy "employers post jobs"         on jobs         for insert with check (true);
create policy "applicants counter"          on jobs         for update using (true) with check (true);

-- applications: read + apply + update (withdraw / lifecycle notes)
create policy "candidates read applications"   on applications for select using (true);
create policy "candidates apply"               on applications for insert with check (true);
create policy "candidates update applications" on applications for update using (true) with check (true);

-- job_alerts: anyone can subscribe
create policy "anyone can subscribe"        on job_alerts   for insert with check (true);

-- ============================================================
-- Seed data: src/data/seed.ts exports SEED_COMPANIES / SEED_JOBS /
-- SEED_APPLICATIONS in this exact shape — pipe them through a
-- one-off insert script (or the Supabase dashboard) on first deploy.
-- ============================================================
