import { useApp } from "../context/AppContext";
import { Icon } from "./icons";
import { fmtSalary, timeAgo } from "../services/api";
import type { Company, Job } from "../types";
import { Reveal } from "../hooks";

export function CompanyLogo({ company, size = "md" }: { company?: Company; size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "h-9 w-9 text-[12px] rounded-md" : size === "lg" ? "h-14 w-14 text-[18px] rounded-xl" : "h-11 w-11 text-[14px] rounded-lg";
  const initials = company
    ? company.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "??";
  return (
    <span
      className={`grid flex-none place-items-center font-display font-bold text-paper shadow-sm ${dims}`}
      style={{ backgroundColor: company?.brand ?? "#5b646a" }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

const chip = "inline-flex items-center gap-1 rounded-[5px] px-1.5 py-0.5 font-mono text-[10.5px] font-medium tracking-wide";

export function JobCard({ job, index = 0 }: { job: Job; index?: number }) {
  const { openJob, toggleSave, savedIds, companyById } = useApp();
  const company = companyById.get(job.companyId);
  const saved = savedIds.includes(job.id);
  const isNew = Date.now() - job.postedAt < 48 * 3_600_000;

  return (
    <Reveal delay={Math.min(index % 5, 4) * 55} className="h-full">
      <article
        className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border bg-surface transition-all duration-300 hover:-translate-y-[3px] hover:shadow-lift ${
          job.featured ? "border-honey-300/70 hover:border-honey-400" : "border-line hover:border-pine-200"
        }`}
        onClick={() => openJob(job.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && openJob(job.id)}
        aria-label={`${job.title} at ${company?.name ?? "company"}`}
      >
        {job.featured && <span className="absolute inset-y-0 left-0 w-[3px] bg-honey-500" />}
        <div className="flex flex-1 gap-3.5 p-4 sm:p-5">
          <CompanyLogo company={company} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-[16.5px] font-bold leading-tight text-ink-900 transition-colors duration-200 group-hover:text-pine-700">
                  {job.title}
                </h3>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[12.5px] text-ink-500">
                  <span className="font-semibold text-ink-700">{company?.name}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1"><Icon name="pin" className="h-3 w-3" />{job.location}</span>
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}
                aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
                aria-pressed={saved}
                className={`-mr-1 -mt-1 rounded-md p-1.5 transition-all duration-200 ${
                  saved ? "text-honey-600 hover:bg-honey-100" : "text-ink-300 hover:bg-mist hover:text-ink-700"
                }`}
              >
                <Icon name={saved ? "bookmark-filled" : "bookmark"} filled={saved} className={`h-[18px] w-[18px] ${saved ? "anim-pop" : ""}`} />
              </button>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className={`${chip} bg-pine-100 text-pine-700`}>{job.level}</span>
              <span className={`${chip} bg-mist text-ink-700`}>{job.type}</span>
              <span className={`${chip} ${job.remote === "Remote" ? "bg-pine-600 text-paper" : "bg-sky2-100 text-sky2-600"}`}>
                {job.remote === "Remote" && <Icon name="globe" className="h-3 w-3" />}
                {job.remote}
              </span>
              {job.tags.slice(0, 3).map((t) => (
                <span key={t} className={`${chip} border border-line bg-surface text-ink-500`}>{t}</span>
              ))}
            </div>
          </div>

          <div className="hidden flex-none flex-col items-end justify-between sm:flex">
            <div className="text-right">
              <p className="font-mono text-[13.5px] font-semibold text-ink-900">{fmtSalary(job.salaryMin, job.salaryMax)}</p>
              <p className="mt-0.5 text-[11px] text-ink-400">/ year</p>
            </div>
            <div className="flex items-center gap-2">
              {job.featured && (
                <span className="inline-flex items-center gap-1 rounded-[5px] bg-honey-100 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-honey-700">
                  <Icon name="spark" filled className="h-3 w-3" />Featured
                </span>
              )}
              {isNew && (
                <span className="inline-flex items-center gap-1 rounded-[5px] bg-pine-100 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-pine-700">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-pine-500" />New
                </span>
              )}
              <span className="text-[11px] text-ink-400">{timeAgo(job.postedAt)}</span>
            </div>
          </div>
        </div>
        {/* mobile meta strip */}
        <div className="flex items-center justify-between border-t border-line/70 px-4 py-2 sm:hidden">
          <span className="font-mono text-[12.5px] font-semibold text-ink-900">{fmtSalary(job.salaryMin, job.salaryMax)}</span>
          <span className="flex items-center gap-2 text-[11px] text-ink-400">
            {job.featured && <span className="font-mono font-bold uppercase text-honey-700">Featured</span>}
            {timeAgo(job.postedAt)}
            <Icon name="arrow-right" className="h-3.5 w-3.5 text-pine-500" />
          </span>
        </div>
      </article>
    </Reveal>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="flex gap-4">
        <div className="skeleton h-11 w-11 rounded-lg" />
        <div className="flex-1 space-y-2.5">
          <div className="skeleton h-4 w-2/5 rounded" />
          <div className="skeleton h-3 w-1/4 rounded" />
          <div className="flex gap-2 pt-1">
            <div className="skeleton h-4 w-14 rounded" />
            <div className="skeleton h-4 w-16 rounded" />
            <div className="skeleton h-4 w-12 rounded" />
          </div>
        </div>
        <div className="hidden w-24 space-y-2 sm:block">
          <div className="skeleton ml-auto h-4 w-24 rounded" />
          <div className="skeleton ml-auto h-3 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}
