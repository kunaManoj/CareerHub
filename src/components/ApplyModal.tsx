import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "./icons";
import { fmtSalary } from "../services/api";

const inputCls =
  "w-full rounded-lg border border-linedark bg-surface px-3.5 py-2.5 text-[13.5px] text-ink-900 placeholder:text-ink-300 transition-colors focus:border-pine-500 focus:outline-none focus:ring-2 focus:ring-pine-100";

export function ApplyModal() {
  const { applyJobId, closeApply, jobs, companyById, submitApplication } = useApp();
  const job = useMemo(() => jobs.find((j) => j.id === applyJobId) ?? null, [jobs, applyJobId]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [salary, setSalary] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!applyJobId) return;
    setName(""); setEmail(""); setPortfolio(""); setSalary(""); setNote("");
    setErrors({}); setSubmitting(false); setDone(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeApply();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [applyJobId, closeApply]);

  if (!job) return null;
  const company = companyById.get(job.companyId);

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "Please enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (note.trim().length < 30) e.note = "Tell them a little more (at least 30 characters)";
    if (salary && Number.isNaN(Number(salary))) e.salary = "Numbers only";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await submitApplication({
      jobId: job.id,
      candidateName: name,
      email,
      coverNote: note,
      portfolio: portfolio || undefined,
      expectedSalary: salary ? Number(salary) : undefined,
    });
    setSubmitting(false);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Apply to ${job.title}`}>
      <button className="anim-backdrop absolute inset-0 w-full bg-ink-950/60" onClick={closeApply} aria-label="Close application form" />
      <div className="anim-pop relative w-full max-w-[520px] overflow-hidden rounded-t-2xl border border-line bg-paper shadow-lift sm:rounded-xl" style={{ animationDuration: "0.4s" }}>
        {done ? (
          <div className="px-8 py-12 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-pine-100">
              <svg viewBox="0 0 24 24" className="anim-check h-8 w-8" fill="none" stroke="var(--color-pine-600)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m4.5 12.5 5 5L19.5 7" />
              </svg>
            </div>
            <h3 className="mt-5 font-display text-[24px] font-bold text-ink-900">Application sent</h3>
            <p className="mx-auto mt-2 max-w-[340px] text-[13.5px] leading-relaxed text-ink-500">
              Your application for <span className="font-semibold text-ink-800">{job.title}</span> at {company?.name} is in.
              Watch your dashboard — status updates land there in real time.
            </p>
            <button
              onClick={closeApply}
              className="mt-6 rounded-lg bg-pine-600 px-6 py-2.5 font-display text-[14px] font-bold text-paper transition-all hover:bg-pine-700 hover:shadow-lift"
            >
              Track it on my dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-line bg-surface px-6 py-4">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-pine-600">Application</p>
                <h3 className="font-display text-[18px] font-bold text-ink-900">{job.title}</h3>
                <p className="text-[12px] text-ink-500">{company?.name} · {fmtSalary(job.salaryMin, job.salaryMax)}</p>
              </div>
              <button onClick={closeApply} aria-label="Close" className="rounded-md p-2 text-ink-400 transition-all hover:rotate-90 hover:bg-mist hover:text-ink-900">
                <Icon name="x" className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[62vh] overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="app-name" className="mb-1.5 block text-[12px] font-bold text-ink-700">Full name *</label>
                  <input id="app-name" className={inputCls} placeholder="Alex Rivera" value={name} onChange={(e) => setName(e.target.value)} />
                  {errors.name && <p className="mt-1 text-[11px] font-semibold text-coral-500">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="app-email" className="mb-1.5 block text-[12px] font-bold text-ink-700">Email *</label>
                  <input id="app-email" type="email" className={inputCls} placeholder="alex@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  {errors.email && <p className="mt-1 text-[11px] font-semibold text-coral-500">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="app-portfolio" className="mb-1.5 block text-[12px] font-bold text-ink-700">Portfolio / LinkedIn</label>
                  <input id="app-portfolio" className={inputCls} placeholder="https://…" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="app-salary" className="mb-1.5 block text-[12px] font-bold text-ink-700">Expected salary (₹/yr)</label>
                  <input id="app-salary" inputMode="numeric" className={inputCls} placeholder="e.g. 1800000" value={salary} onChange={(e) => setSalary(e.target.value)} />
                  {errors.salary && <p className="mt-1 text-[11px] font-semibold text-coral-500">{errors.salary}</p>}
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex items-baseline justify-between">
                  <label htmlFor="app-note" className="text-[12px] font-bold text-ink-700">Cover note *</label>
                  <span className={`font-mono text-[11px] ${note.length >= 30 ? "text-pine-600" : "text-ink-400"}`}>{note.length}/600</span>
                </div>
                <textarea
                  id="app-note"
                  rows={5}
                  maxLength={600}
                  className={`${inputCls} resize-none`}
                  placeholder="Why this role, why now? Two or three sharp sentences beat a wall of text."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                {errors.note && <p className="mt-1 text-[11px] font-semibold text-coral-500">{errors.note}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line bg-surface px-6 py-4">
              <p className="text-[11.5px] leading-snug text-ink-400">
                Applies instantly.<br />Withdraw anytime from your dashboard.
              </p>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="group flex items-center gap-2 rounded-lg bg-pine-600 px-6 py-2.5 font-display text-[14px] font-bold text-paper transition-all hover:bg-pine-700 hover:shadow-lift active:scale-[0.97] disabled:cursor-wait disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
                    Sending…
                  </>
                ) : (
                  <>
                    Submit application
                    <Icon name="send" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
