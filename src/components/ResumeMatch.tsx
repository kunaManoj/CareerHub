import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "./icons";
import { CompanyLogo } from "./JobCard";
import { analyzeResume, fmtSalary, type ResumeMatchResult } from "../services/api";
import { usePrefersReducedMotion } from "../hooks";

type Phase = "idle" | "reading" | "analyzing" | "done";

const STAGES = ["Parsing resume", "Extracting skills", "Scoring live roles"];

const SAMPLES: { label: string; text: string }[] = [
  {
    label: "Frontend",
    text: "Priya Sharma — Frontend Engineer, 5 years in Bengaluru. Built design systems and accessible React + TypeScript apps for a fintech. Tailwind, D3 dashboards, WebGL experiments. Led the move to modern React, mentored juniors, obsessed with performance budgets and accessibility (WCAG 2.2). Figma-fluent, prototypes in code.",
  },
  {
    label: "Data & ML",
    text: "Rohan Kulkarni — Data and ML engineer. Python, PyTorch; fine-tuned LLMs for NLP on Indic documents. Production pipelines with Airflow, dbt and Snowflake; MLOps on Kubernetes with Ray serving and MLflow tracking. Heavy SQL, causal inference experiments, pandas wrangling, Looker dashboards.",
  },
  {
    label: "Platform / SRE",
    text: "Ananya Iyer — Platform engineer and SRE. Ran Kubernetes + Terraform on AWS at scale; Go services, gRPC, Kafka. Owned SLOs, incident response and GitOps rollouts. CI/CD pipelines, Docker everywhere, Postgres tuning, capacity planning and on-call leadership.",
  },
];

function ScoreRing({ score }: { score: number }) {
  const r = 19;
  const c = 2 * Math.PI * r;
  const hot = score >= 80;
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 flex-none -rotate-90">
      <circle cx="24" cy="24" r={r} fill="none" stroke="var(--color-ink-700)" strokeWidth="3.5" />
      <circle
        cx="24" cy="24" r={r} fill="none"
        stroke={hot ? "var(--color-honey-500)" : "var(--color-pine-400)"}
        strokeWidth="3.5" strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (score / 100) * c}
        style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.2, 0.7, 0.3, 1)" }}
      />
      <text
        x="24" y="24" transform="rotate(90 24 24)" textAnchor="middle" dominantBaseline="central"
        fill="var(--color-paper)" fontSize="12.5" fontWeight="700" fontFamily="JetBrains Mono, monospace"
      >
        {score}
      </text>
    </svg>
  );
}

