"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FUELS, GRIDS, PROCESS_DEFAULTS, fuelById } from "@/lib/emissions";
import { YEARS } from "@/lib/cbam";
import { CATEGORIES_BY_SECTOR, routesFor, relevantPrecursors, categorySEE } from "@/lib/cbam-routes";
import { CN_SECTORS, type CnEntry } from "@/lib/cn-catalog";
import { CBAM_PRICE_EUR } from "@/lib/site";
import CnPicker from "./CnPicker";

type FuelRow = { id: number; fuelId: string; qty: number };
type PrecInput = { id: number; name: string; amount: number; seeDirect: number; seeIndirect: number };
let uid = 1;
const newFuel = (): FuelRow => ({ id: uid++, fuelId: FUELS[0].id, qty: 1000 });

const r2 = (n: number) => Math.round(n * 100) / 100;
const f2 = (n: number) => new Intl.NumberFormat("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const n0 = (n: number) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(n);
const eur = (n: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const SECTOR_SLUG: Record<string, string> = {
  "Iron & Steel": "iron-steel", Aluminium: "aluminium", Cement: "cement",
  Fertilisers: "fertilisers", Hydrogen: "hydrogen", Electricity: "electricity",
};
const seedPrecs = (category: string): PrecInput[] =>
  relevantPrecursors(category).map((name) => {
    const s = categorySEE(name);
    return { id: uid++, name, amount: 0, seeDirect: s.direct, seeIndirect: s.indirect };
  });

export default function EmissionsCalculator() {
  const router = useRouter();
  const [product, setProduct] = useState("");
  const [sector, setSector] = useState("Iron & Steel");
  const [category, setCategory] = useState("Iron or steel products");
  const [route, setRoute] = useState("All production routes");
  const [cnCode, setCnCode] = useState("");
  const [cnName, setCnName] = useState("");
  const [production, setProduction] = useState(1000);
  const [year, setYear] = useState("2026");

  const [fuels, setFuels] = useState<FuelRow[]>([newFuel()]);
  const [precs, setPrecs] = useState<PrecInput[]>(() => seedPrecs("Iron or steel products"));
  const [processEm, setProcessEm] = useState(0);
  const [heatImp, setHeatImp] = useState(0); const [heatExp, setHeatExp] = useState(0); const [heatEf, setHeatEf] = useState(0);
  const [wgImp, setWgImp] = useState(0); const [wgExp, setWgExp] = useState(0); const [wgEf, setWgEf] = useState(0);
  const [elecMwh, setElecMwh] = useState(500); const [elecEf, setElecEf] = useState(GRIDS[0].factor);
  const [elecExp, setElecExp] = useState(0); const [elecExpEf, setElecExpEf] = useState(0);

  // --- calculations (CBAM SEE methodology) ---
  const fuelRows = useMemo(() => fuels.map((r) => ({ row: r, fuel: fuelById(r.fuelId), tco2: r.qty * fuelById(r.fuelId).factor })), [fuels]);
  const fuelDirect = fuelRows.reduce((a, f) => a + f.tco2, 0);
  const heatAdj = (heatImp - heatExp) * heatEf;
  const wgAdj = (wgImp - wgExp) * wgEf;
  const precDirect = precs.reduce((a, p) => a + p.amount * p.seeDirect, 0);
  const precIndirect = precs.reduce((a, p) => a + p.amount * p.seeIndirect, 0);
  const ownDirect = fuelDirect + processEm + heatAdj + wgAdj;
  const direct = ownDirect + precDirect;
  const ownIndirect = elecMwh * elecEf - elecExp * elecExpEf;
  const indirect = ownIndirect + precIndirect;
  const total = direct + indirect;
  const prod = production > 0 ? production : 0;
  const seeDirect = prod ? direct / prod : 0;
  const seeIndirect = prod ? indirect / prod : 0;
  const intensity = prod ? total / prod : 0;
  const cbamCost = total * CBAM_PRICE_EUR;

  const indicativeProcess = (PROCESS_DEFAULTS[SECTOR_SLUG[sector]]?.factor ?? 0) * production;

  function changeSector(s: string) {
    setSector(s);
    const cat = (CATEGORIES_BY_SECTOR[s] ?? [])[0] ?? "";
    setCategory(cat); setRoute(routesFor(cat)[0]); setPrecs(seedPrecs(cat));
  }
  function changeCategory(c: string) {
    setCategory(c); setRoute(routesFor(c)[0]); setPrecs(seedPrecs(c));
  }
  function onPickCn(e: CnEntry) {
    setCnCode(e.code); setCnName(e.name); setSector(e.sector);
    setCategory(e.category); setRoute(routesFor(e.category)[0]); setPrecs(seedPrecs(e.category));
  }
  function updPrec(id: number, patch: Partial<PrecInput>) { setPrecs((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p))); }

  function useInTaxCalc() {
    try { localStorage.setItem("eb_prefill", JSON.stringify({ intensity: r2(intensity), product: product || cnName || category, sectorSlug: SECTOR_SLUG[sector], tonnes: production, year })); } catch {}
    router.push("/tools/cbam-calculator");
  }
  function sendToComm() {
    const payload = {
      product: product || cnName || category, sector, category, route, cnCode, cnName, year,
      // directEmissions = fuels + process only; heat/waste-gas passed separately so
      // the Communication Builder adds them once (no double counting).
      production, directEmissions: r2(fuelDirect + processEm),
      heatImported: heatImp, heatExported: heatExp, heatEf, wgImported: wgImp, wgExported: wgExp, wgEf,
      elecMwh, elecEf, elecExportMwh: elecExp, elecExportEf: elecExpEf,
      seeDirect: r2(seeDirect), seeIndirect: r2(seeIndirect),
      precursors: precs.filter((p) => p.amount > 0).map((p) => ({ name: p.name, quantity: p.amount, seeDirect: p.seeDirect, seeIndirect: p.seeIndirect })),
    };
    try { localStorage.setItem("eb_process", JSON.stringify(payload)); } catch {}
    router.push("/tools/report-builder");
  }
  function exportJson() {
    const data = {
      reportingYear: year, product: product || cnName, cnCode, cnName, sector, category, route, productionTonnes: production,
      direct: { fuels: fuelRows.map((f) => ({ fuel: f.fuel.name, qty: f.row.qty, unit: f.fuel.unit, tco2: r2(f.tco2) })), processTco2: r2(processEm), heatAdjTco2: r2(heatAdj), wasteGasAdjTco2: r2(wgAdj), precursorDirectTco2: r2(precDirect), totalDirectTco2: r2(direct) },
      indirect: { electricityMwh: elecMwh, elecEf, exportMwh: elecExp, precursorIndirectTco2: r2(precIndirect), totalIndirectTco2: r2(indirect) },
      precursors: precs.map((p) => ({ name: p.name, amountTonnes: p.amount, seeDirect: p.seeDirect, seeIndirect: p.seeIndirect, tco2: r2(p.amount * (p.seeDirect + p.seeIndirect)) })),
      seeDirect: r2(seeDirect), seeIndirect: r2(seeIndirect), intensityTco2PerT: r2(intensity), totalEmbeddedTco2: r2(total),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "ecoborder-emissions.json"; a.click(); URL.revokeObjectURL(url);
  }

  const cats = CATEGORIES_BY_SECTOR[sector] ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-5">
        {/* 1. Product & period */}
        <Card title="1 · Product & reporting period">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="CN code (official) — drives precursors"><CnPicker value={cnCode} onPick={onPickCn} /></Field>
            <Field label="Product name (optional)"><input value={product} onChange={(e) => setProduct(e.target.value)} placeholder={cnName || category} className="inp3" /></Field>
            <Field label="Reporting year"><select value={year} onChange={(e) => setYear(e.target.value)} className="inp3">{YEARS.map((y) => <option key={y}>{y}</option>)}</select></Field>
            <Field label="Sector"><select value={sector} onChange={(e) => changeSector(e.target.value)} className="inp3">{CN_SECTORS.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Aggregated goods category"><select value={category} onChange={(e) => changeCategory(e.target.value)} className="inp3">{cats.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Production route"><select value={route} onChange={(e) => setRoute(e.target.value)} className="inp3">{routesFor(category).map((r) => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Annual production (tonnes)"><input type="number" min={1} value={production} onChange={(e) => setProduction(Number(e.target.value))} className="inp3 data-num" /></Field>
          </div>
          {cnName && <p className="mt-2 text-xs text-slate-500">{category} · CN {cnCode} — {cnName}</p>}
        </Card>

        {/* 2. Direct emissions */}
        <Card title="2 · Direct emissions (Scope 1)">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Fuel combustion (burnt at this installation)</p>
          <div className="mt-3 space-y-3">
            {fuelRows.map(({ row, fuel, tco2 }) => (
              <div key={row.id} className="grid grid-cols-12 items-end gap-3">
                <Field className="col-span-6 sm:col-span-5" label="Fuel"><select value={row.fuelId} onChange={(e) => setFuels((rs) => rs.map((x) => x.id === row.id ? { ...x, fuelId: e.target.value } : x))} className="inp3">{FUELS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></Field>
                <Field className="col-span-4" label={`Quantity (${fuel.unit})`}><input type="number" min={0} value={row.qty} onChange={(e) => setFuels((rs) => rs.map((x) => x.id === row.id ? { ...x, qty: Number(e.target.value) } : x))} className="inp3 data-num" /></Field>
                <div className="col-span-2 pb-2 text-right"><div className="text-[10px] text-slate-400">tCO₂</div><div className="data-num text-sm font-semibold text-slate-900">{f2(tco2)}</div></div>
                <div className="col-span-12 sm:col-span-1 sm:pb-2">{fuels.length > 1 && <button onClick={() => setFuels((rs) => rs.filter((x) => x.id !== row.id))} className="text-xs text-slate-400 hover:text-red-500">remove</button>}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setFuels((rs) => [...rs, newFuel()])} className="mt-3 w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm font-semibold text-slate-600 hover:border-cyan-400 hover:text-cyan-700">+ Add fuel</button>

          {/* Precursors — CN-derived */}
          <div className="mt-5 rounded-xl bg-amber-50/60 p-4 ring-1 ring-amber-100">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Precursor inputs for {category}</p>
            <p className="mt-1 text-xs text-amber-800">⚠️ Avoid double counting: enter fuels above only for combustion at <em>your</em> installation. A precursor&apos;s emission factor already includes the energy used to make it — don&apos;t also enter that fuel here.</p>
            <div className="mt-3 space-y-2">
              {precs.length === 0 && <p className="text-xs text-slate-500">This category has no upstream CBAM precursors.</p>}
              {precs.map((p) => (
                <div key={p.id} className="grid grid-cols-12 items-end gap-2">
                  <div className="col-span-5 pb-2 text-sm font-medium text-slate-700">{p.name}</div>
                  <Field className="col-span-3" label="Amount used (t)"><input type="number" min={0} value={p.amount} onChange={(e) => updPrec(p.id, { amount: Number(e.target.value) })} className="inp3 data-num" /></Field>
                  <Field className="col-span-2" label="SEE (t/t)"><input type="number" min={0} step={0.01} value={p.seeDirect + p.seeIndirect} onChange={(e) => { const tot = Number(e.target.value); const ratio = (p.seeDirect + p.seeIndirect) > 0 ? p.seeDirect / (p.seeDirect + p.seeIndirect) : 1; updPrec(p.id, { seeDirect: r2(tot * ratio), seeIndirect: r2(tot * (1 - ratio)) }); }} className="inp3 data-num" /></Field>
                  <div className="col-span-2 pb-2 text-right"><div className="text-[10px] text-slate-400">tCO₂</div><div className="data-num text-sm font-semibold text-slate-900">{f2(p.amount * (p.seeDirect + p.seeIndirect))}</div></div>
                </div>
              ))}
            </div>
          </div>

          {/* Process emissions — explicit, indicative-labelled */}
          <div className="mt-5 border-t border-slate-100 pt-4">
            <Field label="Process emissions (tCO₂e) — measured, non-combustion (calcination, reduction, PFCs)">
              <input type="number" min={0} value={processEm} onChange={(e) => setProcessEm(Number(e.target.value))} className="inp3 data-num max-w-[14rem]" />
            </Field>
            <p className="mt-1 text-xs text-slate-400">Kept separate from fuels &amp; precursors (CBAM treats process emissions as part of direct attributable emissions). Indicative sector estimate: <button onClick={() => setProcessEm(r2(indicativeProcess))} className="font-semibold text-cyan-700 underline">{f2(indicativeProcess)} tCO₂e</button> (≈ {PROCESS_DEFAULTS[SECTOR_SLUG[sector]]?.factor ?? 0} t/t × production) — indicative only, not official.</p>
          </div>

          {/* heat & waste gas */}
          <details className="mt-4 rounded-xl bg-slate-50 p-4">
            <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-slate-500">Measurable heat &amp; waste gas (advanced)</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Field label="Heat imported (TJ)"><input type="number" value={heatImp} onChange={(e) => setHeatImp(Number(e.target.value))} className="inp3 data-num" /></Field>
              <Field label="Heat exported (TJ)"><input type="number" value={heatExp} onChange={(e) => setHeatExp(Number(e.target.value))} className="inp3 data-num" /></Field>
              <Field label="Heat EF (tCO₂/TJ)"><input type="number" value={heatEf} onChange={(e) => setHeatEf(Number(e.target.value))} className="inp3 data-num" /></Field>
              <Field label="Waste gas imported (TJ)"><input type="number" value={wgImp} onChange={(e) => setWgImp(Number(e.target.value))} className="inp3 data-num" /></Field>
              <Field label="Waste gas exported (TJ)"><input type="number" value={wgExp} onChange={(e) => setWgExp(Number(e.target.value))} className="inp3 data-num" /></Field>
              <Field label="Waste gas EF (tCO₂/TJ)"><input type="number" value={wgEf} onChange={(e) => setWgEf(Number(e.target.value))} className="inp3 data-num" /></Field>
            </div>
          </details>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Mini k="Fuels" v={`${f2(fuelDirect)} t`} />
            <Mini k="Process" v={`${f2(processEm)} t`} />
            <Mini k="Precursors (direct)" v={`${f2(precDirect)} t`} />
            <Mini k="Total direct" v={`${f2(direct)} t`} strong />
          </div>
        </Card>

        {/* 3. Indirect */}
        <Card title="3 · Indirect emissions (Scope 2)">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Electricity used (MWh)"><input type="number" min={0} value={elecMwh} onChange={(e) => setElecMwh(Number(e.target.value))} className="inp3 data-num" /></Field>
            <Field label="Grid EF (tCO₂/MWh)"><input type="number" min={0} step={0.001} value={elecEf} onChange={(e) => setElecEf(Number(e.target.value))} className="inp3 data-num" /></Field>
            <Field label="Electricity exported (MWh)"><input type="number" min={0} value={elecExp} onChange={(e) => setElecExp(Number(e.target.value))} className="inp3 data-num" /></Field>
            <Field label="Exported EF (tCO₂/MWh)"><input type="number" min={0} step={0.001} value={elecExpEf} onChange={(e) => setElecExpEf(Number(e.target.value))} className="inp3 data-num" /></Field>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Mini k="Electricity (own)" v={`${f2(ownIndirect)} t`} />
            <Mini k="Total indirect" v={`${f2(indirect)} t`} strong />
          </div>
        </Card>
      </div>

      {/* Results */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white card-shadow">
          <div className="ink-gradient px-6 py-5 text-white">
            <p className="text-xs font-medium text-cyan-100">Emission intensity · {year}</p>
            <p className="data-num text-4xl font-extrabold">{f2(intensity)}<span className="ml-1 text-base font-normal text-cyan-100">tCO₂e/t</span></p>
          </div>
          <div className="space-y-3 p-6">
            <Row k="SEE direct" v={`${f2(seeDirect)} tCO₂e/t`} />
            <Row k="SEE indirect" v={`${f2(seeIndirect)} tCO₂e/t`} />
            <div className="flex items-center justify-between border-t border-slate-200 pt-3"><span className="font-bold text-slate-900">Total embedded</span><span className="data-num font-extrabold text-slate-900">{f2(total)} tCO₂e</span></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Indicative CBAM cost @ €{CBAM_PRICE_EUR}/t</p><p className="data-num mt-1 text-2xl font-extrabold text-slate-900">{eur(cbamCost)}</p></div>
            <button onClick={useInTaxCalc} className="block w-full rounded-full bg-cyan-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-cyan-700">Use in Tax Calculator →</button>
            <button onClick={sendToComm} className="block w-full rounded-full bg-cyan-50 px-5 py-2.5 text-center text-sm font-semibold text-cyan-700 ring-1 ring-cyan-200 hover:bg-cyan-100">Send to Communication Builder →</button>
            <button onClick={exportJson} className="block w-full rounded-full border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">Download (JSON)</button>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">SEE = direct ÷ production and indirect ÷ production, to 2 decimals. Fuel/grid factors are indicative; CN-code precursor and category factors are the official EU defaults.</p>
      </div>

      <style>{`.inp3{width:100%;border-radius:0.5rem;border:1px solid #cbd5e1;padding:0.5rem 0.65rem;font-size:0.875rem;outline:none;background:#fff}.inp3:focus{border-color:#06b6d4;box-shadow:0 0 0 3px rgba(8,145,178,0.15)}`}</style>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 card-shadow"><h3 className="mb-4 font-bold text-slate-900">{title}</h3>{children}</div>;
}
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>{children}</label>;
}
function Mini({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return <div className="rounded-lg bg-slate-50 px-3 py-2"><div className="text-[11px] font-medium text-slate-500">{k}</div><div className={`data-num mt-0.5 text-sm ${strong ? "font-extrabold text-slate-900" : "font-semibold text-slate-700"}`}>{v}</div></div>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-sm text-slate-500">{k}</span><span className="data-num text-sm font-semibold text-slate-900">{v}</span></div>;
}
