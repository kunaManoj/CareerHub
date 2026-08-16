import { useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { useApp } from "../context/AppContext";
import { Reveal, usePrefersReducedMotion } from "../hooks";
import { CompanyLogo } from "./JobCard";
import { Icon } from "./icons";

const CITY_MEDIANS = [
  { city: "Bengaluru", lpa: 29 },
  { city: "Mumbai", lpa: 26 },
  { city: "Remote (India)", lpa: 25 },
  { city: "Hyderabad", lpa: 24 },
  { city: "Pune", lpa: 22 },
  { city: "Chennai", lpa: 21 },
];

const COMP_ROWS = [
  { label: "Base salary", value: "₹34,00,000", pct: 71 },
  { label: "Variable & bonus", value: "₹5,00,000", pct: 10 },
  { label: "ESOPs · 4-yr vest", value: "₹9,00,000", pct: 19 },
];

export function OfferShowcase() {
  const { companyById, setView } = useApp();
  const nivaan = companyById.get("co-nivaan");
  const frame = useRef<HTMLDivElement>(null);

  const reduced = usePrefersReducedMotion();
  const [pose, setPose] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, hovering: false });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced || !frame.current) return;
    const r = frame.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setPose({ rx: -py * 13, ry: px * 16, gx: (px + 0.5) * 100, gy: (py + 0.5) * 100, hovering: true });
  };
  const onLeave = () => setPose({ rx: 0, ry: 0, gx: 50, gy: 50, hovering: false });

  const max = CITY_MEDIANS[0].lpa;

  return (
    <section className="relative overflow-hidden border-t border-line bg-surface/70" aria-label="Salary transparency on CareerHub">
      {/* ambient accent glows */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-pine-100/70 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-honey-100/80 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        {/* -------- copy + medians -------- */}
        <div>
          <Reveal>
            <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-pine-600">
              <Icon name="coins" className="h-4 w-4" />The CareerHub standard
            </p>
            <h2 className="mt-4 font-display text-[clamp(30px,4.5vw,48px)] font-bold leading-[1.02] tracking-tight text-ink-900">
              Every range you see is a <span className="text-pine-600">real, verified range.</span>
            </h2>
            <p className="mt-5 max-w-[520px] text-[15px] leading-relaxed text-ink-500">
              No "competitive salary" black boxes. Every listing on CareerHub publishes its full
              band — base, variable and equity — before you spend a single evening on an
              application. Bands are checked at posting and refreshed quarterly, so the number
              in the card is the number in the offer letter.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {[
                { icon: "shield" as const, text: "94% of listings show a verified band" },
                { icon: "calendar" as const, text: "Bands refreshed quarterly" },
                { icon: "zap" as const, text: "Median first response: 36h" },
              ].map((b) => (
                <span key={b.text} className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[12px] font-semibold text-ink-700 transition-all hover:-translate-y-0.5 hover:border-pine-200 hover:shadow-card">
                  <Icon name={b.icon} className="h-3.5 w-3.5 text-pine-600" />{b.text}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-9">
              <p className="mb-3 flex items-baseline justify-between font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400">
                <span>Median senior-engineering band · by city</span>
                <span>LPA</span>
              </p>
              <div className="space-y-2.5">
                {CITY_MEDIANS.map((c, i) => (
                  <div key={c.city} className="flex items-center gap-3">
                    <span className="w-[110px] flex-none text-[12.5px] font-semibold text-ink-700">{c.city}</span>
                    <div className="h-[9px] flex-1 overflow-hidden rounded-full bg-mist">
                      <div
                        className="med-bar h-full rounded-full bg-gradient-to-r from-pine-600 to-pine-400"
                        style={{ "--w": `${(c.lpa / max) * 100}%`, transitionDelay: `${i * 90 + 250}ms` } as CSSProperties}
                      />
                    </div>
                    <span className="w-12 flex-none text-right font-mono text-[12.5px] font-bold text-ink-900">₹{c.lpa}L</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 font-mono text-[10.5px] text-ink-400">Source: CareerHub offers index, trailing 12 months, n = 4,180.</p>
            </div>
          </Reveal>

          <Reveal delay={280}>
            <button
              onClick={() => { setView("board"); }}
              className="group mt-8 inline-flex items-center gap-2 font-display text-[14.5px] font-bold text-pine-700 transition-colors hover:text-pine-800"
            >
              Browse transparent listings
              <span className="grid h-8 w-8 place-items-center rounded-full border border-pine-200 bg-pine-50 transition-all group-hover:translate-x-1 group-hover:bg-pine-600 group-hover:text-paper">
                <Icon name="arrow-right" className="h-4 w-4" />
              </span>
            </button>
          </Reveal>
        </div>

        {/* -------- 3D offer card -------- */}
        <Reveal delay={150}>
          <div className="flex justify-center lg:justify-end" style={{ perspective: "1300px" }}>
            <div className="relative" style={{ transformStyle: "preserve-3d" }}>
              {/* drifting decor */}
              <div
                aria-hidden="true"
                className="absolute -left-10 -top-8 h-16 w-16 rounded-full border-2 border-dashed border-honey-300"
                style={{ transform: "translateZ(30px)", animation: "spinSlow 26s linear infinite" }}
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-6 -right-8 text-pine-200"
                style={{ transform: "translateZ(24px)" }}
              >
                <Icon name="spark" filled className="h-10 w-10" />
              </div>

              <div
                ref={frame}
                onMouseMove={onMove}
                onMouseLeave={onLeave}
                className="relative w-[330px] cursor-default select-none rounded-2xl border border-ink-800 bg-ink-950 p-6 text-paper shadow-lift sm:w-[360px]"
                style={{
                  transform: `rotateX(${pose.rx}deg) rotateY(${pose.ry}deg)`,
                  transformStyle: "preserve-3d",
                  transition: pose.hovering ? "transform 90ms linear" : "transform 600ms cubic-bezier(0.2, 0.7, 0.3, 1)",
                }}
              >
                {/* glare */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{
                    background: `radial-gradient(420px circle at ${pose.gx}% ${pose.gy}%, rgb(255 255 255 / 0.09), transparent 55%)`,
                    opacity: pose.hovering ? 1 : 0,
                    transition: "opacity 300ms ease",
                  }}
                />

                <div style={{ transform: "translateZ(20px)" }}>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-honey-400">Offer snapshot</p>
                  <div className="mt-3 flex items-center gap-3">
                    <CompanyLogo company={nivaan} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-[14.5px] font-bold leading-tight">Senior Platform Engineer</p>
                      <p className="mt-0.5 text-[11.5px] text-ink-300">{nivaan?.name} · Hyderabad · Hybrid</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3.5">
                    {COMP_ROWS.map((r) => (
                      <div key={r.label}>
                        <div className="flex items-baseline justify-between">
                          <span className="text-[12px] text-ink-300">{r.label}</span>
                          <span className="font-mono text-[13px] font-semibold text-paper">{r.value}</span>
                        </div>
                        <div className="mt-1.5 h-[6px] overflow-hidden rounded-full bg-ink-800">
                          <div
                            className={`h-full rounded-full ${r.label.startsWith("ESOP") ? "bg-honey-500" : "bg-pine-500"}`}
                            style={{ width: `${r.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-ink-800 pt-4">
                    <div>
                      <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-ink-400">Year-one total comp</p>
                      <p className="font-display text-[30px] font-bold leading-none text-honey-400">₹48L</p>
                    </div>
                    <p className="text-right font-mono text-[10.5px] leading-relaxed text-ink-400">
                      within public band<br /><span className="text-pine-200">₹32L – ₹55L</span>
                    </p>
                  </div>

                  <div className="mt-4 flex gap-1.5">
                    {["Family floater", "Gratuity + NPS", "₹50K L&D"].map((p) => (
                      <span key={p} className="rounded-md bg-ink-800/80 px-2 py-1 font-mono text-[9.5px] font-semibold text-ink-300">{p}</span>
                    ))}
                  </div>
                </div>

                {/* floating depth chips */}
                <div
                  className="absolute -right-5 -top-5 flex items-center gap-1.5 rounded-full bg-honey-500 px-3 py-1.5 font-mono text-[10.5px] font-bold text-ink-950 shadow-lift"
                  style={{ transform: "translateZ(64px)" }}
                >
                  <Icon name="check" className="h-3 w-3" strokeWidth={2.8} />Band public
                </div>
                <div
                  className="absolute -bottom-6 -left-6 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-ink-900 shadow-lift"
                  style={{ transform: "translateZ(52px)" }}
                >
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-ink-400">Median · this level</p>
                  <p className="mt-0.5 font-mono text-[13.5px] font-bold text-pine-700">₹32L – ₹55L</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
