/**
 * CareerHub — database seeder.
 *
 * Loads SEED_COMPANIES / SEED_JOBS / SEED_APPLICATIONS from src/data/seed.ts
 * into a Supabase project. Uses the SERVICE ROLE key so RLS is bypassed.
 *
 * The script resolves credentials in order:
 *   1. real environment variables (any shell)
 *   2. .env.local, then .env in the repo root
 * It also accepts VITE_SUPABASE_URL as a fallback for SUPABASE_URL.
 *
 * So on any OS/shell you can simply run:
 *   npm run seed
 *
 * Or inline (bash/zsh):
 *   SUPABASE_URL=https://xxxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   npm run seed
 *
 * PowerShell one-liner alternative:
 *   $env:SUPABASE_URL="..."; $env:SUPABASE_SERVICE_ROLE_KEY="..."; npm run seed
 *
 * Safe to re-run: rows are upserted on their primary keys.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { SEED_APPLICATIONS, SEED_COMPANIES, SEED_JOBS } from "../src/data/seed";

/* ---------- tiny dotenv: keeps `npm run seed` shell-agnostic ---------- */
function loadDotEnv(file: string): Record<string, string> {
  try {
    const raw = fs.readFileSync(path.resolve(process.cwd(), file), "utf8");
    const out: Record<string, string> = {};
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !line.trim().startsWith("#")) {
        out[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
    return out;
  } catch {
    return {};
  }
}
const fileEnv = { ...loadDotEnv(".env"), ...loadDotEnv(".env.local") };
const env = (key: string) => process.env[key] ?? fileEnv[key];

const url = env("SUPABASE_URL") ?? env("VITE_SUPABASE_URL");
const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");

if (!url || !serviceKey) {
  console.error(
    "Missing credentials. Add to .env.local:\n" +
      "  SUPABASE_SERVICE_ROLE_KEY=eyJ...   (and VITE_SUPABASE_URL for the project)\n" +
      "Then run:  npm run seed",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

/* ---------------- row mappers (domain → snake_case) ---------------- */

const companyRows = SEED_COMPANIES.map((c) => ({
  id: c.id, name: c.name, sector: c.sector, location: c.location,
  size: c.size, founded: c.founded, about: c.about, brand: c.brand,
}));

const jobRows = SEED_JOBS.map((j) => ({
  id: j.id, company_id: j.companyId, title: j.title, location: j.location,
  remote: j.remote, type: j.type, level: j.level, category: j.category,
  salary_min: j.salaryMin, salary_max: j.salaryMax, tags: j.tags,
  posted_at: new Date(j.postedAt).toISOString(), featured: j.featured ?? false,
  applicants: j.applicants, summary: j.summary,
  responsibilities: j.responsibilities, requirements: j.requirements, benefits: j.benefits,
}));

const appRows = SEED_APPLICATIONS.map((a) => ({
  id: a.id, job_id: a.jobId, candidate_name: a.candidateName, email: a.email,
  cover_note: a.coverNote, portfolio: a.portfolio ?? null,
  expected_salary: a.expectedSalary ?? null, status: a.status,
  applied_at: new Date(a.appliedAt).toISOString(), timeline: a.timeline,
}));

async function run() {
  console.log(`→ Seeding CareerHub (${url.replace("https://", "").replace(".supabase.co", "")})…`);

  const c = await supabase.from("companies").upsert(companyRows, { onConflict: "id" });
  if (c.error) throw c.error;
  console.log(`  ✓ ${companyRows.length} companies`);

  const j = await supabase.from("jobs").upsert(jobRows, { onConflict: "id" });
  if (j.error) throw j.error;
  console.log(`  ✓ ${jobRows.length} jobs`);

  const a = await supabase.from("applications").upsert(appRows, { onConflict: "id" });
  if (a.error) throw a.error;
  console.log(`  ✓ ${appRows.length} applications`);

  console.log("\nDone. Refresh the app — the board now loads from your database.");
}

run().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
