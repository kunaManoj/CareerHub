/**
 * CareerHub service layer — the single data-access boundary.
 *
 * All business data (companies, jobs, applications, postings, alerts) is read
 * and written through the Supabase API (see ./supabaseApi.ts). There is no
 * bundled/local fallback: the app is configured at boot (./supabaseClient.ts)
 * and the UI only renders once a live backend is present.
 *
 * Per-browser UI state (saved roles, recently-viewed) intentionally lives in
 * localStorage — it is a viewing preference, not user data, and the schema
 * (backend/schema.sql) documents the same decision.
 */
import type {
  Application, Company, Filters, Job, SortKey,
} from "../types";
import * as supabaseApi from "./supabaseApi";

/* ------------------------------------------------------------------ */
/* Business data — Supabase                                            */
/* ------------------------------------------------------------------ */

export const fetchCompanies = supabaseApi.fetchCompanies;
export const fetchJobs = supabaseApi.fetchJobs;
export const fetchApplications = supabaseApi.fetchApplications;
export const postJob = supabaseApi.postJob;
export const subscribeAlert = supabaseApi.subscribeAlert;
export const persistProgress = supabaseApi.persistProgress;

/** Ids created during this page session — the only ones the live simulation advances. */
const sessionAppIds = new Set<string>();

export async function createApplication(
  input: Parameters<typeof supabaseApi.createApplication>[0],
) {
  const app = await supabaseApi.createApplication(input);
  sessionAppIds.add(app.id);
  return app;
}

export async function withdrawApplication(id: string) {
  sessionAppIds.delete(id);
  return supabaseApi.withdrawApplication(id);
}

/* ------------------------------------------------------------------ */
/* Derived helpers (pure, run in the client)                           */
/* ------------------------------------------------------------------ */

export function companyMap(companies: Company[]): Map<string, Company> {
  return new Map(companies.map((c) => [c.id, c]));
}

const matches = (hay: string, needle: string) =>
  hay.toLowerCase().includes(needle.trim().toLowerCase());

export function applyFilters(jobs: Job[], companies: Map<string, Company>, f: Filters): Job[] {
  let out = jobs.filter((j) => {
    const co = companies.get(j.companyId);
    if (f.query) {
      const hay = `${j.title} ${co?.name ?? ""} ${j.category} ${j.tags.join(" ")} ${j.location}`;
      if (!matches(hay, f.query)) return false;
    }
    if (f.location && !matches(`${j.location} ${co?.location ?? ""}`, f.location)) return false;
    if (f.remoteOnly && j.remote !== "Remote") return false;
    if (f.categories.length && !f.categories.includes(j.category)) return false;
    if (f.types.length && !f.types.includes(j.type)) return false;
    if (f.levels.length && !f.levels.includes(j.level)) return false;
    if (j.salaryMax < f.minSalary) return false;
    return true;
  });

  const sorters: Record<SortKey, (a: Job, b: Job) => number> = {
    newest: (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false) || b.postedAt - a.postedAt,
    "salary-high": (a, b) => b.salaryMax - a.salaryMax,
    "salary-low": (a, b) => a.salaryMin - b.salaryMin,
  };
  return [...out].sort(sorters[f.sort]);
}

/* ------------------------------------------------------------------ */
/* Hiring-lifecycle simulation (persisted to Supabase)                 */
/* ------------------------------------------------------------------ */

const PROGRESS: { status: Application["status"]; afterSec: number; note: string }[] = [
  { status: "reviewing", afterSec: 12, note: "The hiring team opened your application." },
  { status: "shortlisted", afterSec: 100, note: "You made the shortlist — nice work." },
  { status: "interview", afterSec: 360, note: "Interview loop is being scheduled." },
];
const TERMINAL: Application["status"][] = ["offered", "rejected", "withdrawn"];

/**
 * Advance session-created, non-terminal applications whose age has crossed a
 * threshold. Pure compute — the caller (AppContext) persists `changed` via
 * persistProgress(), so writes happen exactly once.
 */
export function progressApplications(apps: Application[]): { next: Application[]; changed: Application[] } {
  const now = Date.now();
  const order: Application["status"][] = ["submitted", "reviewing", "shortlisted", "interview"];
  const changed: Application[] = [];

  const next = apps.map((a) => {
    if (!sessionAppIds.has(a.id) || TERMINAL.includes(a.status)) return a;
    const elapsed = (now - a.appliedAt) / 1000;
    let target: (typeof PROGRESS)[number] | undefined;
    for (const step of PROGRESS) {
      if (elapsed >= step.afterSec) target = step;
    }
    if (!target) return a;
    const currentIdx = order.indexOf(a.status);
    const targetIdx = order.indexOf(target.status);
    if (targetIdx <= currentIdx) return a;
    const updated: Application = {
      ...a,
      status: target.status,
      timeline: [...a.timeline, { status: target.status, at: now, note: target.note }],
    };
    changed.push(updated);
    return updated;
  });

  return { next, changed };
}

