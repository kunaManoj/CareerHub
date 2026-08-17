import { useState, type ChangeEvent } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "./icons";
import { Reveal } from "../hooks";
import type { Category, JobLevel, JobType, PostJobPayload, RemotePolicy } from "../types";

const inputCls =
  "w-full rounded-lg border border-linedark bg-surface px-3.5 py-2.5 text-[13.5px] text-ink-900 placeholder:text-ink-300 transition-colors focus:border-pine-500 focus:outline-none focus:ring-2 focus:ring-pine-100";
const labelCls = "mb-1.5 block text-[12px] font-bold text-ink-700";
const selectCls = `${inputCls} appearance-none bg-no-repeat pr-9 cursor-pointer`;

const CATEGORIES: Category[] = ["Engineering", "Design", "Product", "Data", "Marketing", "Sales", "Operations", "Finance"];
const TYPES: JobType[] = ["Full-time", "Contract", "Part-time", "Internship"];
const LEVELS: JobLevel[] = ["Junior", "Mid-level", "Senior", "Lead"];
const REMOTES: RemotePolicy[] = ["Remote", "Hybrid", "On-site"];

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function PostJobForm() {
  const { publishJob } = useApp();
  const [form, setForm] = useState({
    title: "", companyName: "", sector: "", location: "", remote: "Remote" as RemotePolicy,
    type: "Full-time" as JobType, level: "Mid-level" as JobLevel, category: "Engineering" as Category,
    salaryMin: "", salaryMax: "", tags: "", summary: "", responsibilities: "", requirements: "", benefits: "", careersUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false);

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 4) e.title = "Give the role a clear title";
    if (form.companyName.trim().length < 2) e.companyName = "Company name is required";
    if (form.location.trim().length < 2) e.location = "Where is this role based?";
    if (form.careersUrl.trim() && !/^https?:\/\/.+/i.test(form.careersUrl.trim())) {
      e.careersUrl = "Use a valid http or https careers URL";
    }
    const min = Number(form.salaryMin);
    const max = Number(form.salaryMax);
    if (!form.salaryMin || Number.isNaN(min) || min < 100000) e.salaryMin = "Enter a realistic minimum (₹/yr)";
    if (!form.salaryMax || Number.isNaN(max) || max <= min) e.salaryMax = "Must be above the minimum";
    if (form.summary.trim().length < 40) e.summary = "Write at least a sentence or two (40+ characters)";
    if (lines(form.responsibilities).length < 2) e.responsibilities = "List at least 2 responsibilities, one per line";
    if (lines(form.requirements).length < 2) e.requirements = "List at least 2 requirements, one per line";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setPublishing(true);
    const payload: PostJobPayload = {
      title: form.title,
      companyName: form.companyName,
      sector: form.sector,
      location: form.location,
      remote: form.remote,
      type: form.type,
      level: form.level,
      category: form.category,
      salaryMin: Number(form.salaryMin),
      salaryMax: Number(form.salaryMax),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      summary: form.summary,
      responsibilities: lines(form.responsibilities),
      requirements: lines(form.requirements),
      benefits: form.benefits.split(",").map((b) => b.trim()).filter(Boolean),
      careersUrl: form.careersUrl.trim() || undefined,
    };
    await publishJob(payload);
    setPublishing(false);
  };

  const err = (k: string) => errors[k] && <p className="mt-1 text-[11px] font-semibold text-coral-500">{errors[k]}</p>;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-20 pt-12 sm:px-6">
      <Reveal>
        <p className="flex items-center justify-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-600">
          <Icon name="building" className="h-4 w-4" />Employer console
        </p>
        <h1 className="mt-3 text-center font-display text-[clamp(30px,5vw,44px)] font-bold leading-[1.02] tracking-tight text-ink-900">
          Put a role in front of<br />
          <span className="text-pine-600">people who ship.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-[520px] text-center text-[14.5px] leading-relaxed text-ink-500">
          Listings go live on the board instantly. Transparent salary ranges get
          <span className="font-semibold text-ink-800"> 3.2× more qualified applicants</span> — the range is required for a reason.
        </p>
      </Reveal>

      <Reveal delay={120}>
        <div className="mx-auto mt-9 max-w-4xl rounded-xl border border-line bg-surface/90 p-5 shadow-card sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="pj-title">Role title *</label>
              <input id="pj-title" className={inputCls} placeholder="Senior Backend Engineer" value={form.title} onChange={set("title")} />
              {err("title")}
            </div>
            <div>
              <label className={labelCls} htmlFor="pj-company">Company *</label>
              <input id="pj-company" className={inputCls} placeholder="e.g. Nivaan Cloud" value={form.companyName} onChange={set("companyName")} />
              {err("companyName")}
            </div>
            <div>
              <label className={labelCls} htmlFor="pj-sector">Sector</label>
              <input id="pj-sector" className={inputCls} placeholder="Fintech" value={form.sector} onChange={set("sector")} />
            </div>
            <div>
              <label className={labelCls} htmlFor="pj-location">Location *</label>
              <input id="pj-location" className={inputCls} placeholder="Hyderabad / Bengaluru / Remote (India)" value={form.location} onChange={set("location")} />
              {err("location")}
            </div>
            <div>
              <label className={labelCls} htmlFor="pj-tags">Skills (comma-separated)</label>
              <input id="pj-tags" className={inputCls} placeholder="Go, Kubernetes, gRPC" value={form.tags} onChange={set("tags")} />
            </div>
            <div>
              <label className={labelCls} htmlFor="pj-careers">Careers link (optional)</label>
              <input id="pj-careers" className={inputCls} placeholder="https://company.com/careers" value={form.careersUrl} onChange={set("careersUrl")} />
              {err("careersUrl")}
            </div>

            <div>
              <label className={labelCls} htmlFor="pj-category">Category</label>
              <div className="relative">
                <select id="pj-category" className={selectCls} value={form.category} onChange={set("category")}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <Chevron />
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="pj-remote">Workplace</label>
              <div className="relative">
                <select id="pj-remote" className={selectCls} value={form.remote} onChange={set("remote")}>
                  {REMOTES.map((r) => <option key={r}>{r}</option>)}
                </select>
                <Chevron />
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="pj-type">Contract type</label>
              <div className="relative">
                <select id="pj-type" className={selectCls} value={form.type} onChange={set("type")}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <Chevron />
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="pj-level">Experience level</label>
              <div className="relative">
                <select id="pj-level" className={selectCls} value={form.level} onChange={set("level")}>
                  {LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
                <Chevron />
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="pj-salmin">Salary min (₹/yr) *</label>
              <input id="pj-salmin" inputMode="numeric" className={inputCls} placeholder="e.g. 1200000" value={form.salaryMin} onChange={set("salaryMin")} />
              {err("salaryMin")}
            </div>
            <div>
              <label className={labelCls} htmlFor="pj-salmax">Salary max (₹/yr) *</label>
              <input id="pj-salmax" inputMode="numeric" className={inputCls} placeholder="e.g. 2400000" value={form.salaryMax} onChange={set("salaryMax")} />
              {err("salaryMax")}
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="pj-summary">Role summary *</label>
              <textarea id="pj-summary" rows={3} className={`${inputCls} resize-none`} placeholder="Two or three sentences on the mission, the team and what success looks like in year one." value={form.summary} onChange={set("summary")} />
              {err("summary")}
            </div>
            <div>
              <label className={labelCls} htmlFor="pj-resp">Responsibilities — one per line *</label>
              <textarea id="pj-resp" rows={6} className={`${inputCls} resize-none font-mono text-[12.5px]`} placeholder={"Own the billing service roadmap\nMentor two mid-level engineers"} value={form.responsibilities} onChange={set("responsibilities")} />
              {err("responsibilities")}
            </div>
            <div>
              <label className={labelCls} htmlFor="pj-req">Requirements — one per line *</label>
              <textarea id="pj-req" rows={6} className={`${inputCls} resize-none font-mono text-[12.5px]`} placeholder={"5+ years with Go in production\nDeep Postgres experience"} value={form.requirements} onChange={set("requirements")} />
              {err("requirements")}
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="pj-benefits">Benefits (comma-separated)</label>
              <input id="pj-benefits" className={inputCls} placeholder="ESOPs, family health cover, WFH budget" value={form.benefits} onChange={set("benefits")} />
            </div>
          </div>

          <div className="mt-7 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
            <p className="flex items-center gap-2 text-[12px] text-ink-400">
              <Icon name="shield" className="h-4 w-4 text-pine-500" />
              Published instantly · editable from the board
            </p>
            <button
              onClick={handleSubmit}
              disabled={publishing}
              className="group flex items-center gap-2 rounded-lg bg-honey-500 px-7 py-3 font-display text-[15px] font-bold text-ink-950 shadow-sm transition-all hover:bg-honey-400 hover:shadow-lift active:scale-[0.97] disabled:cursor-wait disabled:opacity-70"
            >
              {publishing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/25 border-t-ink-950" />
                  Publishing…
                </>
              ) : (
                <>
                  Publish to the board
                  <Icon name="arrow-up-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
