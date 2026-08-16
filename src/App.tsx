import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/Header";
import { ResumeMatch } from "./components/ResumeMatch";
import { FilterRail, FilterRailContent } from "./components/FilterRail";
import { JobCard, JobCardSkeleton, CompanyLogo } from "./components/JobCard";
import { JobDetail } from "./components/JobDetail";
import { ApplyModal } from "./components/ApplyModal";
import { PostJobForm } from "./components/PostJobForm";
import { Dashboard } from "./components/Dashboard";
import { OfferShowcase } from "./components/OfferShowcase";
import { Toasts } from "./components/Toasts";
import { Icon, LogoMark } from "./components/icons";
import { Reveal, useCountUp } from "./hooks";
import { fmtSalary, timeAgo } from "./services/api";
import { isSupabaseConfigured } from "./services/supabaseClient";
import { BackendSetup } from "./components/BackendSetup";
import type { SortKey } from "./types";

/* ------------------------------- board hero ------------------------------ */

function Stat({ value, suffix, label, icon }: { value: number; suffix?: string; label: string; icon: ComponentProps<typeof Icon>["name"] }) {
  const n = useCountUp(value, 1100);
  return (
    <div className="group relative overflow-hidden rounded-lg border border-line bg-surface/85 px-5 py-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-pine-200 hover:shadow-card">
      <Icon name={icon} className="absolute right-4 top-4 h-4 w-4 text-pine-500/45 transition-colors group-hover:text-pine-600" />
      <p className="font-display text-[27px] font-bold leading-none text-ink-900 transition-colors group-hover:text-pine-700">
        {n}{suffix}
      </p>
      <p className="mt-1.5 whitespace-nowrap font-mono text-[9.5px] font-bold uppercase tracking-[0.13em] text-ink-400">{label}</p>
      <span className="absolute inset-x-0 bottom-0 h-[2.5px] origin-left scale-x-0 bg-pine-500 transition-transform duration-300 ease-out group-hover:scale-x-100" />
    </div>
  );
}

