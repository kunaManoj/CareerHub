import { useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { CompanyLogo } from "./JobCard";
import { Icon } from "./icons";
import { fmtSalary, timeAgo } from "../services/api";

function ListSection({ title, items, icon }: { title: string; items: string[]; icon: "check" | "target" }) {
  return (
    <section>
      <h4 className="mb-2.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-700">
            <Icon name={icon} className={`mt-[3px] h-3.5 w-3.5 flex-none ${icon === "check" ? "text-pine-500" : "text-honey-600"}`} />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function JobDetail() {
  const { selectedJobId, closeJob, jobs, companyById, savedIds, toggleSave, openApply, applications, openJob } = useApp();

  const job = useMemo(() => jobs.find((j) => j.id === selectedJobId) ?? null, [jobs, selectedJobId]);
  const company = job ? companyById.get(job.companyId) : undefined;
  const applied = applications.some((a) => a.jobId === selectedJobId && a.status !== "withdrawn");
  const saved = selectedJobId ? savedIds.includes(selectedJobId) : false;

  const similar = useMemo(() => {
    if (!job) return [];
    return jobs.filter((j) => j.id !== job.id && j.category === job.category).slice(0, 3);
  }, [jobs, job]);

  useEffect(() => {
    if (!selectedJobId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeJob();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selectedJobId, closeJob]);

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`${job.title} details`}>
      <button className="anim-backdrop absolute inset-0 w-full bg-ink-950/55" onClick={closeJob} aria-label="Close job details" />
      <div className="anim-drawer absolute inset-y-0 right-0 flex w-full max-w-[640px] flex-col bg-paper shadow-drawer">
        {/* header */}
        <div className="flex items-start gap-4 border-b border-line bg-surface px-5 py-5 sm:px-7">
          <CompanyLogo company={company} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {job.featured && (
                <span className="inline-flex items-center gap-1 rounded bg-honey-100 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-honey-700">
                  <Icon name="spark" filled className="h-3 w-3" />Featured
                </span>
              )}
              <span className="font-mono text-[11px] uppercase tracking-wider text-ink-400">{job.category}</span>
            </div>
            <h2 className="mt-1 font-display text-[24px] font-bold leading-tight text-ink-900 sm:text-[27px]">{job.title}</h2>
            <p className="mt-1 text-[13px] text-ink-500">
              <span className="font-semibold text-ink-700">{company?.name}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>{company?.sector}
            </p>
          </div>
          <button
            onClick={closeJob}
            aria-label="Close"
            className="rounded-md p-2 text-ink-400 transition-all hover:rotate-90 hover:bg-mist hover:text-ink-900"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          {/* meta strip */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { icon: "pin" as const, label: "Location", value: job.location },
              { icon: "briefcase" as const, label: "Type", value: `${job.type} · ${job.remote}` },
              { icon: "cap" as const, label: "Level", value: job.level },
              { icon: "user" as const, label: "Applicants", value: `${job.applicants}` },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border border-line bg-surface p-3">
                <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-400">
                  <Icon name={m.icon} className="h-3.5 w-3.5" />{m.label}
                </p>
                <p className="mt-1 text-[13px] font-semibold leading-snug text-ink-900">{m.value}</p>
              </div>
            ))}
          </div>

          {/* salary banner */}
          <div className="mt-4 flex items-center justify-between rounded-lg bg-ink-950 px-4 py-3.5 text-paper">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-ink-300">Base salary</p>
              <p className="mt-0.5 font-mono text-[20px] font-bold text-honey-400">{fmtSalary(job.salaryMin, job.salaryMax)}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">Posted {timeAgo(job.postedAt)}</p>
              <p className="mt-0.5 flex items-center justify-end gap-1.5 text-[12px] text-pine-200">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-pine-400" />Still accepting candidates
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-7">
            <section>
              <h4 className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400">About the role</h4>
              <p className="text-[14px] leading-relaxed text-ink-700">{job.summary}</p>
            </section>

            <ListSection title="What you'll do" items={job.responsibilities} icon="target" />
            <ListSection title="What you'll bring" items={job.requirements} icon="check" />

            <section>
              <h4 className="mb-2.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400">Benefits & perks</h4>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((b) => (
                  <span key={b} className="rounded-md border border-honey-300/50 bg-honey-100/60 px-2.5 py-1.5 text-[12.5px] font-medium text-honey-700">
                    {b}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-center gap-3">
                <CompanyLogo company={company} />
                <div>
                  <h4 className="font-display text-[15px] font-bold text-ink-900">{company?.name}</h4>
                  <p className="font-mono text-[11px] text-ink-400">
                    {company?.location} · {company?.size} people · est. {company?.founded}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-500">{company?.about}</p>
            </section>

            {similar.length > 0 && (
              <section>
                <h4 className="mb-2.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400">Similar {job.category.toLowerCase()} roles</h4>
                <div className="space-y-2">
                  {similar.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => openJob(s.id)}
                      className="group flex w-full items-center gap-3 rounded-lg border border-line bg-surface px-3.5 py-3 text-left transition-all hover:border-pine-200 hover:shadow-card"
                    >
                      <CompanyLogo company={companyById.get(s.companyId)} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-semibold text-ink-900 group-hover:text-pine-700">{s.title}</span>
                        <span className="text-[11.5px] text-ink-400">{companyById.get(s.companyId)?.name} · {s.location}</span>
                      </span>
                      <span className="flex-none font-mono text-[12px] font-semibold text-ink-700">{fmtSalary(s.salaryMin, s.salaryMax)}</span>
                      <Icon name="arrow-right" className="h-4 w-4 flex-none text-ink-300 transition-all group-hover:translate-x-0.5 group-hover:text-pine-600" />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* sticky apply bar */}
        <div className="flex items-center gap-3 border-t border-line bg-surface px-5 py-4 sm:px-7">
          <button
            onClick={() => toggleSave(job.id)}
            aria-pressed={saved}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13.5px] font-bold transition-all ${
              saved
                ? "border-honey-400 bg-honey-100 text-honey-700"
                : "border-linedark bg-surface text-ink-700 hover:border-honey-400 hover:text-honey-700"
            }`}
          >
            <Icon name={saved ? "bookmark-filled" : "bookmark"} filled={saved} className={`h-4 w-4 ${saved ? "anim-pop" : ""}`} />
            {saved ? "Saved" : "Save"}
          </button>
          {job.careersUrl ? (
            <a
              href={job.careersUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-1 items-center justify-center gap-2 rounded-lg border border-pine-200 bg-pine-50 py-2.5 font-display text-[14px] font-bold text-pine-700 shadow-sm transition-all hover:bg-pine-100"
            >
              Apply on company site
              <Icon name="arrow-up-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          ) : null}
          {applied ? (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-pine-100 py-2.5 font-display text-[14px] font-bold text-pine-700">
              <Icon name="check" className="h-4 w-4" strokeWidth={2.5} />
              Application submitted — track it on your dashboard
            </div>
          ) : (
            <button
              onClick={() => openApply(job.id)}
              className="group flex flex-1 items-center justify-center gap-2 rounded-lg bg-pine-600 py-2.5 font-display text-[14px] font-bold text-paper shadow-sm transition-all hover:bg-pine-700 hover:shadow-lift active:scale-[0.985]"
            >
              Apply in CareerHub
              <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
