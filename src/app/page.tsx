import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui";
import Faq from "@/components/Faq";
import Tilt from "@/components/Tilt";
import { CAPABILITIES, SECTORS, FAQS, CBAM_PRICE_EUR } from "@/lib/site";

export default function Home() {
  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden aurora-dark text-white">
        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="orb orb-cyan -left-24 top-10 h-80 w-80 pulse-glow" />
        <div className="orb orb-lime right-0 top-40 h-72 w-72 pulse-glow" style={{ animationDelay: "-2s" }} />
        <div className="orb orb-teal bottom-0 left-1/3 h-72 w-72 pulse-glow" style={{ animationDelay: "-4s" }} />

        <div className="container-x relative grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1.05fr_0.95fr]">
          {/* copy */}
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full glass-dark px-3 py-1 text-xs font-semibold text-cyan-100">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" /></span>
              Free · no signup · runs in your browser
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              The free{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-cyan-200 to-lime-300 bg-clip-text text-transparent">CBAM toolkit</span>{" "}
              for exporters
            </h1>
            <p className="mt-6 max-w-xl text-lg text-cyan-50/80">
              Calculate embedded emissions from real activity data, turn them into your carbon
              border tax, check CN codes, and build the official EU communication — five tools, no
              consultants, no data leaving your device.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/tools/emissions-calculator" className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 px-7 py-3.5 text-base font-semibold text-slate-900 glow transition-transform hover:scale-[1.03]">
                Calculate emissions
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/tools/cbam-calculator" className="inline-flex items-center justify-center rounded-full glass-dark px-7 py-3.5 text-base font-semibold text-white hover:bg-white/15">
                Calculate CBAM tax
              </Link>
            </div>
            <p className="mt-6 text-xs text-cyan-100/60">EU ETS reference €{CBAM_PRICE_EUR}/tCO₂ · steel, aluminium, cement, fertilisers, hydrogen &amp; electricity</p>
          </div>

          {/* 3D dashboard mock */}
          <div className="animate-scale-in">
            <Tilt max={10} className="mx-auto max-w-md">
              <div className="rounded-[1.6rem] glass-dark p-6 elevate" style={{ transform: "translateZ(40px)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-cyan-100/70">Emission intensity</p>
                    <p className="data-num text-4xl font-extrabold text-white">1.74<span className="ml-1 text-base font-normal text-cyan-100/70">tCO₂e/t</span></p>
                  </div>
                  <span className="rounded-full bg-lime-400/20 px-3 py-1 text-xs font-bold text-lime-300 ring-1 ring-lime-400/30">SEE</span>
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    { label: "SEE direct", val: "1.54", pct: "88%", c: "from-cyan-400 to-cyan-300" },
                    { label: "SEE indirect", val: "0.20", pct: "12%", c: "from-lime-400 to-emerald-300" },
                    { label: "CBAM cost @ €82", val: "€143", pct: "62%", c: "from-cyan-300 to-teal-300" },
                  ].map((r) => (
                    <div key={r.label}>
                      <div className="flex justify-between text-sm">
                        <span className="text-cyan-50/80">{r.label}</span>
                        <span className="data-num font-bold text-white">{r.val}</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full bg-gradient-to-r ${r.c}`} style={{ width: r.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {["749 CN codes", "Official SEE", "XLSX export"].map((t) => (
                    <div key={t} className="rounded-xl bg-white/5 px-2 py-2 text-center text-[11px] font-semibold text-cyan-100 ring-1 ring-white/10">{t}</div>
                  ))}
                </div>
              </div>
              {/* floating chips */}
              <div className="float absolute -left-5 -top-5 rounded-2xl glass-dark px-4 py-2.5 text-sm font-bold text-white shadow-xl" style={{ transform: "translateZ(80px)" }}>
                <span className="data-num text-cyan-300">CN 72081000</span>
              </div>
              <div className="float-slow float-delay absolute -right-5 -bottom-5 rounded-2xl bg-lime-400/90 px-4 py-2.5 text-sm font-extrabold text-slate-900 shadow-xl" style={{ transform: "translateZ(100px)" }}>
                −35% tax
              </div>
            </Tilt>
          </div>
        </div>
        {/* bottom fade into white */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* ---------------- TOOLS GRID ---------------- */}
      <Section id="tools" className="relative pt-16 sm:pt-20">
        <SectionHeading center eyebrow="The toolkit" title="Five tools, full functionality" subtitle="A natural flow from emissions to tax to the official communication — or start anywhere. All free." className="mx-auto" />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c, i) => (
            <Tilt key={c.href} max={6} className="group h-full">
              <Link href={c.href} className="card-3d relative flex h-full flex-col overflow-hidden rounded-3xl gradient-border p-7">
                <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-100 to-transparent opacity-60 blur-2xl transition-opacity group-hover:opacity-100" />
                <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 text-2xl text-white shadow-lg shadow-cyan-600/30" style={{ transform: "translateZ(30px)" }}>{c.icon}</span>
                <h3 className="relative mt-5 text-xl font-bold text-slate-900">{c.title}</h3>
                <p className="relative mt-2 flex-1 text-sm leading-relaxed text-slate-600">{c.desc}</p>
                <span className="relative mt-5 inline-flex items-center gap-1 text-sm font-semibold text-cyan-600 transition-all group-hover:gap-2">
                  {c.cta} →
                </span>
                <span className="absolute right-5 top-6 data-num text-xs font-bold text-slate-200">0{i + 1}</span>
              </Link>
            </Tilt>
          ))}
        </div>
      </Section>

      {/* ---------------- COVERAGE ---------------- */}
      <Section className="relative overflow-hidden bg-slate-50">
        <div className="orb orb-cyan -left-20 top-0 h-64 w-64 opacity-30" />
        <SectionHeading center eyebrow="Coverage" title="Every CBAM-covered sector" subtitle="The tools carry official default emission factors for all six CBAM goods categories." className="mx-auto" />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SECTORS.map((s) => (
            <Tilt key={s.slug} max={10}>
              <div className="card-3d rounded-2xl border border-slate-200 bg-white p-5 text-center elevate">
                <span className="text-3xl" style={{ transform: "translateZ(20px)", display: "inline-block" }}>{s.icon}</span>
                <h3 className="mt-2 text-sm font-bold text-slate-900">{s.name}</h3>
                <p className="data-num mt-1 text-xs text-slate-500">{s.defaultIntensity} tCO₂/t</p>
              </div>
            </Tilt>
          ))}
        </div>
      </Section>

      {/* ---------------- WHY ---------------- */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionHeading eyebrow="Why it's different" title="A product, not a pitch" subtitle="Most CBAM sites lock the useful parts behind a sales call. EcoBorder flips that — the tools are the product, and they're fully open." />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { t: "No gating", d: "Full results — breakdowns, reports, exports — with no email wall.", i: "🔓" },
              { t: "Private by design", d: "Calculations run client-side; your figures never touch a server.", i: "🛡️" },
              { t: "Official data", d: "EU CBAM default values, 749 CN codes and production routes built in.", i: "✓" },
              { t: "Exportable", d: "Download estimates and the official-format communication (Excel/CSV/JSON).", i: "⬇️" },
            ].map((x) => (
              <div key={x.t} className="card-3d rounded-2xl border border-slate-200 bg-white p-5 elevate">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-lg">{x.i}</span>
                <h3 className="mt-3 font-bold text-slate-900">{x.t}</h3>
                <p className="mt-1 text-sm text-slate-600">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ---------------- FAQ ---------------- */}
      <Section className="relative overflow-hidden bg-slate-50" id="faq">
        <div className="orb orb-lime right-0 top-10 h-64 w-64 opacity-25" />
        <SectionHeading center eyebrow="FAQ" title="Good to know" className="mb-12 mx-auto" />
        <Faq items={FAQS} />
      </Section>
    </>
  );
}