function BoardHero() {
  const { filters, patchFilters, jobs, companyById, openJob, companies } = useApp();
  const [q, setQ] = useState(filters.query);
  const [loc, setLoc] = useState(filters.location);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (q !== filters.query) patchFilters({ query: q });
      if (loc !== filters.location) patchFilters({ location: loc });
    }, 280);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, loc]);

  /* "/" focuses search from anywhere on the board */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const t = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      e.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const featured = useMemo(
    () => jobs.filter((j) => j.featured).slice(0, 3),
    [jobs],
  );
  const locations = useMemo(() => Array.from(new Set(jobs.map((j) => j.location))).sort(), [jobs]);
  const newThisWeek = jobs.filter((j) => Date.now() - j.postedAt < 7 * 86_400_000).length;

  return (
    <section className="relative overflow-hidden border-b border-line bg-surface/60">
      <div className="grid w-full gap-10 px-4 pb-12 pt-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:gap-14 lg:px-10 lg:pt-16 xl:px-14">
        <div>
          <Reveal>
            <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-pine-600">
              <span className="live-dot h-2 w-2 rounded-full bg-pine-500" />
              Live board · updated {timeAgo(jobs[0]?.postedAt ?? Date.now())}
            </p>
            <h1 className="mt-4 font-display text-[clamp(36px,6vw,62px)] font-bold leading-[0.98] tracking-tight text-ink-900">
              Find work worth
              <br />
              <span className="relative inline-block text-pine-600">
                waking up for.
                <svg viewBox="0 0 300 12" className="absolute -bottom-1.5 left-0 w-full" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 9c60-6 180-6 296-3" fill="none" stroke="var(--color-honey-500)" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-5 max-w-[480px] text-[15px] leading-relaxed text-ink-500">
              Every role on CareerHub lists its real salary range and a real team behind it.
              Search, shortlist, apply — then watch your application move in real time.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-8 flex max-w-[640px] flex-col gap-2 rounded-xl border-2 border-line bg-surface p-2.5 shadow-card transition-all duration-200 focus-within:border-pine-500 focus-within:shadow-lift sm:flex-row sm:items-center">
              <div className="relative flex flex-[1.25] items-center gap-3 px-3">
                <Icon name="search" className="h-5 w-5 flex-none text-pine-600" />
                <input
                  ref={searchRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Role, skill or company…"
                  className="w-full bg-transparent py-3.5 pr-8 text-[15px] font-medium text-ink-900 placeholder:font-normal placeholder:text-ink-300 focus:outline-none"
                  aria-label="Search roles"
                />
                {q ? (
                  <button
                    onClick={() => setQ("")}
                    aria-label="Clear search"
                    className="absolute right-2 rounded-md p-1 text-ink-400 transition-all hover:rotate-90 hover:bg-mist hover:text-ink-900"
                  >
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                ) : (
                  <kbd className="absolute right-2 hidden h-6 w-6 place-items-center rounded border border-linedark bg-mist font-mono text-[11px] font-semibold text-ink-400 sm:grid" title="Press / to search">
                    /
                  </kbd>
                )}
              </div>
              <div className="flex flex-1 items-center gap-3 border-line px-3 sm:border-l">
                <Icon name="pin" className="h-5 w-5 flex-none text-ink-400" />
                <input
                  value={loc}
                  onChange={(e) => setLoc(e.target.value)}
                  placeholder="City or “Remote”"
                  list="hub-locations"
                  className="w-full bg-transparent py-3.5 text-[15px] font-medium text-ink-900 placeholder:font-normal placeholder:text-ink-300 focus:outline-none"
                  aria-label="Location"
                />
                <datalist id="hub-locations">
                  {locations.map((l) => <option key={l} value={l} />)}
                </datalist>
              </div>
              <button
                onClick={() => patchFilters({ query: q, location: loc })}
                className="group flex flex-none items-center justify-center gap-2 rounded-lg bg-pine-600 px-7 py-3.5 font-display text-[15px] font-bold text-paper transition-all hover:bg-pine-700 hover:shadow-lift active:scale-[0.97]"
              >
                Search
                <Icon name="arrow-right" className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </Reveal>

          <Reveal delay={220}>
            <div className="mt-7 grid max-w-[700px] grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat value={jobs.length} label="Live roles" icon="briefcase" />
              <Stat value={companies.length} label="Companies" icon="building" />
              <Stat value={newThisWeek} label="New this week" icon="zap" />
              <Stat value={36} suffix="h" label="Avg. response" icon="clock" />
            </div>
          </Reveal>
        </div>

        {/* featured rail */}
        <Reveal delay={200} className="hidden h-full lg:block">
          <div className="flex h-full flex-col rounded-xl border border-line bg-surface/90 p-5 shadow-card">
            <p className="flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
              <span className="flex items-center gap-1.5"><Icon name="spark" filled className="h-4 w-4 text-honey-500" />Featured today</span>
              <span>{featured.length} picks</span>
            </p>
            <div className="mt-4 flex flex-1 flex-col justify-between gap-3">
              {featured.map((j) => (
                <button
                  key={j.id}
                  onClick={() => openJob(j.id)}
                  className="group flex w-full items-center gap-3.5 rounded-lg border border-line bg-paper p-4 text-left transition-all hover:-translate-y-1 hover:border-honey-300 hover:shadow-lift"
                >
                  <CompanyLogo company={companyById.get(j.companyId)} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold leading-snug text-ink-900 group-hover:text-pine-700">{j.title}</span>
                    <span className="mt-0.5 block text-[12px] text-ink-400">{companyById.get(j.companyId)?.name} · {j.remote} · {j.location}</span>
                  </span>
                  <span className="flex-none text-right">
                    <span className="block whitespace-nowrap font-mono text-[13px] font-semibold text-ink-900">{fmtSalary(j.salaryMin, j.salaryMax)}</span>
                    <span className="mt-0.5 flex items-center justify-end gap-1 font-mono text-[10px] uppercase tracking-wide text-honey-600">
                      <Icon name="zap" className="h-3 w-3" />Hiring fast
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-ink-950 px-4 py-3.5">
              <p className="text-[12.5px] leading-snug text-ink-300">
                Hiring? Listings go live in <span className="font-bold text-honey-400">under a minute</span>.
              </p>
              <Icon name="arrow-up-right" className="h-4 w-4 flex-none text-honey-400" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ active chips ----------------------------- */

function ActiveChips() {
  const { filters, patchFilters, toggleFilterValue, resetFilters, activeFilterCount } = useApp();
  if (activeFilterCount === 0) return null;

  const chips: { label: string; clear: () => void }[] = [];
  filters.categories.forEach((c) => chips.push({ label: c, clear: () => toggleFilterValue("categories", c) }));
  filters.types.forEach((t) => chips.push({ label: t, clear: () => toggleFilterValue("types", t) }));
  filters.levels.forEach((l) => chips.push({ label: l, clear: () => toggleFilterValue("levels", l) }));
  if (filters.remoteOnly) chips.push({ label: "Remote only", clear: () => patchFilters({ remoteOnly: false }) });
  if (filters.minSalary > 0) chips.push({ label: `₹${filters.minSalary / 100000}L+ salary`, clear: () => patchFilters({ minSalary: 0 }) });
  if (filters.location) chips.push({ label: `Loc: ${filters.location}`, clear: () => patchFilters({ location: "" }) });

  return (
    <div className="anim-fade-up flex flex-wrap items-center gap-1.5">
      {chips.map((c) => (
        <button
          key={c.label}
          onClick={c.clear}
          className="group flex items-center gap-1.5 rounded-full border border-pine-200 bg-pine-50 px-3 py-1 text-[12px] font-semibold text-pine-700 transition-all hover:border-coral-500 hover:bg-coral-100 hover:text-coral-500"
        >
          {c.label}
          <Icon name="x" className="h-3 w-3 opacity-60 group-hover:opacity-100" />
        </button>
      ))}
      <button onClick={resetFilters} className="ml-1 font-mono text-[11px] font-semibold text-ink-400 underline-offset-2 hover:text-coral-500 hover:underline">
        clear all
      </button>
    </div>
  );
}

/* ------------------------------ results list ----------------------------- */

function EmptyDatabase() {
  const { pushToast } = useApp();
  const [copied, setCopied] = useState(false);
  const command =
    "SUPABASE_URL=https://your-project.supabase.co \\\nSUPABASE_SERVICE_ROLE_KEY=your-service-role-key \\\nnpm run seed";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command.replace(/\\\n/g, " "));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      pushToast("success", "Seed command copied to clipboard");
    } catch {
      pushToast("info", "Copy blocked by the browser — select the text manually");
    }
  };

  return (
    <div className="anim-fade-up rounded-xl border-2 border-dashed border-pine-200 bg-pine-50/60 px-6 py-12 text-center xl:col-span-2">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-pine-600 text-paper shadow-card">
        <Icon name="layers" className="h-6 w-6" />
      </div>
      <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-pine-200 bg-surface px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-pine-700">
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-pine-500" />
        Connected · 0 rows in “jobs”
      </p>
      <h3 className="mt-3 font-display text-[22px] font-bold text-ink-900">Database is live — it just needs data</h3>
      <p className="mx-auto mt-1.5 max-w-[440px] text-[13.5px] leading-relaxed text-ink-500">
        Your tables exist but they're empty. Run the one-time seeder from the repo root
        to load the 10 companies and 30 roles (uses the <span className="font-semibold text-ink-800">service_role</span> key
        from Supabase → Settings → API).
      </p>
      <div className="mx-auto mt-5 max-w-[560px] overflow-hidden rounded-lg border border-line bg-ink-950 text-left shadow-lift">
        <div className="flex items-center justify-between border-b border-ink-800 px-4 py-2">
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400">terminal</span>
          <button
            onClick={copy}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] font-bold transition-all ${
              copied ? "bg-pine-600 text-paper" : "bg-ink-800 text-honey-400 hover:bg-ink-700"
            }`}
          >
            <Icon name={copied ? "check" : "doc"} className="h-3.5 w-3.5" />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[12.5px] leading-relaxed text-pine-200">
{command}
        </pre>
      </div>
      <p className="mt-4 font-mono text-[11px] text-ink-400">
        Re-runnable and safe — rows upsert on their primary keys. Refresh this page once it finishes.
      </p>
    </div>
  );
}

function ResultsList() {
  const { results, searching, initialLoading, filters, patchFilters, recentIds, jobs, companyById, openJob } = useApp();
  const [visible, setVisible] = useState(8);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => setVisible(8), [filters]);

  const recent = useMemo(() => recentIds.map((id) => jobs.find((j) => j.id === id)).filter(Boolean).slice(0, 4), [recentIds, jobs]);
  const shown = results.slice(0, visible);

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: "newest", label: "Newest first" },
    { value: "salary-high", label: "Salary · high to low" },
    { value: "salary-low", label: "Salary · low to high" },
  ];

  return (
    <div className="min-w-0 flex-1">
      {/* toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <p className="font-display text-[17px] font-bold text-ink-900">
          {initialLoading ? "Scanning the board…" : `${results.length} ${results.length === 1 ? "role" : "roles"}`}
          {!initialLoading && filters.query && (
            <span className="font-sans text-[13px] font-medium text-ink-400"> for “{filters.query}”</span>
          )}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowMobileFilters((s) => !s)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[12.5px] font-bold transition-all lg:hidden ${
              showMobileFilters ? "border-pine-600 bg-pine-600 text-paper" : "border-linedark bg-surface text-ink-700"
            }`}
          >
            <Icon name="filter" className="h-3.5 w-3.5" />Filters
          </button>
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => patchFilters({ sort: e.target.value as SortKey })}
              className="cursor-pointer appearance-none rounded-lg border border-linedark bg-surface py-2 pl-3 pr-8 text-[12.5px] font-semibold text-ink-700 transition-colors focus:border-pine-500 focus:outline-none"
              aria-label="Sort results"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <Icon name="chevron-down" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
          </div>
        </div>
      </div>

      <ActiveChips />

      {/* mobile filters */}
      {showMobileFilters && (
        <div className="anim-fade-up mt-3 rounded-xl border border-line bg-surface p-4 lg:hidden">
          <FilterRailContent />
        </div>
      )}

      {/* recently viewed */}
      {recent.length > 0 && !initialLoading && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
            <Icon name="clock" className="h-3.5 w-3.5" />Recently viewed
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {recent.map((j) => j && (
              <button
                key={j.id}
                onClick={() => openJob(j.id)}
                title={`${j.title} · ${companyById.get(j.companyId)?.name ?? ""}`}
                className="flex max-w-[240px] flex-none items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-3.5 text-[12px] font-semibold text-ink-700 transition-all hover:border-pine-200 hover:text-pine-700 hover:shadow-card"
              >
                <CompanyLogo company={companyById.get(j.companyId)} size="sm" />
                <span className="min-w-0 max-w-[160px] truncate">{j.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* list */}
      <div className={`mt-4 grid gap-3 transition-opacity duration-200 xl:grid-cols-2 ${searching ? "opacity-50" : "opacity-100"}`}>
        {initialLoading ? (
          Array.from({ length: 5 }).map((_, i) => <JobCardSkeleton key={i} />)
        ) : jobs.length === 0 ? (
          <EmptyDatabase />
        ) : shown.length === 0 ? (
          <EmptyResults />
        ) : (
          shown.map((j, i) => <JobCard key={j.id} job={j} index={i} />)
        )}
      </div>

      {!initialLoading && results.length > visible && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setVisible((v) => v + 8)}
            className="group inline-flex items-center gap-2 rounded-lg border border-linedark bg-surface px-6 py-3 font-display text-[13.5px] font-bold text-ink-700 transition-all hover:border-pine-500 hover:text-pine-700 hover:shadow-card"
          >
            Load {Math.min(8, results.length - visible)} more
            <Icon name="chevron-down" className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </button>
          <p className="mt-2 font-mono text-[11px] text-ink-400">{visible} of {results.length} shown</p>
        </div>
      )}
    </div>
  );
}

function EmptyResults() {
  const { resetFilters } = useApp();
  return (
    <div className="anim-fade-up rounded-xl border border-dashed border-linedark bg-surface/60 px-6 py-14 text-center xl:col-span-2">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-mist text-ink-400">
        <Icon name="search" className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-[19px] font-bold text-ink-900">No matches on the board</h3>
      <p className="mx-auto mt-1.5 max-w-[360px] text-[13px] leading-relaxed text-ink-500">
        Try widening the salary floor or clearing a category — new roles land every day.
      </p>
      <button
        onClick={resetFilters}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-pine-600 px-5 py-2.5 font-display text-[13.5px] font-bold text-paper transition-all hover:bg-pine-700 hover:shadow-lift"
      >
        Reset all filters
        <Icon name="arrow-right" className="h-4 w-4" />
      </button>
    </div>
  );
}

/* --------------------------------- footer -------------------------------- */

function Footer() {
  const { setView, patchFilters, toggleFilterValue } = useApp();
  const seekerLinks: { label: string; action: () => void }[] = [
    { label: "Browse remote roles", action: () => { setView("board"); patchFilters({ remoteOnly: true }); } },
    { label: "Engineering", action: () => { setView("board"); toggleFilterValue("categories", "Engineering"); } },
    { label: "Design", action: () => { setView("board"); toggleFilterValue("categories", "Design"); } },
    { label: "Data", action: () => { setView("board"); toggleFilterValue("categories", "Data"); } },
  ];
  const employerLinks: { label: string; action: () => void }[] = [
    { label: "Post a job", action: () => setView("post") },
    { label: "Candidate dashboard", action: () => setView("dashboard") },
    { label: "Salary transparency", action: () => setView("board") },
  ];

  return (
    <footer className="mt-16 border-t border-ink-800 bg-ink-950 text-paper">
      <div className="grid w-full gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10 xl:px-14">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <span className="font-display text-[21px] font-bold tracking-tight">Career<span className="text-honey-400">Hub</span></span>
          </div>
          <p className="mt-4 max-w-[360px] text-[13.5px] leading-relaxed text-ink-300">
            The job board for people who ship. Real salary ranges, real teams,
            and application timelines that actually move.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink-800 bg-ink-900 px-3.5 py-1.5 font-mono text-[11px] text-pine-200">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-pine-400" />
            All systems live · {new Date().getFullYear()}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-ink-400">For job seekers</p>
          <ul className="mt-4 space-y-2.5">
            {seekerLinks.map((l) => (
              <li key={l.label}>
                <button onClick={l.action} className="group flex items-center gap-2 text-[13.5px] text-ink-300 transition-colors hover:text-honey-400">
                  <Icon name="arrow-right" className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  <span className="-ml-5 transition-all group-hover:ml-0">{l.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-ink-400">For employers</p>
          <ul className="mt-4 space-y-2.5">
            {employerLinks.map((l) => (
              <li key={l.label}>
                <button onClick={l.action} className="group flex items-center gap-2 text-[13.5px] text-ink-300 transition-colors hover:text-honey-400">
                  <Icon name="arrow-right" className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  <span className="-ml-5 transition-all group-hover:ml-0">{l.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-800">
        <div className="flex w-full flex-col items-start justify-between gap-2 px-4 py-5 font-mono text-[11px] text-ink-400 sm:flex-row sm:items-center sm:px-6 lg:px-10 xl:px-14">
          <span>© {new Date().getFullYear()} CareerHub Inc. — Built for people who ship.</span>
          <span className="flex items-center gap-4">
            <span
              className="flex items-center gap-1.5 rounded-full border border-honey-500/40 px-2.5 py-1 text-honey-400"
              title="Connected to the Supabase API"
            >
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-honey-400" />
              Live API · Supabase
            </span>
            <span>v2.4.1</span>
            <span className="flex items-center gap-1.5"><Icon name="shield" className="h-3.5 w-3.5 text-pine-400" />SOC 2 Type II</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------- app ---------------------------------- */

function Board() {
  return (
    <>
      <ResumeMatch />
      <BoardHero />
      <div className="flex w-full items-start gap-6 px-4 py-8 sm:px-6 lg:gap-7 lg:px-10 xl:px-14">
        <FilterRail />
        <ResultsList />
      </div>
    </>
  );
}

function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div
      className="fixed left-0 top-0 z-50 h-[3px] bg-honey-500 shadow-[0_0_12px_rgba(239,162,47,0.7)]"
      style={{ width: `${p}%` }}
      aria-hidden="true"
    />
  );
}

function Shell() {
  const { view } = useApp();
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgress />
      <Header />
      <main className="flex-1">
        {view === "board" && <Board />}
        {view === "dashboard" && <Dashboard />}
        {view === "post" && <PostJobForm />}
      </main>
      <OfferShowcase />
      <Footer />
      <JobDetail />
      <ApplyModal />
      <Toasts />
    </div>
  );
}

export default function App() {
  // CareerHub has a single backend (Supabase). Without keys, show setup —
  // never fall back to bundled/local data.
  if (!isSupabaseConfigured) return <BackendSetup />;
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
