import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "./icons";
import type { Category, JobLevel, JobType } from "../types";

const CATEGORIES: Category[] = ["Engineering", "Design", "Product", "Data", "Marketing", "Sales", "Operations", "Finance"];
const TYPES: JobType[] = ["Full-time", "Contract", "Part-time", "Internship"];
const LEVELS: JobLevel[] = ["Junior", "Mid-level", "Senior", "Lead"];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-4">
      <legend className="mb-2.5 pr-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400">{title}</legend>
      <div className="space-y-1.5">{children}</div>
    </fieldset>
  );
}

function CheckRow({
  label, count, checked, onChange,
}: {
  label: string; count: number; checked: boolean; onChange: () => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-[5px] transition-colors hover:bg-mist/70">
      <input type="checkbox" className="hub-check" checked={checked} onChange={onChange} />
      <span className={`flex-1 text-[13px] transition-colors ${checked ? "font-semibold text-ink-900" : "text-ink-700 group-hover:text-ink-900"}`}>{label}</span>
      <span className="font-mono text-[11px] text-ink-400">{count}</span>
    </label>
  );
}

export function FilterRailContent() {
  const { filters, toggleFilterValue, patchFilters, resetFilters, activeFilterCount, jobs, subscribeAlert } = useApp();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const counts = useMemo(() => {
    const c = new Map<string, number>();
    jobs.forEach((j) => c.set(j.category, (c.get(j.category) ?? 0) + 1));
    return c;
  }, [jobs]);

  const salaryPct = (filters.minSalary / 6_000_000) * 100;

  const handleSubscribe = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address");
      return;
    }
    setEmailError("");
    setSubscribing(true);
    await subscribeAlert(email);
    setSubscribing(false);
    setEmail("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400">
          <Icon name="filter" className="h-3.5 w-3.5" />Refine
        </p>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold text-coral-500 transition-colors hover:bg-coral-100"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* remote toggle */}
      <button
        onClick={() => patchFilters({ remoteOnly: !filters.remoteOnly })}
        role="switch"
        aria-checked={filters.remoteOnly}
        className="flex w-full items-center justify-between rounded-lg border border-line bg-surface px-3.5 py-2.5 transition-all hover:border-pine-200"
      >
        <span className="flex items-center gap-2 text-[13px] font-semibold text-ink-800">
          <Icon name="globe" className={`h-4 w-4 ${filters.remoteOnly ? "text-pine-600" : "text-ink-400"}`} />
          Remote only
        </span>
        <span className={`relative h-[20px] w-9 rounded-full transition-colors duration-200 ${filters.remoteOnly ? "bg-pine-600" : "bg-linedark"}`}>
          <span className={`absolute top-[2.5px] h-[15px] w-[15px] rounded-full bg-surface shadow transition-all duration-200 ${filters.remoteOnly ? "left-[20px]" : "left-[3px]"}`} />
        </span>
      </button>

      <Section title="Category">
        {CATEGORIES.map((c) => (
          <CheckRow
            key={c}
            label={c}
            count={counts.get(c) ?? 0}
            checked={filters.categories.includes(c)}
            onChange={() => toggleFilterValue("categories", c)}
          />
        ))}
      </Section>

      <Section title="Contract type">
        {TYPES.map((t) => (
          <CheckRow
            key={t}
            label={t}
            count={jobs.filter((j) => j.type === t).length}
            checked={filters.types.includes(t)}
            onChange={() => toggleFilterValue("types", t)}
          />
        ))}
      </Section>

      <Section title="Experience level">
        {LEVELS.map((l) => (
          <CheckRow
            key={l}
            label={l}
            count={jobs.filter((j) => j.level === l).length}
            checked={filters.levels.includes(l)}
            onChange={() => toggleFilterValue("levels", l)}
          />
        ))}
      </Section>

      <div className="border-t border-line pt-4">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400">Min. salary (LPA)</span>
          <span className="font-mono text-[12.5px] font-bold text-pine-700">
            {filters.minSalary === 0 ? "Any" : `₹${filters.minSalary / 100000}L+`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={6000000}
          step={200000}
          value={filters.minSalary}
          onChange={(e) => patchFilters({ minSalary: Number(e.target.value) })}
          className="hub-range"
          style={{ "--fill": `${salaryPct}%` } as CSSProperties}
          aria-label="Minimum annual salary in rupees"
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] text-ink-400">
          <span>₹0</span><span>₹30L</span><span>₹60L</span>
        </div>
      </div>

      {/* job alert */}
      <div className="rounded-lg border border-pine-200 bg-pine-50 p-3.5">
        <p className="flex items-center gap-1.5 font-display text-[13.5px] font-bold text-pine-800">
          <Icon name="bell" className="h-4 w-4" />Get new matches first
        </p>
        <p className="mt-1 text-[12px] leading-snug text-pine-700/90">
          One email when a role matches your current filters. No spam, ever.
        </p>
        <div className="mt-2.5 flex gap-1.5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
            placeholder="you@email.com"
            className="min-w-0 flex-1 rounded-md border border-pine-200 bg-surface px-2.5 py-1.5 text-[12.5px] text-ink-900 placeholder:text-ink-300 focus:border-pine-500 focus:outline-none"
          />
          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="flex-none rounded-md bg-pine-600 px-3 py-1.5 text-[12px] font-bold text-paper transition-all hover:bg-pine-700 disabled:opacity-60"
          >
            {subscribing ? "…" : "Alert me"}
          </button>
        </div>
        {emailError && <p className="mt-1.5 text-[11px] font-semibold text-coral-500">{emailError}</p>}
      </div>
    </div>
  );
}

export function FilterRail() {
  return (
    <aside className="sticky top-[120px] hidden max-h-[calc(100vh-140px)] w-[264px] flex-none overflow-y-auto rounded-xl border border-line bg-surface/80 p-4 backdrop-blur-sm lg:block no-scrollbar">
      <FilterRailContent />
    </aside>
  );
}
