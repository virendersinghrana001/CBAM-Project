"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { searchCatalog, CN_SECTORS, type CnEntry } from "@/lib/cn-catalog";
import { CBAM_PRICE_EUR } from "@/lib/site";
import { CBAM_DEFAULTS_SOURCE, CBAM_DEFAULTS_URL } from "@/lib/cbam-defaults";

const eur = (n: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function CnCodeChecker() {
  const [q, setQ] = useState("");
  const [sector, setSector] = useState<string | null>(null);
  const [selected, setSelected] = useState<CnEntry | null>(null);

  const results = useMemo(() => searchCatalog(q, sector ?? undefined, 200), [q, sector]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 749 CBAM CN codes — code, product or category…" className="w-full rounded-full border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip active={sector === null} onClick={() => setSector(null)}>All</Chip>
          {CN_SECTORS.map((s) => <Chip key={s} active={sector === s} onClick={() => setSector(s)}>{s}</Chip>)}
        </div>
        <p className="mt-4 text-sm text-slate-500">{results.length} shown{results.length === 200 ? " (refine to narrow)" : ""}</p>
        <div className="mt-3 max-h-[30rem] divide-y divide-slate-100 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
          {results.map((c) => (
            <button key={c.code} onClick={() => setSelected(c)} className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-cyan-50/50 ${selected?.code === c.code ? "bg-cyan-50" : ""}`}>
              <span className="min-w-0">
                <span className="data-num font-semibold text-cyan-700">{c.code}</span>
                <span className="ml-3 text-sm text-slate-600">{c.name}</span>
              </span>
              <span className="data-num shrink-0 text-sm font-semibold text-slate-900">{c.sector === "Electricity" ? "—" : `${+(c.direct + c.indirect).toFixed(2)} t`}</span>
            </button>
          ))}
          {results.length === 0 && <p className="px-4 py-10 text-center text-sm text-slate-500">No CBAM code matched “{q}”.</p>}
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        {selected ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white card-shadow">
            <div className="ink-gradient px-6 py-5 text-white">
              <span className="text-xs font-medium text-cyan-100">{selected.category} · {selected.sector}</span>
              <h3 className="data-num mt-1 text-3xl font-extrabold">CN {selected.code}</h3>
              <p className="mt-1 text-sm text-cyan-50/90">{selected.name}</p>
            </div>
            <div className="space-y-4 p-6">
              {selected.sector === "Electricity" ? (
                <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Electricity uses a <strong>country-specific</strong> CO₂ emission factor (IEA), not a single tCO₂/t default.</div>
              ) : (
                <>
                  <Row k="Default direct (category)" v={`${selected.direct} tCO₂e / t`} />
                  <Row k="Default indirect (category)" v={`${selected.indirect} tCO₂e / t`} />
                  <Row k="Total embedded" v={`${+(selected.direct + selected.indirect).toFixed(2)} tCO₂e / t`} />
                  <Row k={`At €${CBAM_PRICE_EUR}/tCO₂`} v={`${eur((selected.direct + selected.indirect) * CBAM_PRICE_EUR)} per tonne`} />
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-500">Quick estimate · 1,000 t / yr</p>
                    <p className="data-num mt-1 text-2xl font-extrabold text-slate-900">{eur((selected.direct + selected.indirect) * 1000 * CBAM_PRICE_EUR)}</p>
                  </div>
                </>
              )}
              <Link href="/tools/cbam-calculator" className="block rounded-full bg-cyan-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-cyan-700">Model it in the calculator →</Link>
              <p className="text-[11px] leading-relaxed text-slate-400">CN code/name/category from the official EU CBAM template. Default values: <a href={CBAM_DEFAULTS_URL} target="_blank" rel="noreferrer" className="underline">{CBAM_DEFAULTS_SOURCE}</a> (aggregated-category level).</p>
            </div>
          </div>
        ) : (
          <div className="grid h-full min-h-[18rem] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <div><span className="text-4xl">🔎</span><p className="mt-3 text-sm text-slate-500">Select a CN code to see its category, emission factors and cost estimate.</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${active ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{children}</button>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-sm text-slate-500">{k}</span><span className="data-num text-sm font-semibold text-slate-900">{v}</span></div>;
}
