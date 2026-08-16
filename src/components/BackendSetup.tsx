import { Icon, LogoMark } from "./icons";

const Step = ({ n, title, body }: { n: string; title: string; body: React.ReactNode }) => (
  <li className="flex gap-4">
    <span className="mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-full border border-honey-500/40 bg-honey-500/10 font-mono text-[12px] font-bold text-honey-400">
      {n}
    </span>
    <div>
      <p className="font-display text-[15px] font-bold text-paper">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-300">{body}</p>
    </div>
  </li>
);

/**
 * Rendered only when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing.
 * CareerHub has a single backend (Supabase) — this screen replaces the board
 * rather than silently serving local data.
 */
export function BackendSetup() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4 py-14 text-paper">
      {/* ambient layers */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(800px 420px at 80% -10%, rgb(20 97 78 / 0.25), transparent 60%), radial-gradient(600px 380px at 8% 100%, rgb(239 162 47 / 0.12), transparent 60%), linear-gradient(rgb(243 244 240 / 0.03) 1px, transparent 1px), linear-gradient(90deg, rgb(243 244 240 / 0.03) 1px, transparent 1px)",
          backgroundSize: "auto, auto, 44px 44px, 44px 44px",
        }}
      />

      <div className="anim-fade-up relative w-full max-w-[560px]">
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 w-10" />
          <span className="font-display text-[22px] font-bold tracking-tight">
            Career<span className="text-honey-400">Hub</span>
          </span>
          <span className="ml-auto flex items-center gap-1.5 rounded-full border border-coral-500/40 bg-coral-500/10 px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-coral-100">
            <span className="h-1.5 w-1.5 rounded-full bg-coral-500" />
            Backend offline
          </span>
        </div>

        <h1 className="mt-8 font-display text-[clamp(28px,4.5vw,40px)] font-bold leading-[1.05] tracking-tight">
          Connect your <span className="text-pine-200">Supabase</span> backend
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-300">
          CareerHub reads every job, company and application from a live Postgres
          database. Add your project keys and the board comes online instantly — no
          code changes needed.
        </p>

        {/* env block */}
        <div className="mt-7 overflow-hidden rounded-xl border border-ink-800 bg-ink-900/80">
          <div className="flex items-center gap-2 border-b border-ink-800 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-coral-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-honey-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-pine-400/80" />
            <span className="ml-2 font-mono text-[11px] text-ink-400">.env.local</span>
          </div>
          <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-relaxed">
            <code>
              <span className="text-pine-200">VITE_SUPABASE_URL</span>
              <span className="text-ink-400">=</span>
              <span className="text-honey-300">https://your-project.supabase.co</span>
              {"\n"}
              <span className="text-pine-200">VITE_SUPABASE_ANON_KEY</span>
              <span className="text-ink-400">=</span>
              <span className="text-honey-300">eyJhbGciOi…your-anon-key</span>
            </code>
          </pre>
        </div>

        <ol className="mt-8 space-y-5">
          <Step
            n="1"
            title="Create the database"
            body={<>Open the Supabase <span className="font-semibold text-paper">SQL Editor</span> and run <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-[11.5px] text-honey-300">backend/schema.sql</code> from this repo.</>}
          />
          <Step
            n="2"
            title="Seed sample data"
            body={<>Run <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-[11.5px] text-honey-300">npx tsx scripts/seed-supabase.ts</code> with your service-role key (details in <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-[11.5px] text-honey-300">backend/README.md</code>).</>}
          />
          <Step
            n="3"
            title="Add your keys & restart"
            body="Copy .env.example to .env.local, paste the two values above, then restart the dev server."
          />
        </ol>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 rounded-lg bg-pine-600 px-5 py-2.5 font-display text-[13.5px] font-bold text-paper transition-all hover:bg-pine-500 hover:shadow-lift"
          >
            Open Supabase dashboard
            <Icon name="arrow-up-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-ink-400">
            <Icon name="shield" className="h-3.5 w-3.5 text-pine-400" />
            Keys never leave your environment
          </span>
        </div>
      </div>
    </div>
  );
}
