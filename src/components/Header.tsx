import type { ReactNode } from "react";
import { useApp } from "../context/AppContext";
import { Icon, LogoMark } from "./icons";
import { fmtSalary } from "../services/api";
import type { View } from "../types";

function NavButton({
  active, onClick, children, badge,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-semibold tracking-wide transition-all duration-200 ${
        active ? "bg-ink-800 text-paper" : "text-ink-300 hover:bg-ink-800/60 hover:text-paper"
      }`}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className={`grid h-[17px] min-w-[17px] place-items-center rounded-full px-1 font-mono text-[10px] font-bold ${active ? "bg-honey-500 text-ink-950" : "bg-honey-500/90 text-ink-950"}`}>
          {badge}
        </span>
      )}
      {active && <span className="absolute -bottom-[13px] left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-t-full bg-honey-500" />}
    </button>
  );
}

export function Header() {
  const { view, setView, applications, savedIds, jobs, companyById } = useApp();

  const tickerJobs = [...jobs].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false)).slice(0, 12);
  const tickerItems = tickerJobs.map((j) => ({
    id: j.id,
    text: `${j.title} · ${companyById.get(j.companyId)?.name ?? ""} · ${fmtSalary(j.salaryMin, j.salaryMax)}`,
    featured: j.featured,
  }));

  const navFor = (v: View) => () => setView(v);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/95 text-paper backdrop-blur-sm">
      <div className="flex h-[60px] w-full items-center gap-2 px-4 sm:px-6 lg:px-10 xl:px-14">
        <button onClick={navFor("board")} className="group mr-2 flex items-center gap-2.5" aria-label="CareerHub home">
          <LogoMark className="h-8 w-8 transition-transform duration-300 group-hover:rotate-[-6deg]" />
          <span className="font-display text-[19px] font-bold tracking-tight">
            Career<span className="text-honey-400">Hub</span>
          </span>
        </button>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2" aria-label="Primary">
          <NavButton active={view === "board"} onClick={navFor("board")}>
            <Icon name="compass" className="h-4 w-4" />
            <span className="hidden sm:inline">Job board</span>
          </NavButton>
          <NavButton active={view === "dashboard"} onClick={navFor("dashboard")} badge={applications.filter((a) => !["rejected", "withdrawn"].includes(a.status)).length}>
            <Icon name="grid" className="h-4 w-4" />
            <span className="hidden sm:inline">My dashboard</span>
          </NavButton>
          <button
            onClick={navFor("post")}
            className={`ml-1 flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-bold tracking-wide transition-all duration-200 ${
              view === "post"
                ? "bg-honey-400 text-ink-950"
                : "bg-honey-500 text-ink-950 shadow-[0_0_0_0_rgba(239,162,47,0.5)] hover:bg-honey-400 hover:shadow-[0_0_24px_-4px_rgba(239,162,47,0.7)]"
            }`}
          >
            <Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />
            <span className="hidden sm:inline">Post a job</span>
            <span className="sm:hidden">Post</span>
          </button>
        </nav>
      </div>

      {/* live ticker */}
      <div className="relative overflow-hidden border-t border-ink-800 bg-ink-900 py-[7px]" aria-hidden="true">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center gap-1.5 bg-ink-900 pl-4 pr-3 sm:pl-6">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-pine-400" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-pine-200">Live</span>
        </div>
        <div className="anim-marquee flex w-max items-center">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
              {tickerItems.map((item, i) => (
                <span key={`${copy}-${item.id}-${i}`} className="flex items-center whitespace-nowrap font-mono text-[11px] tracking-wide text-ink-300">
                  <span className="mx-5 h-1 w-1 rotate-45 bg-honey-500/70" />
                  {item.featured && <Icon name="spark" filled className="mr-1.5 h-3 w-3 text-honey-400" />}
                  {item.text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">{savedIds.length} saved roles</span>
    </header>
  );
}