export function ResumeMatch() {
  const { jobs, companyById, openJob, openApply, pushToast } = useApp();
  const reduced = usePrefersReducedMotion();

  const [phase, setPhase] = useState<Phase>("idle");
  const [stage, setStage] = useState(0);
  const [fileName, setFileName] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<{ matches: ResumeMatchResult[]; skills: string[] } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const cancelled = useRef(false);
  useEffect(() => () => {
    cancelled.current = true;
  }, []);

  const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, reduced ? 0 : ms));

  const run = async (text: string, name: string) => {
    if (text.trim().length < 40) {
      pushToast("info", "That looks a little short — paste a fuller resume for better matches.");
      return;
    }
    setFileName(name);
    setPhase("analyzing");
    setStage(0);
    await sleep(520);
    if (cancelled.current) return;
    setStage(1);
    await sleep(560);
    if (cancelled.current) return;
    setStage(2);
    await sleep(620);
    if (cancelled.current) return;
    setResult(analyzeResume(text, jobs));
    setPhase("done");
  };

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > 2_000_000) {
      pushToast("info", "Keep it under 2MB — or paste the text instead.");
      return;
    }
    setPhase("reading");
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => run(String(reader.result ?? ""), f.name);
    reader.onerror = () => {
      setPhase("idle");
      pushToast("info", "Couldn't read that file — try .txt / .md, or paste the text.");
    };
    reader.readAsText(f);
  };

  const reset = () => {
    setPhase("idle");
    setResult(null);
    setFileName("");
    setPasteText("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <section className="relative overflow-hidden border-b border-ink-800 bg-ink-950 text-paper" aria-label="Resume match">
      {/* ambient layers */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "radial-gradient(720px 340px at 88% 0%, rgb(27 122 96 / 0.22), transparent 62%), radial-gradient(560px 300px at 4% 100%, rgb(239 162 47 / 0.1), transparent 60%), linear-gradient(rgb(243 244 240 / 0.035) 1px, transparent 1px), linear-gradient(90deg, rgb(243 244 240 / 0.035) 1px, transparent 1px)",
          backgroundSize: "auto, auto, 40px 40px, 40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="relative grid w-full items-start gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.08fr] lg:gap-14 lg:px-10 lg:py-14 xl:px-14">
        {/* left — pitch + input */}
        <div>
          <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-pine-200">
            <span className="live-dot h-2 w-2 rounded-full bg-honey-500" />
            Resume match · instant shortlist
          </p>
          <h2 className="mt-4 font-display text-[clamp(28px,4.2vw,46px)] font-bold leading-[1.02] tracking-tight">
            Drop your resume.
            <br />
            Get your{" "}
            <span className="relative inline-block text-honey-400">
              shortlist
              <svg viewBox="0 0 220 10" className="absolute -bottom-1 left-0 w-full" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 7c50-5 130-5 216-2" fill="none" stroke="var(--color-pine-400)" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </span>{" "}
            in seconds.
          </h2>
          <p className="mt-4 max-w-[460px] text-[14.5px] leading-relaxed text-ink-300">
            The matcher reads your skills, then ranks every live role on the board by fit —
            real salaries, real teams, zero forms. Nothing leaves your browser.
          </p>

          {/* dropzone */}
          <label
            htmlFor="resume-file"
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`group mt-6 flex max-w-[520px] cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed px-5 py-5 transition-all duration-200 ${
              dragOver
                ? "border-honey-400 bg-ink-800/90 shadow-[0_0_40px_-10px_rgba(239,162,47,0.45)]"
                : "border-ink-700 bg-ink-900/70 hover:border-pine-400 hover:bg-ink-900"
            }`}
          >
            <span className={`grid h-12 w-12 flex-none place-items-center rounded-lg transition-colors ${dragOver ? "bg-honey-500 text-ink-950" : "bg-ink-800 text-pine-200 group-hover:bg-pine-700 group-hover:text-paper"}`}>
              <Icon name="doc" className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-[16px] font-bold">
                {dragOver ? "Release to analyse" : fileName && phase !== "idle" ? fileName : "Drag & drop your resume"}
              </span>
              <span className="mt-0.5 block text-[12.5px] text-ink-400">
                or click to browse — .txt / .md, or paste the text below
              </span>
            </span>
            <Icon name="arrow-up-right" className={`ml-auto h-5 w-5 flex-none transition-all ${dragOver ? "text-honey-400" : "text-ink-500 group-hover:text-pine-200"}`} />
            <input
              id="resume-file"
              ref={fileRef}
              type="file"
              accept=".txt,.md,.text,.rtf,text/plain"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>

          {/* paste fallback */}
          <div className="mt-3 max-w-[520px]">
            {!pasteOpen ? (
              <button onClick={() => setPasteOpen(true)} className="text-[12.5px] font-semibold text-ink-400 underline-offset-4 transition-colors hover:text-pine-200 hover:underline">
                Prefer to paste it instead? →
              </button>
            ) : (
              <div className="anim-fade-up">
                <textarea
                  rows={4}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste your resume text here…"
                  className="w-full resize-none rounded-lg border border-ink-700 bg-ink-900 px-4 py-3 font-mono text-[12.5px] text-paper placeholder:text-ink-500 focus:border-pine-400 focus:outline-none"
                />
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => run(pasteText, "Pasted resume")}
                    disabled={phase === "analyzing" || phase === "reading"}
                    className="flex items-center gap-2 rounded-lg bg-pine-500 px-4 py-2 font-display text-[13px] font-bold text-paper transition-all hover:bg-pine-400 disabled:opacity-60"
                  >
                    <Icon name="zap" className="h-4 w-4" />Analyse
                  </button>
                  <button onClick={() => setPasteOpen(false)} className="text-[12.5px] font-semibold text-ink-400 hover:text-paper">
                    Hide
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* samples */}
          <div className="mt-5 flex max-w-[520px] flex-wrap items-center gap-2">
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-500">No resume handy? Try:</span>
            {SAMPLES.map((s) => (
              <button
                key={s.label}
                onClick={() => run(s.text, `${s.label} sample`)}
                disabled={phase === "analyzing" || phase === "reading"}
                className="rounded-full border border-ink-700 bg-ink-900 px-3.5 py-1.5 text-[12px] font-semibold text-ink-300 transition-all hover:-translate-y-0.5 hover:border-honey-500 hover:text-honey-400 disabled:opacity-50"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* extracted skills */}
          {phase === "done" && result && (
            <div className="anim-fade-up mt-6 max-w-[520px]">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-500">
                  Skills detected · {result.skills.length}
                </p>
                <button onClick={reset} className="flex items-center gap-1.5 rounded-md border border-ink-700 px-2.5 py-1 text-[11.5px] font-semibold text-ink-300 transition-colors hover:border-coral-500 hover:text-coral-500">
                  <Icon name="x" className="h-3 w-3" />Start over
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {result.skills.length ? result.skills.slice(0, 12).map((s) => (
                  <span key={s} className="anim-pop inline-flex items-center gap-1 rounded-md border border-pine-700/70 bg-pine-800/50 px-2 py-1 font-mono text-[11px] font-semibold text-pine-200">
                    <Icon name="check" className="h-3 w-3" />{s}
                  </span>
                )) : (
                  <p className="text-[12.5px] text-ink-400">Couldn't spot known skills — try a sample above, or paste a fuller resume.</p>
                )}
                {result.skills.length > 12 && (
                  <span className="rounded-md border border-ink-700 px-2 py-1 font-mono text-[11px] text-ink-400">+{result.skills.length - 12} more</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* right — results console */}
        <div className="rounded-xl border border-ink-800 bg-ink-900/75 p-5 shadow-drawer backdrop-blur-sm sm:p-6">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
              <Icon name="target" className="h-4 w-4 text-honey-500" />Match console
            </p>
            <span className="rounded-full border border-ink-700 px-2.5 py-0.5 font-mono text-[10.5px] text-ink-400">
              {phase === "done" && result ? `${result.matches.length} of ${jobs.length} ranked` : `${jobs.length} live roles`}
            </span>
          </div>

          {phase === "idle" && (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-ink-800 text-pine-200">
                <Icon name="compass" className="h-7 w-7" />
              </div>
              <p className="mt-4 font-display text-[17px] font-bold">Your ranked shortlist lands here</p>
              <p className="mt-1.5 max-w-[300px] text-[12.5px] leading-relaxed text-ink-400">
                Upload a resume — or tap a sample — and the board re-ranks itself around your skills.
              </p>
            </div>
          )}

          {(phase === "reading" || phase === "analyzing") && (
            <div className="space-y-4 px-2 py-10">
              {STAGES.map((s, i) => {
                const done = stage > i;
                const active = stage === i;
                return (
                  <div key={s} className="flex items-center gap-3">
                    <span className={`grid h-7 w-7 flex-none place-items-center rounded-full border transition-colors ${done ? "border-pine-500 bg-pine-600 text-paper" : active ? "border-honey-500 text-honey-500" : "border-ink-700 text-ink-500"}`}>
                      {done ? <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.4} /> : active ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-honey-500/30 border-t-honey-500" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                    </span>
                    <span className={`font-mono text-[12.5px] tracking-wide ${done ? "text-pine-200" : active ? "text-honey-400" : "text-ink-500"}`}>
                      {s}{active && i === 2 ? ` · ${jobs.length} roles` : ""}…
                    </span>
                  </div>
                );
              })}
              <div className="skeleton-dark mt-6 h-16 rounded-lg" />
              <div className="skeleton-dark h-16 rounded-lg" />
              <div className="skeleton-dark h-16 rounded-lg" />
            </div>
          )}

          {phase === "done" && result && (
            <div className="mt-4 space-y-2.5">
              {result.matches.length === 0 && (
                <p className="px-2 py-10 text-center text-[13px] text-ink-400">
                  No strong matches yet — add more skills to your resume, or try one of the samples.
                </p>
              )}
              {result.matches.map((m, i) => (
                <div
                  key={m.job.id}
                  className="anim-fade-up group flex items-center gap-4 rounded-lg border border-ink-800 bg-ink-950/70 p-3.5 transition-all hover:-translate-y-0.5 hover:border-pine-500/70 hover:shadow-[0_10px_30px_-12px_rgba(27,122,96,0.5)]"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <ScoreRing score={m.score} />
                  <CompanyLogo company={companyById.get(m.job.companyId)} size="sm" />
                  <button onClick={() => openJob(m.job.id)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate font-display text-[14.5px] font-bold leading-tight text-paper transition-colors group-hover:text-honey-400">
                      {m.job.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[11.5px] text-ink-400">
                      {companyById.get(m.job.companyId)?.name} · {m.job.location} · {fmtSalary(m.job.salaryMin, m.job.salaryMax)}
                    </span>
                    <span className="mt-1.5 flex flex-wrap gap-1">
                      {m.matched.slice(0, 3).map((t) => (
                        <span key={t} className="rounded border border-pine-700/60 bg-pine-800/40 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wide text-pine-200">{t}</span>
                      ))}
                      {m.matched.length > 3 && <span className="font-mono text-[9.5px] text-ink-500">+{m.matched.length - 3} skills</span>}
                    </span>
                  </button>
                  <div className="flex flex-none flex-col gap-1.5">
                    <button
                      onClick={() => openJob(m.job.id)}
                      className="rounded-md border border-ink-700 px-3 py-1.5 text-[11.5px] font-bold text-ink-300 transition-colors hover:border-pine-400 hover:text-pine-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openApply(m.job.id)}
                      className="rounded-md bg-honey-500 px-3 py-1.5 text-[11.5px] font-bold text-ink-950 transition-all hover:bg-honey-400"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
              {result.matches.length > 0 && (
                <p className="pt-1 text-center font-mono text-[10.5px] text-ink-500">
                  Ranked by skill overlap · salaries are verified bands
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
