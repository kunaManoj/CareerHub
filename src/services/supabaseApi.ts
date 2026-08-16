/**
 * Live API implementation — Supabase (Postgres + RLS).
 *
 * Every function mirrors the signature of its local counterpart in api.ts,
 * so the mode switch is invisible to the rest of the app. Row shapes are
 * mapped snake_case (DB) ↔ camelCase (domain types) at this boundary only.
 */
import { supabase } from "./supabaseClient";
import type {
  Application, AppStatus, Company, Job, PostJobPayload, TimelineEntry,
} from "../types";

/* ------------------------------------------------------------------ */
/* Row mappers                                                         */
/* ------------------------------------------------------------------ */

type CompanyRow = {
  id: string; name: string; sector: string; location: string;
  size: string; founded: number; about: string; brand: string;
};

type JobRow = {
  id: string; company_id: string; title: string; location: string;
  remote: Job["remote"]; type: Job["type"]; level: Job["level"]; category: Job["category"];
  salary_min: number; salary_max: number; tags: string[]; posted_at: string;
  featured: boolean; applicants: number; summary: string;
  responsibilities: string[]; requirements: string[]; benefits: string[];
};

type ApplicationRecord = {
  id: string; job_id: string; candidate_name: string; email: string; cover_note: string;
  portfolio: string | null; expected_salary: number | null; status: AppStatus;
  applied_at: string; timeline: TimelineEntry[];
};

const toCompany = (r: CompanyRow): Company => ({
  id: r.id, name: r.name, sector: r.sector, location: r.location,
  size: r.size, founded: r.founded, about: r.about, brand: r.brand,
});

const toJob = (r: JobRow): Job => ({
  id: r.id, companyId: r.company_id, title: r.title, location: r.location,
  remote: r.remote, type: r.type, level: r.level, category: r.category,
  salaryMin: r.salary_min, salaryMax: r.salary_max, tags: r.tags ?? [],
  postedAt: new Date(r.posted_at).getTime(), featured: r.featured || undefined,
  applicants: r.applicants, summary: r.summary,
  responsibilities: r.responsibilities ?? [], requirements: r.requirements ?? [],
  benefits: r.benefits ?? [],
});

const toApplication = (r: ApplicationRecord): Application => ({
  id: r.id, jobId: r.job_id, candidateName: r.candidate_name, email: r.email,
  coverNote: r.cover_note, portfolio: r.portfolio ?? undefined,
  expectedSalary: r.expected_salary ?? undefined, status: r.status,
  appliedAt: new Date(r.applied_at).getTime(), timeline: r.timeline ?? [],
});

function assertOk(error: { message: string } | null, op: string) {
  if (error) throw new Error(`CareerHub API (${op}): ${error.message}`);
}

const client = () => {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
};

/* ------------------------------------------------------------------ */
/* Read endpoints                                                      */
/* ------------------------------------------------------------------ */

export async function fetchCompanies(): Promise<Company[]> {
  const { data, error } = await client().from("companies").select("*").order("name");
  assertOk(error, "fetchCompanies");
  return (data as CompanyRow[]).map(toCompany);
}

export async function fetchJobs(): Promise<Job[]> {
  const { data, error } = await client().from("jobs").select("*").order("posted_at", { ascending: false });
  assertOk(error, "fetchJobs");
  return (data as JobRow[]).map(toJob);
}

export async function fetchApplications(): Promise<Application[]> {
  const { data, error } = await client()
    .from("applications").select("*").order("applied_at", { ascending: false });
  assertOk(error, "fetchApplications");
  return (data as ApplicationRecord[]).map(toApplication);
}

/* ------------------------------------------------------------------ */
/* Write endpoints                                                     */
/* ------------------------------------------------------------------ */

