import { useState } from "react";
import { STATUS_META, useApp } from "../context/AppContext";
import { Icon } from "./icons";
import { JobCard } from "./JobCard";
import { Reveal } from "../hooks";
import { fmtDate, fmtSalary, timeAgo } from "../services/api";
import type { Application, AppStatus } from "../types";

const FLOW: AppStatus[] = ["submitted", "reviewing", "shortlisted", "interview", "offered"];

function Timeline({ app }: { app: Application }) {
  const { companyById, jobs } = useApp();
  const job = jobs.find((j) => j.id === app.jobId);
  const isTerminal = app.status === "rejected" || app.status === "withdrawn";
  const reachedIdx = FLOW.indexOf(app.status);

  return (
    <div className="mt-4 rounded-lg border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">Progress</p>
        <p className="font-mono text-[11px] text-ink-400">
          {job?.title} · {companyById.get(job?.companyId ?? "")?.name}
        </p>
      </div>
      {!isTerminal ? (
        <div className="flex items-center">
          {FLOW.map((s, i) => {
            const reached = i <= reachedIdx;
            const current = i === reachedIdx;
            const meta = STATUS_META[s];
            return (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full border-2 transition-all ${
                      reached ? "border-pine-600 bg-pine-600 text-paper" : "border-linedark bg-surface text-ink-300"
                    } ${current ? "ring-4 ring-pine-100" : ""}`}
                  >
                    {reached ? <Icon name="check" className="h-3 w-3" strokeWidth={2.6} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                  </span>
                  <span className={`mt-1.5 whitespace-nowrap font-mono text-[9.5px] font-bold uppercase tracking-wide ${reached ? "text-pine-700" : "text-ink-300"}`}>
                    {meta.label === "Under review" ? "Review" : meta.label}
                  </span>
                </div>
                {i < FLOW.length - 1 && (
                  <div className={`mx-1 mb-4 h-[2px] flex-1 rounded ${i < reachedIdx ? "bg-pine-600" : "bg-linedark"}`} />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[12.5px] text-ink-500">
          {app.status === "rejected" ? "This one didn't go through — the timeline below has the team's note." : "You withdrew this application."}
        </p>
      )}
      <div className="mt-3 space-y-1.5 border-t border-line/70 pt-3">
        {[...app.timeline].reverse().map((t, i) => (
          <p key={i} className="flex gap-2 text-[12px] leading-snug text-ink-500">
            <span className={`mt-[5px] h-1.5 w-1.5 flex-none rounded-full ${STATUS_META[t.status].dot}`} />
            <span>
              <span className="font-semibold text-ink-700">{STATUS_META[t.status].label}</span>
              <span className="mx-1 font-mono text-[10.5px] text-ink-400">{fmtDate(t.at)}</span>
              {t.note && <span className="text-ink-500">— {t.note}</span>}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}

function ApplicationRow({ app, index }: { app: Application; index: number }) {
  const { jobs, companyById, withdrawApplication, openJob } = useApp();
  const [confirming, setConfirming] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const job = jobs.find((j) => j.id === app.jobId);
  const company = job ? companyById.get(job.companyId) : undefined;
  const meta = STATUS_META[app.status];
  const canWithdraw = !["rejected", "withdrawn", "offered"].includes(app.status);

  return (
    <Reveal delay={Math.min(index, 3) * 70}>
      <div className={`row-flash rounded-xl border bg-surface/80 p-4 transition-all hover:shadow-card sm:p-5 ${app.status === "withdrawn" ? "border-line opacity-70" : "border-line hover:border-pine-200"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <button onClick={() => job && openJob(job.id)} className="min-w-0 text-left">
            <h3 className="font-display text-[16.5px] font-bold leading-tight text-ink-900 transition-colors hover:text-pine-700">
              {job?.title ?? "Role no longer listed"}
            </h3>
            <p className="mt-0.5 text-[12.5px] text-ink-500">
              {company?.name} · {job ? fmtSalary(job.salaryMin, job.salaryMax) : "—"} · applied {timeAgo(app.appliedAt)}
            </p>
          </button>
          <div className="flex items-center gap-2.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wider ${meta.chip}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
            {canWithdraw && !confirming && (
              <button
                onClick={() => setConfirming(true)}
                className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-500 transition-all hover:border-coral-500 hover:text-coral-500"
              >
                <Icon name="trash" className="h-3.5 w-3.5" />Withdraw
              </button>
            )}
            {confirming && (
              <span className="flex items-center gap-1.5">
                <button
                  onClick={async () => {
                    setWithdrawing(true);
                    await withdrawApplication(app.id);
                    setWithdrawing(false);
                    setConfirming(false);
                  }}
                  disabled={withdrawing}
                  className="rounded-md bg-coral-500 px-2.5 py-1.5 text-[11.5px] font-bold text-paper transition-all hover:opacity-90 disabled:opacity-60"
                >
                  {withdrawing ? "…" : "Confirm"}
                </button>
                <button onClick={() => setConfirming(false)} className="rounded-md border border-line px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-500 hover:bg-mist">
                  Keep
                </button>
              </span>
            )}
          </div>
        </div>
        <Timeline app={app} />
      </div>
    </Reveal>
  );
}

function EmptyState({ kind }: { kind: "applications" | "saved" }) {
  const { setView, dashboardTab, setDashboardTab } = useApp();
  return (
    <div className="anim-fade-up rounded-xl border border-dashed border-linedark bg-surface/60 px-6 py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-pine-100 text-pine-600">
        <Icon name={kind === "applications" ? "send" : "bookmark"} className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-[20px] font-bold text-ink-900">
        {kind === "applications" ? "No applications yet" : "Nothing saved yet"}
      </h3>
      <p className="mx-auto mt-1.5 max-w-[340px] text-[13px] leading-relaxed text-ink-500">
        {kind === "applications"
          ? "When you apply to a role, its live status timeline shows up here — review, shortlist, interview and beyond."
          : "Tap the bookmark on any role to build your shortlist. It lives here, ready for decision day."}
      </p>
      <button
        onClick={() => {
          if (kind === "saved" && dashboardTab === "saved") {
            setDashboardTab("applications");
            return;
          }
          setView("board");
        }}
        className="group mt-5 inline-flex items-center gap-2 rounded-lg bg-pine-600 px-5 py-2.5 font-display text-[13.5px] font-bold text-paper transition-all hover:bg-pine-700 hover:shadow-lift"
      >
        Browse the board
        <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

export function Dashboard() {
  const { applications, savedIds, jobs, dashboardTab, setDashboardTab } = useApp();

  const active = applications.filter((a) => !["rejected", "withdrawn"].includes(a.status)).length;
  const interviews = applications.filter((a) => a.status === "interview").length;
  const savedJobs = jobs.filter((j) => savedIds.includes(j.id));

  const stats = [
    { label: "Active applications", value: active, icon: "send" as const },
    { label: "In interview stage", value: interviews, icon: "user" as const },
    { label: "Shortlisted roles", value: savedIds.length, icon: "bookmark" as const },
  ];

  return (
    <div className="w-full px-4 pb-20 pt-10 sm:px-6 lg:px-10 xl:px-14">
      <Reveal>
        <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-600">
          <Icon name="grid" className="h-4 w-4" />Candidate dashboard
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(30px,5vw,44px)] font-bold leading-[1.02] tracking-tight text-ink-900">
            Your search,<br className="sm:hidden" /> <span className="text-pine-600">tracked live.</span>
          </h1>
          <div className="flex gap-2.5">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-line bg-surface px-4 py-2.5">
                <p className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-wider text-ink-400">
                  <Icon name={s.icon} className="h-3 w-3" />{s.label}
                </p>
                <p className="mt-0.5 font-display text-[22px] font-bold text-ink-900">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* tabs */}
      <Reveal delay={100}>
        <div className="mt-8 flex gap-1 rounded-lg border border-line bg-surface p-1 sm:w-fit">
          {(["applications", "saved"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDashboardTab(tab)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-5 py-2.5 font-display text-[13.5px] font-bold transition-all sm:flex-none ${
                dashboardTab === tab ? "bg-ink-950 text-paper shadow-sm" : "text-ink-500 hover:text-ink-900"
              }`}
            >
              {tab === "applications" ? "Applications" : "Saved roles"}
              <span className={`rounded-full px-2 py-0.5 font-mono text-[10.5px] ${dashboardTab === tab ? "bg-honey-500 text-ink-950" : "bg-mist text-ink-500"}`}>
                {tab === "applications" ? applications.length : savedIds.length}
              </span>
            </button>
          ))}
        </div>
      </Reveal>

      <div className="mt-5 space-y-4">
        {dashboardTab === "applications" ? (
          applications.length === 0 ? (
            <EmptyState kind="applications" />
          ) : (
            applications.map((a, i) => <ApplicationRow key={a.id} app={a} index={i} />)
          )
        ) : savedJobs.length === 0 ? (
          <EmptyState kind="saved" />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {savedJobs.map((j, i) => <JobCard key={j.id} job={j} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
