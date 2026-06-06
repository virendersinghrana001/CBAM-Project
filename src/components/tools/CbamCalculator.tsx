"use client";

import { useEffect, useMemo, useState } from "react";
import { SECTORS, CBAM_PRICE_EUR } from "@/lib/site";
import { YEARS, cbamFactor, freeAllocationPct } from "@/lib/cbam";

type Line = {
  id: number;
  product: string;
  sectorSlug: string;
  tonnes: number;
  intensity: number;
  originPrice: number; // €/tCO2 paid at origin
};

let uid = 1;
const newLine = (sectorSlug = SECTORS[0].slug): Line => {
  const s = SECTORS.find((x) => x.slug === sectorSlug)!;
  return { id: uid++, product: "", sectorSlug, tonnes: 1000, intensity: s.defaultIntensity, originPrice: 0 };
};

const eur = (n: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const num = (n: number) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(n);

function compute(line: Line, price: number, year: string) {
  const embedded = line.tonnes * line.intensity;
  const factor = cbamFactor(year);
  const chargeable = embedded * factor;
  const gross = embedded * price;
  const freeRelief = gross * (1 - factor);
  const originCredit = chargeable * Math.min(Math.max(line.originPrice, 0), price);
  const net = Math.max(gross - freeRelief - originCredit, 0);
  return { embedded, chargeable, gross, freeRelief, originCredit, net };
}

export default function CbamCalculator() {
  const [price, setPrice] = useState(CBAM_PRICE_EUR);
  const [year, setYear] = useState("2026");
  const [lines, setLines] = useState<Line[]>([newLine()]);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("eb_prefill");
      if (!raw) return;
      localStorage.removeItem("eb_prefill");
      const p = JSON.parse(raw) as { intensity?: number; product?: string; sectorSlug?: string; tonnes?: number; year?: string };
      const sectorSlug = SECTORS.some((s) => s.slug === p.sectorSlug) ? p.sectorSlug! : SECTORS[0].slug;
      if (p.year && (YEARS as readonly string[]).includes(p.year)) setYear(p.year);
      setLines([{
        id: uid++,
        product: p.product ?? "",
        sectorSlug,
        tonnes: p.tonnes && p.tonnes > 0 ? p.tonnes : 1000,
        intensity: p.intensity && p.intensity > 0 ? p.intensity : SECTORS.find((s) => s.slug === sectorSlug)!.defaultIntensity,
        originPrice: 0,
      }]);
      setPrefilled(true);
    } catch { /* ignore */ }
  }, []);

  const rows = useMemo(() => lines.map((l) => ({ line: l, calc: compute(l, price, year) })), [lines, price, year]);
  const totals = useMemo(
    () => rows.reduce(
      (acc, { calc }) => ({
        embedded: acc.embedded + calc.embedded,
        gross: acc.gross + calc.gross,
        relief: acc.relief + calc.freeRelief + calc.originCredit,
        net: acc.net + calc.net,
      }),
      { embedded: 0, gross: 0, relief: 0, net: 0 },
    ),
    [rows],
  );
  const tonnesTotal = lines.reduce((a, l) => a + l.tonnes, 0);

  function update(id: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }
  function setSector(id: number, slug: string) {
    const s = SECTORS.find((x) => x.slug === slug)!;
    update(id, { sectorSlug: slug, intensity: s.defaultIntensity });
  }

  function exportData(kind: "json" | "csv") {
    const data = rows.map(({ line, calc }) => ({
      product: line.product || SECTORS.find((s) => s.slug === line.sectorSlug)!.name,
      sector: SECTORS.find((s) => s.slug === line.sectorSlug)!.name,
      tonnes: line.tonnes,
      intensity_tco2_per_t: line.intensity,
      embedded_tco2: Math.round(calc.embedded),
      cbam_factor: cbamFactor(year),
      chargeable_tco2: Math.round(calc.chargeable),
      origin_price_eur: line.originPrice,
      net_liability_eur: Math.round(calc.net),
    }));
    let blob: Blob, filename: string;
    if (kind === "json") {
      blob = new Blob([JSON.stringify({ reportingYear: year, etsPriceEur: price, cbamFactor: cbamFactor(year), lines: data, totals: { embeddedTco2: Math.round(totals.embedded), netLiabilityEur: Math.round(totals.net) } }, null, 2)], { type: "application/json" });
      filename = `ecoborder-cbam-${year}.json`;
    } else {
      const head = Object.keys(data[0] ?? { product: "" }).join(",");
      const body = data.map((r) => Object.values(r).map((v) => (typeof v === "string" && v.includes(",") ? `"${v}"` : v)).join(",")).join("\n");
      blob = new Blob([head + "\n" + body], { type: "text/csv" });
      filename = `ecoborder-cbam-${year}.csv`;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  const maxNet = Math.max(...rows.map((r) => r.calc.net), 1);
  const factorPct = (cbamFactor(year) * 100).toFixed(cbamFactor(year) < 0.1 ? 1 : 1);

  return (
    <div className="space-y-8">
      {prefilled && (
        <div className="flex items-center gap-3 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
          <span>✓</span>
          <span>Imported your calculated emission intensity from the Emissions Calculator. Adjust anything below.</span>
        </div>
      )}

      {/* Global controls */}
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-900">Reporting year</label>
          <p className="text-xs text-slate-500">Sets the CBAM phase-in factor (free allocation phase-out).</p>
          <div className="mt-2 flex items-center gap-3">
            <select value={year} onChange={(e) => setYear(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none">
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
            <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700">
              CBAM factor {factorPct}% · free alloc {freeAllocationPct(year)}%
            </span>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-900">EU ETS reference price</label>
          <p className="text-xs text-slate-500">Carbon price each certificate is valued at.</p>
          <div className="mt-2 flex items-center gap-4">
            <input type="range" min={40} max={150} step={1} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-44 accent-cyan-600" />
            <span className="data-num text-lg font-bold text-slate-900">€{price}<span className="text-xs font-normal text-slate-400">/t</span></span>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="space-y-4">
        {rows.map(({ line, calc }, i) => {
          const sector = SECTORS.find((s) => s.slug === line.sectorSlug)!;
          return (
            <div key={line.id} className="rounded-2xl border border-slate-200 bg-white p-5 card-shadow">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-cyan-600">Product line {i + 1}</span>
                {lines.length > 1 && (
                  <button onClick={() => setLines((ls) => ls.filter((l) => l.id !== line.id))} className="text-sm font-medium text-slate-400 hover:text-red-500">Remove</button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <Field className="sm:col-span-2 lg:col-span-2" label="Product / description">
                  <input value={line.product} onChange={(e) => update(line.id, { product: e.target.value })} placeholder={sector.name} className="inp" />
                </Field>
                <Field label="Sector">
                  <select value={line.sectorSlug} onChange={(e) => setSector(line.id, e.target.value)} className="inp">
                    {SECTORS.map((s) => <option key={s.slug} value={s.slug}>{s.icon} {s.name}</option>)}
                  </select>
                </Field>
                <Field label="Volume (t/yr)">
                  <input type="number" min={0} value={line.tonnes} onChange={(e) => update(line.id, { tonnes: Number(e.target.value) })} className="inp data-num" />
                </Field>
                <Field label="Intensity (tCO₂/t)">
                  <input type="number" min={0} step={0.05} value={line.intensity} onChange={(e) => update(line.id, { intensity: Number(e.target.value) })} className="inp data-num" />
                </Field>
                <Field label="Origin €/t">
                  <input type="number" min={0} value={line.originPrice} onChange={(e) => update(line.id, { originPrice: Number(e.target.value) })} className="inp data-num" />
                </Field>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Mini k="Embedded" v={`${num(calc.embedded)} tCO₂`} />
                <Mini k="Chargeable" v={`${num(calc.chargeable)} tCO₂`} />
                <Mini k="Relief + credits" v={`− ${eur(calc.freeRelief + calc.originCredit)}`} accent />
                <Mini k="Net liability" v={eur(calc.net)} strong />
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={() => setLines((ls) => [...ls, newLine()])} className="w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:border-cyan-400 hover:text-cyan-700">
        + Add another product line
      </button>

      {/* Totals dashboard */}
      <div className="overflow-hidden rounded-3xl ink-gradient text-white">
        <div className="grid gap-px bg-white/10 sm:grid-cols-4">
          <Tot k="Total volume" v={`${num(tonnesTotal)} t`} />
          <Tot k="Embedded emissions" v={`${num(totals.embedded)} tCO₂`} />
          <Tot k="Relief + credits" v={eur(totals.relief)} />
          <Tot k={`Net liability · ${year}`} v={eur(totals.net)} big />
        </div>
        <div className="grid gap-6 p-6 sm:grid-cols-[1.4fr_1fr] sm:p-8">
          <div>
            <p className="mb-3 text-sm font-semibold text-cyan-100">Liability by product line</p>
            <div className="space-y-3">
              {rows.map(({ line, calc }) => {
                const sector = SECTORS.find((s) => s.slug === line.sectorSlug)!;
                return (
                  <div key={line.id}>
                    <div className="flex justify-between text-sm">
                      <span className="text-cyan-50/80">{line.product || sector.name}</span>
                      <span className="data-num font-semibold">{eur(calc.net)}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-lime-300" style={{ width: `${(calc.net / maxNet) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <p className="text-sm text-cyan-100">Estimated quarterly certificate cost</p>
            <p className="data-num mt-1 text-3xl font-extrabold">{eur(totals.net / 4)}</p>
            <div className="mt-4 flex flex-col gap-2">
              <button onClick={() => exportData("csv")} className="rounded-full bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-400">Download CSV</button>
              <button onClick={() => exportData("json")} className="rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/20">Download JSON</button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Indicative estimate only. The CBAM factor reflects the agreed free-allocation phase-out
        (2.5% in 2026 → 100% in 2034); later-year values are subject to EU confirmation. Default
        intensities approximate EU transitional defaults — verified data is usually lower. Not legal or financial advice.
      </p>

      <style>{`
        .inp { width:100%; border-radius:0.5rem; border:1px solid #cbd5e1; padding:0.55rem 0.7rem; font-size:0.875rem; outline:none; background:#fff; }
        .inp:focus { border-color:#06b6d4; box-shadow:0 0 0 3px rgba(8,145,178,0.15); }
      `}</style>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
function Mini({ k, v, strong, accent }: { k: string; v: string; strong?: boolean; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <div className="text-[11px] font-medium text-slate-500">{k}</div>
      <div className={`data-num mt-0.5 text-sm ${strong ? "font-extrabold text-slate-900" : accent ? "font-semibold text-lime-600" : "font-semibold text-slate-700"}`}>{v}</div>
    </div>
  );
}
function Tot({ k, v, big }: { k: string; v: string; big?: boolean }) {
  return (
    <div className={`px-5 py-5 ${big ? "bg-white/5" : ""}`}>
      <div className="text-xs font-medium text-cyan-100/70">{k}</div>
      <div className={`data-num mt-1 font-extrabold ${big ? "text-2xl text-white" : "text-lg text-white/90"}`}>{v}</div>
    </div>
  );
}