export async function createApplication(input: {
  jobId: string; candidateName: string; email: string; coverNote: string;
  portfolio?: string; expectedSalary?: number;
}): Promise<Application> {
  const db = client();
  const now = Date.now();
  const id = `app-${now}-${Math.random().toString(36).slice(2, 7)}`;
  const row: ApplicationRecord = {
    id,
    job_id: input.jobId,
    candidate_name: input.candidateName.trim(),
    email: input.email.trim(),
    cover_note: input.coverNote.trim(),
    portfolio: input.portfolio?.trim() || null,
    expected_salary: input.expectedSalary ?? null,
    status: "submitted",
    applied_at: new Date(now).toISOString(),
    timeline: [{ status: "submitted", at: now, note: "Application delivered to the hiring team." }],
  };
  const { error } = await db.from("applications").insert(row);
  assertOk(error, "createApplication");

  // bump the public applicant counter on the job
  const { data: jobRow } = await db.from("jobs").select("applicants").eq("id", input.jobId).single();
  if (jobRow) {
    await db.from("jobs").update({ applicants: (jobRow as { applicants: number }).applicants + 1 }).eq("id", input.jobId);
  }
  return toApplication(row);
}

export async function withdrawApplication(id: string): Promise<Application[]> {
  const db = client();
  const { data: existing, error: readError } = await db.from("applications").select("*").eq("id", id).single();
  assertOk(readError, "withdrawApplication.read");
  const row = existing as ApplicationRecord;
  if (row.status !== "withdrawn") {
    const timeline: TimelineEntry[] = [
      ...(row.timeline ?? []),
      { status: "withdrawn", at: Date.now(), note: "You withdrew this application." },
    ];
    const { error } = await db.from("applications")
      .update({ status: "withdrawn", timeline }).eq("id", id);
    assertOk(error, "withdrawApplication.update");
  }
  return fetchApplications();
}

/** Persist lifecycle-engine transitions produced by the client simulation. */
export async function persistProgress(changed: Application[]): Promise<void> {
  const db = client();
  await Promise.all(
    changed.map((a) =>
      db.from("applications").update({ status: a.status, timeline: a.timeline }).eq("id", a.id),
    ),
  );
}

export async function postJob(payload: PostJobPayload): Promise<{ job: Job; company: Company }> {
  const db = client();
  const slug = payload.companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // find-or-create the company by name
  const { data: found } = await db.from("companies").select("*")
    .ilike("name", payload.companyName.trim()).limit(1);
  let company: Company;
  if (found && found.length > 0) {
    company = toCompany(found[0] as CompanyRow);
  } else {
    const BRAND_POOL = ["#14614E", "#33698A", "#6B4F8A", "#9C5B33", "#5F7D33", "#A8455E", "#232A2F"];
    const brand = BRAND_POOL[Math.abs(slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % BRAND_POOL.length];
    const row: CompanyRow = {
      id: `co-${slug}-${Date.now().toString(36)}`,
      name: payload.companyName.trim(),
      sector: payload.sector.trim() || "Hiring on CareerHub",
      location: payload.location,
      size: "1–50",
      founded: new Date().getFullYear(),
      about: `${payload.companyName.trim()} is hiring through CareerHub. ${payload.summary.split(".")[0]}.`,
      brand,
    };
    const { error } = await db.from("companies").insert(row);
    assertOk(error, "postJob.company");
    company = toCompany(row);
  }

  const jobRow: JobRow = {
    id: `job-${Date.now().toString(36)}`,
    company_id: company.id,
    title: payload.title.trim(),
    location: payload.location.trim(),
    remote: payload.remote,
    type: payload.type,
    level: payload.level,
    category: payload.category,
    salary_min: payload.salaryMin,
    salary_max: payload.salaryMax,
    tags: payload.tags.slice(0, 5),
    posted_at: new Date().toISOString(),
    featured: false,
    applicants: 0,
    summary: payload.summary.trim(),
    responsibilities: payload.responsibilities,
    requirements: payload.requirements,
    benefits: payload.benefits.length ? payload.benefits : ["Competitive compensation", "Flexible working arrangements"],
  };
  const { error } = await db.from("jobs").insert(jobRow);
  assertOk(error, "postJob.job");
  return { job: toJob(jobRow), company };
}

export async function subscribeAlert(email: string, criteria: string): Promise<void> {
  const { error } = await client().from("job_alerts").insert({ email, criteria });
  assertOk(error, "subscribeAlert");
}