/* ------------------------------------------------------------------ */
/* Per-browser UI state (localStorage)                                 */
/* ------------------------------------------------------------------ */

const UI = { saved: "careerhub.saved.v1", recent: "careerhub.recent.v1" };

function readUi<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeUi(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — keep in-memory */
  }
}

export function fetchSavedIds(): string[] {
  return readUi<string[]>(UI.saved, []);
}

export function persistSavedIds(ids: string[]) {
  writeUi(UI.saved, ids);
}

export function fetchRecentIds(): string[] {
  return readUi<string[]>(UI.recent, []);
}

export function pushRecentId(id: string): string[] {
  const next = [id, ...readUi<string[]>(UI.recent, []).filter((x) => x !== id)].slice(0, 4);
  writeUi(UI.recent, next);
  return next;
}

/* ------------------------------------------------------------------ */
/* Formatters                                                          */
/* ------------------------------------------------------------------ */

/** Formats annual INR in the Indian convention: ₹8L – ₹14L, ₹1.2Cr – ₹1.8Cr. */
const inr = (n: number): string => {
  if (n >= 10_000_000) {
    const cr = n / 10_000_000;
    return `₹${cr >= 10 ? Math.round(cr) : cr.toFixed(1).replace(/\.0$/, "")}Cr`;
  }
  if (n >= 100_000) {
    const l = n / 100_000;
    return `₹${l >= 10 ? Math.round(l) : l.toFixed(1).replace(/\.0$/, "")}L`;
  }
  return `₹${Math.round(n / 1000)}K`;
};

export function fmtSalary(min: number, max: number): string {
  return `${inr(min)} – ${inr(max)}`;
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const hrs = Math.floor(diff / 3_600_000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return `${Math.floor(weeks / 4)}mo ago`;
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/* ------------------------------------------------------------------ */
/* Resume matching (client-side)                                       */
/* ------------------------------------------------------------------ */

export const SKILL_DICTIONARY = [
  "React", "TypeScript", "JavaScript", "Node.js", "Tailwind", "D3", "WebGL", "Next.js",
  "Kubernetes", "Docker", "Terraform", "AWS", "GCP", "Azure", "Go", "Rust", "gRPC", "Kafka",
  "Java", "Kotlin", "Spring Boot", "Postgres", "MySQL", "SQL", "Redis", "CI/CD", "SRE", "GitOps",
  "Python", "PyTorch", "TensorFlow", "Pandas", "LLMs", "NLP", "MLOps", "Ray", "MLflow", "R",
  "Airflow", "dbt", "Snowflake", "Looker", "Power BI", "Tableau", "Spark",
  "React Native", "Android", "iOS", "Flutter", "Unity", "C#", "Game design",
  "Figma", "Design systems", "Accessibility", "Prototyping", "UX research",
  "UPI", "KYC/AML", "FP&A", "Excel", "ERP", "CRM", "SaaS", "SEO", "IoT", "Modbus", "SCADA",
];

export interface ResumeMatchResult {
  job: Job;
  score: number;
  matched: string[];
}

const GENERIC_TITLE_WORDS = new Set([
  "senior", "junior", "lead", "manager", "engineering", "engineer", "product", "principal",
  "staff", "intern", "associate", "head", "director", "specialist",
]);

function skillInText(skill: string, text: string): boolean {
  const escaped = skill.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

/** Extract known skills from resume text and score every live job against them. */
export function analyzeResume(resumeText: string, jobs: Job[]): {
  matches: ResumeMatchResult[];
  skills: string[];
} {
  const skills = SKILL_DICTIONARY.filter((s) => skillInText(s, resumeText));
  const scored = jobs
    .map((job) => {
      let raw = 0;
      const matched: string[] = [];
      job.tags.forEach((tag) => {
        if (skillInText(tag, resumeText)) {
          raw += 22;
          matched.push(tag);
        }
      });
      job.title
        .split(/[^a-zA-Z0-9+#]+/)
        .filter((w) => w.length > 2 && !GENERIC_TITLE_WORDS.has(w.toLowerCase()))
        .forEach((w) => {
          if (skillInText(w, resumeText)) raw += 9;
        });
      if (skillInText(job.category, resumeText)) raw += 6;
      if (skillInText(job.level, resumeText)) raw += 3;
      const ceiling = job.tags.length * 22 + 27;
      const score = raw > 0 ? Math.max(41, Math.min(96, Math.round((raw / ceiling) * 100))) : 0;
      return { job, matched, score };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score || b.job.salaryMax - a.job.salaryMax);
  return { matches: scored.slice(0, 5), skills };
}
