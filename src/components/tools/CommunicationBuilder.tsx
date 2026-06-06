"use client";

import { useEffect, useMemo, useState } from "react";
import CnPicker from "./CnPicker";
import { CN_SECTORS, byCode } from "@/lib/cn-catalog";
import { CATEGORIES_BY_SECTOR, routesFor } from "@/lib/cbam-routes";
import { downloadXlsx } from "@/lib/cbam-xlsx";
import {
  type Installation, type ProcessRow, type PrecRow, type ProductRow, type CommunicationData, type SEE,
  emptyInstallation, emptyProcess, computeSEE, totals, effectiveCp, PROPERTY_FIELDS,
} from "@/lib/communication";

let uid = 1;
const n3 = (x: number) => new Intl.NumberFormat("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x);
const STEPS = ["Installation", "Processes", "Precursors", "Products", "Export"];
const zeroSEE: SEE = { direct: 0, indirect: 0, seeDirect: 0, seeIndirect: 0 };

// Pre-filled, validated example: official EU "CBAM SEE V2.1 Example Steel 1 —
// Blast furnace". Reproduces the workbook's SEE direct 1.539 / indirect 0.204.
function makeSteelExample(): CommunicationData {
  const pid = uid++;
  const SEE_D = 1.5389760645578654;
  const SEE_I = 0.20355398249999998;
  const product = (code: string, name: string): ProductRow => ({
    id: uid++, processId: pid, sector: "Iron & Steel", type: "Iron or steel products",
    cnCode: code, cnName: byCode(code)?.name ?? name, productName: name,
    seeDirect: SEE_D, seeIndirect: SEE_I, shareDefault: 0, elecEfSource: "Mix",
    embeddedElecPerT: 0, elecEf: 0.589, props: {}, cpInstrument: "", cpCurrency: "EUR", cpDuePerT: 0, rebatePerT: 0,
  });
  return {
    installation: {
      ...emptyInstallation(),
      nameEn: "Example Blast Steelworks", street: "Blastfurnace street 2023",
      economicActivity: "Iron & steel production", postcode: "123456", poBox: "XYZ",
      city: "Example City", country: "China (CN)", unlocode: "CN ABC",
      lat: "16.6911279", lng: "147.80337464", periodStart: "2023-01-01", periodEnd: "2023-12-31",
    },
    processes: [{
      ...emptyProcess(pid, "Bubble approach — Iron or steel products"),
      sector: "Iron & Steel", category: "Iron or steel products", route: "All production routes",
      production: 4_800_000, directEmissions: 7_866_044.469877754,
      wgImported: 0, wgExported: 12_800, wgEf: 37.4187,
      elecMwh: 1_658_844, elecEf: 0.589,
    }],
    precursors: [],
    products: [
      product("72081000", "Example name A — hot-rolled flat steel coil"),
      product("72122000", "Example name B — zinc-coated flat steel"),
      product("72139120", "Example name C — wire rod (tyre cord)"),
      product("73021028", "Example name D — vignole rails"),
    ],
  };
}

export default function CommunicationBuilder() {
  const [step, setStep] = useState(0);
  const [inst, setInst] = useState<Installation>(emptyInstallation());
  const [processes, setProcesses] = useState<ProcessRow[]>([{ ...emptyProcess(uid++, "Process 1"), directEmissions: 1900 }]);
  const [precursors, setPrecursors] = useState<PrecRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);

  // Import a process handed off from the Emissions Calculator.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("eb_process");
      if (!raw) return;
      localStorage.removeItem("eb_process");
      const p = JSON.parse(raw);
      const pid = uid++;
      setProcesses([{
        ...emptyProcess(pid, p.product || "Imported from Emissions Calculator"),
        sector: p.sector ?? "Iron & Steel", category: p.category ?? "", route: p.route ?? "",
        production: p.production ?? 0, directEmissions: p.directEmissions ?? 0,
        heatImported: p.heatImported ?? 0, heatExported: p.heatExported ?? 0, heatEf: p.heatEf ?? 0,
        wgImported: p.wgImported ?? 0, wgExported: p.wgExported ?? 0, wgEf: p.wgEf ?? 0,
        elecMwh: p.elecMwh ?? 0, elecEf: p.elecEf ?? 0, elecExportMwh: p.elecExportMwh ?? 0, elecExportEf: p.elecExportEf ?? 0,
      }]);
      setPrecursors((p.precursors ?? []).map((pr: { name: string; quantity: number; seeDirect: number; seeIndirect: number }) => ({
        id: uid++, name: pr.name, country: "", route: "", quantity: pr.quantity, seeDirect: pr.seeDirect, seeIndirect: pr.seeIndirect, processId: pid,
      })));
      if (p.cnCode) {
        setProducts([{
          id: uid++, processId: pid, sector: p.sector ?? "Iron & Steel", type: p.category ?? "", cnCode: p.cnCode, cnName: p.cnName ?? "",
          productName: p.product ?? "", seeDirect: p.seeDirect ?? 0, seeIndirect: p.seeIndirect ?? 0, shareDefault: 0,
          elecEfSource: "", embeddedElecPerT: 0, elecEf: 0, props: {}, cpInstrument: "", cpCurrency: "EUR", cpDuePerT: 0, rebatePerT: 0,
        }]);
      }
      setStep(1);
    } catch { /* ignore */ }
  }, []);

  const data: CommunicationData = useMemo(() => ({ installation: inst, processes, precursors, products }), [inst, processes, precursors, products]);
  const seeMap = useMemo(() => computeSEE(data), [data]);
  const t = totals(data);

  function setI<K extends keyof Installation>(k: K, v: Installation[K]) { setInst((s) => ({ ...s, [k]: v })); }
  function updProc(id: number, patch: Partial<ProcessRow>) { setProcesses((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p))); }
  function updPrec(id: number, patch: Partial<PrecRow>) { setPrecursors((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p))); }
  function updProd(id: number, patch: Partial<ProductRow>) { setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p))); }

  function loadExample() {
    const ex = makeSteelExample();
    setInst(ex.installation); setProcesses(ex.processes); setPrecursors(ex.precursors); setProducts(ex.products);
    setStep(0);
  }
  function clearAll() {
    setInst(emptyInstallation());
    setProcesses([{ ...emptyProcess(uid++, "Process 1"), directEmissions: 1900 }]);
    setPrecursors([]); setProducts([]); setStep(0);
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-100 bg-cyan-50/50 px-4 py-3">
        <p className="text-sm text-slate-600">New here? Load the validated <strong>EU steel blast-furnace example</strong> (reproduces SEE 1.539 / 0.204).</p>
        <div className="flex gap-2">
          <button onClick={loadExample} className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700">Load steel example</button>
          <button onClick={clearAll} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white">Clear</button>
        </div>
      </div>
      <div className="mb-8 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${i === step ? "bg-cyan-600 text-white" : i < step ? "bg-cyan-50 text-cyan-700" : "bg-slate-100 text-slate-500"}`}>
            <span className={`grid h-5 w-5 place-items-center rounded-full text-xs ${i === step ? "bg-white/20" : "bg-white"}`}>{i + 1}</span>{s}
          </button>
        ))}
      </div>

      {step === 0 && <InstallationStep inst={inst} setI={setI} />}
      {step === 1 && <ProcessStep processes={processes} setProcesses={setProcesses} updProc={updProc} seeMap={seeMap} />}
      {step === 2 && <PrecursorStep precursors={precursors} setPrecursors={setPrecursors} updPrec={updPrec} processes={processes} />}
      {step === 3 && <ProductStep products={products} setProducts={setProducts} updProd={updProd} processes={processes} seeMap={seeMap} />}
      {step === 4 && <ExportStep data={data} t={t} />}

      <div className="mt-8 flex items-center justify-between">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-40">← Back</button>
        <span className="text-sm text-slate-400">Total: <strong className="data-num text-slate-700">{n3(t.total)} tCO₂e</strong></span>
        {step < STEPS.length - 1 ? <button onClick={() => setStep(step + 1)} className="rounded-full bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700">Next →</button> : <span className="w-20" />}
      </div>

      <style>{`.inp4{width:100%;border-radius:0.5rem;border:1px solid #cbd5e1;padding:0.5rem 0.65rem;font-size:0.875rem;outline:none;background:#fff}.inp4:focus{border-color:#06b6d4;box-shadow:0 0 0 3px rgba(8,145,178,0.15)}`}</style>
    </div>
  );
}

function F({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>{children}</label>;
}
function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 card-shadow"><div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-slate-900">{title}</h3>{action}</div>{children}</div>;
}
function Out({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return <div className="rounded-lg bg-slate-50 px-3 py-2"><div className="text-[11px] font-medium text-slate-500">{k}</div><div className={`data-num mt-0.5 text-sm ${strong ? "font-extrabold text-slate-900" : "font-semibold text-slate-700"}`}>{v}</div></div>;
}

// ---------- Step 1: Installation + Verifier ----------
function InstallationStep({ inst, setI }: { inst: Installation; setI: <K extends keyof Installation>(k: K, v: Installation[K]) => void }) {
  return (
    <div className="space-y-5">
      <Card title="Reporting period (annual)">
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Start"><input type="date" value={inst.periodStart} onChange={(e) => setI("periodStart", e.target.value)} className="inp4" /></F>
          <F label="End"><input type="date" value={inst.periodEnd} onChange={(e) => setI("periodEnd", e.target.value)} className="inp4" /></F>
        </div>
        <p className="mt-2 text-xs text-slate-400">The installation SEE communication is reported on an annual basis (e.g. a full calendar year).</p>
      </Card>
      <Card title="About the installation">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <F label="Name (local)"><input value={inst.nameLocal} onChange={(e) => setI("nameLocal", e.target.value)} className="inp4" /></F>
          <F label="Name (English)"><input value={inst.nameEn} onChange={(e) => setI("nameEn", e.target.value)} className="inp4" /></F>
          <F label="Economic activity"><input value={inst.economicActivity} onChange={(e) => setI("economicActivity", e.target.value)} className="inp4" /></F>
          <F label="Street, Number"><input value={inst.street} onChange={(e) => setI("street", e.target.value)} className="inp4" /></F>
          <F label="Post code"><input value={inst.postcode} onChange={(e) => setI("postcode", e.target.value)} className="inp4" /></F>
          <F label="P.O. Box"><input value={inst.poBox} onChange={(e) => setI("poBox", e.target.value)} className="inp4" /></F>
          <F label="City"><input value={inst.city} onChange={(e) => setI("city", e.target.value)} className="inp4" /></F>
          <F label="Country (origin)"><input value={inst.country} onChange={(e) => setI("country", e.target.value)} className="inp4" /></F>
          <F label="UNLOCODE"><input value={inst.unlocode} onChange={(e) => setI("unlocode", e.target.value)} className="inp4" /></F>
          <F label="Latitude"><input value={inst.lat} onChange={(e) => setI("lat", e.target.value)} className="inp4" /></F>
          <F label="Longitude"><input value={inst.lng} onChange={(e) => setI("lng", e.target.value)} className="inp4" /></F>
        </div>
      </Card>
      <Card title="Authorised representative">
        <div className="grid gap-4 sm:grid-cols-3">
          <F label="Name"><input value={inst.repName} onChange={(e) => setI("repName", e.target.value)} className="inp4" /></F>
          <F label="Email"><input type="email" value={inst.repEmail} onChange={(e) => setI("repEmail", e.target.value)} className="inp4" /></F>
          <F label="Telephone"><input value={inst.repPhone} onChange={(e) => setI("repPhone", e.target.value)} className="inp4" /></F>
        </div>
      </Card>
      <details className="rounded-2xl border border-slate-200 bg-white p-5 card-shadow">
        <summary className="cursor-pointer font-bold text-slate-900">Verifier &amp; accreditation <span className="text-xs font-normal text-slate-400">(optional — not required during transitional period)</span></summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <F label="Verifier company name"><input value={inst.verifierName} onChange={(e) => setI("verifierName", e.target.value)} className="inp4" /></F>
          <F label="Street, Number"><input value={inst.verifierStreet} onChange={(e) => setI("verifierStreet", e.target.value)} className="inp4" /></F>
          <F label="City"><input value={inst.verifierCity} onChange={(e) => setI("verifierCity", e.target.value)} className="inp4" /></F>
          <F label="Postcode/ZIP"><input value={inst.verifierPostcode} onChange={(e) => setI("verifierPostcode", e.target.value)} className="inp4" /></F>
          <F label="Country"><input value={inst.verifierCountry} onChange={(e) => setI("verifierCountry", e.target.value)} className="inp4" /></F>
          <F label="Verifier representative"><input value={inst.verifierRepName} onChange={(e) => setI("verifierRepName", e.target.value)} className="inp4" /></F>
          <F label="Verifier email"><input value={inst.verifierEmail} onChange={(e) => setI("verifierEmail", e.target.value)} className="inp4" /></F>
          <F label="Accreditation member state"><input value={inst.accredMemberState} onChange={(e) => setI("accredMemberState", e.target.value)} className="inp4" /></F>
          <F label="National accreditation body"><input value={inst.accredBody} onChange={(e) => setI("accredBody", e.target.value)} className="inp4" /></F>
          <F label="Accreditation registration number"><input value={inst.accredRegNo} onChange={(e) => setI("accredRegNo", e.target.value)} className="inp4" /></F>
        </div>
      </details>
    </div>
  );
}

// ---------- Step 2: Processes ----------
function ProcessStep({ processes, setProcesses, updProc, seeMap }: { processes: ProcessRow[]; setProcesses: React.Dispatch<React.SetStateAction<ProcessRow[]>>; updProc: (id: number, p: Partial<ProcessRow>) => void; seeMap: Map<number, SEE> }) {
  function changeSector(id: number, sector: string) {
    const cat = (CATEGORIES_BY_SECTOR[sector] ?? [])[0] ?? "";
    updProc(id, { sector, category: cat, route: routesFor(cat)[0] });
  }
  function changeCategory(id: number, category: string) {
    updProc(id, { category, route: routesFor(category)[0] });
  }
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">SEE = (directly attributable emissions + heat/waste-gas adjustments + cascaded precursors) ÷ total production. Internal precursors are produced by another process within the installation; purchased ones go in the next step.</p>
      {processes.map((p, i) => {
        const see = seeMap.get(p.id) ?? zeroSEE;
        const cats = CATEGORIES_BY_SECTOR[p.sector] ?? [];
        const others = processes.filter((x) => x.id !== p.id);
        return (
          <Card key={p.id} title={`Production process ${i + 1}`} action={processes.length > 1 ? <button onClick={() => setProcesses((ps) => ps.filter((x) => x.id !== p.id))} className="text-sm text-slate-400 hover:text-red-500">Remove</button> : undefined}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <F label="Process name"><input value={p.name} onChange={(e) => updProc(p.id, { name: e.target.value })} className="inp4" /></F>
              <F label="Sector"><select value={p.sector} onChange={(e) => changeSector(p.id, e.target.value)} className="inp4">{CN_SECTORS.map((s) => <option key={s}>{s}</option>)}</select></F>
              <F label="Aggregated goods category"><select value={p.category} onChange={(e) => changeCategory(p.id, e.target.value)} className="inp4">{cats.map((c) => <option key={c}>{c}</option>)}</select></F>
              <F label="Production route"><select value={p.route} onChange={(e) => updProc(p.id, { route: e.target.value })} className="inp4">{routesFor(p.category).map((r) => <option key={r}>{r}</option>)}</select></F>
              <F label="Total production (t)"><input type="number" min={0} value={p.production} onChange={(e) => updProc(p.id, { production: Number(e.target.value) })} className="inp4 data-num" /></F>
              <F label="Direct attributable emissions (tCO₂e)"><input type="number" value={p.directEmissions} onChange={(e) => updProc(p.id, { directEmissions: Number(e.target.value) })} className="inp4 data-num" /></F>
              <F label="Electricity consumed (MWh)"><input type="number" min={0} value={p.elecMwh} onChange={(e) => updProc(p.id, { elecMwh: Number(e.target.value) })} className="inp4 data-num" /></F>
              <F label="Electricity EF (tCO₂/MWh)"><input type="number" min={0} step={0.001} value={p.elecEf} onChange={(e) => updProc(p.id, { elecEf: Number(e.target.value) })} className="inp4 data-num" /></F>
            </div>

            <details className="mt-4 rounded-xl bg-slate-50 p-4">
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-slate-500">Heat, waste gas &amp; electricity export (advanced)</summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <F label="Net measurable heat imported (TJ)"><input type="number" value={p.heatImported} onChange={(e) => updProc(p.id, { heatImported: Number(e.target.value) })} className="inp4 data-num" /></F>
                <F label="Heat exported (TJ)"><input type="number" value={p.heatExported} onChange={(e) => updProc(p.id, { heatExported: Number(e.target.value) })} className="inp4 data-num" /></F>
                <F label="Heat EF (tCO₂/TJ)"><input type="number" value={p.heatEf} onChange={(e) => updProc(p.id, { heatEf: Number(e.target.value) })} className="inp4 data-num" /></F>
                <F label="Waste gas imported (TJ)"><input type="number" value={p.wgImported} onChange={(e) => updProc(p.id, { wgImported: Number(e.target.value) })} className="inp4 data-num" /></F>
                <F label="Waste gas exported (TJ)"><input type="number" value={p.wgExported} onChange={(e) => updProc(p.id, { wgExported: Number(e.target.value) })} className="inp4 data-num" /></F>
                <F label="Waste gas EF (tCO₂/TJ)"><input type="number" value={p.wgEf} onChange={(e) => updProc(p.id, { wgEf: Number(e.target.value) })} className="inp4 data-num" /></F>
                <F label="Electricity exported (MWh)"><input type="number" value={p.elecExportMwh} onChange={(e) => updProc(p.id, { elecExportMwh: Number(e.target.value) })} className="inp4 data-num" /></F>
                <F label="Exported electricity EF (tCO₂/MWh)"><input type="number" step={0.001} value={p.elecExportEf} onChange={(e) => updProc(p.id, { elecExportEf: Number(e.target.value) })} className="inp4 data-num" /></F>
              </div>
            </details>

            {others.length > 0 && (
              <div className="mt-4 rounded-xl bg-cyan-50/50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-cyan-700">Internal precursors (produced by another process here)</p>
                <div className="mt-3 space-y-2">
                  {p.internalInputs.map((inp) => (
                    <div key={inp.id} className="grid grid-cols-12 items-end gap-2">
                      <F className="col-span-7" label="From process"><select value={inp.fromProcessId ?? ""} onChange={(e) => updProc(p.id, { internalInputs: p.internalInputs.map((x) => x.id === inp.id ? { ...x, fromProcessId: e.target.value ? Number(e.target.value) : null } : x) })} className="inp4"><option value="">—</option>{others.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.category})</option>)}</select></F>
                      <F className="col-span-3" label="Quantity (t)"><input type="number" min={0} value={inp.quantity} onChange={(e) => updProc(p.id, { internalInputs: p.internalInputs.map((x) => x.id === inp.id ? { ...x, quantity: Number(e.target.value) } : x) })} className="inp4 data-num" /></F>
                      <div className="col-span-2 pb-2 text-right"><button onClick={() => updProc(p.id, { internalInputs: p.internalInputs.filter((x) => x.id !== inp.id) })} className="text-xs text-slate-400 hover:text-red-500">✕</button></div>
                    </div>
                  ))}
                </div>
                <button onClick={() => updProc(p.id, { internalInputs: [...p.internalInputs, { id: uid++, fromProcessId: others[0]?.id ?? null, quantity: 0 }] })} className="mt-2 text-xs font-semibold text-cyan-700 hover:underline">+ Add internal precursor</button>
              </div>
            )}

            <div className="mt-4 grid grid-cols-3 gap-3">
              <Out k="SEE direct" v={`${n3(see.seeDirect)} tCO₂e/t`} />
              <Out k="SEE indirect" v={`${n3(see.seeIndirect)} tCO₂e/t`} />
              <Out k="SEE total" v={`${n3(see.seeDirect + see.seeIndirect)} tCO₂e/t`} strong />
            </div>
          </Card>
        );
      })}
      <button onClick={() => setProcesses((ps) => [...ps, emptyProcess(uid++, `Process ${ps.length + 1}`)])} className="w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:border-cyan-400 hover:text-cyan-700">+ Add production process</button>
    </div>
  );
}

// ---------- Step 3: Purchased precursors ----------
function PrecursorStep({ precursors, setPrecursors, updPrec, processes }: { precursors: PrecRow[]; setPrecursors: React.Dispatch<React.SetStateAction<PrecRow[]>>; updPrec: (id: number, p: Partial<PrecRow>) => void; processes: ProcessRow[] }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">Precursors produced OUTSIDE the installation (purchased from third parties) and consumed within it. Their embedded emissions cascade into the consuming process. Internally-produced precursors are modelled in step 2.</p>
      {precursors.map((p, i) => (
        <Card key={p.id} title={`Purchased precursor ${i + 1}`} action={<button onClick={() => setPrecursors((ps) => ps.filter((x) => x.id !== p.id))} className="text-sm text-slate-400 hover:text-red-500">Remove</button>}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <F label="Precursor name"><input value={p.name} onChange={(e) => updPrec(p.id, { name: e.target.value })} className="inp4" /></F>
            <F label="Country of production"><input value={p.country} onChange={(e) => updPrec(p.id, { country: e.target.value })} className="inp4" /></F>
            <F label="Route"><input value={p.route} onChange={(e) => updPrec(p.id, { route: e.target.value })} className="inp4" /></F>
            <F label="Consumed by process"><select value={p.processId ?? ""} onChange={(e) => updPrec(p.id, { processId: e.target.value ? Number(e.target.value) : null })} className="inp4"><option value="">—</option>{processes.map((pr) => <option key={pr.id} value={pr.id}>{pr.name}</option>)}</select></F>
            <F label="Quantity consumed (t)"><input type="number" min={0} value={p.quantity} onChange={(e) => updPrec(p.id, { quantity: Number(e.target.value) })} className="inp4 data-num" /></F>
            <F label="SEE direct (tCO₂e/t)"><input type="number" min={0} step={0.01} value={p.seeDirect} onChange={(e) => updPrec(p.id, { seeDirect: Number(e.target.value) })} className="inp4 data-num" /></F>
            <F label="SEE indirect (tCO₂e/t)"><input type="number" min={0} step={0.01} value={p.seeIndirect} onChange={(e) => updPrec(p.id, { seeIndirect: Number(e.target.value) })} className="inp4 data-num" /></F>
            <Out k="Embedded contribution" v={`${n3(p.quantity * (p.seeDirect + p.seeIndirect))} tCO₂e`} />
          </div>
        </Card>
      ))}
      <button onClick={() => setPrecursors((ps) => [...ps, { id: uid++, name: "", country: "", route: "", quantity: 0, seeDirect: 0, seeIndirect: 0, processId: processes[0]?.id ?? null }])} className="w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:border-cyan-400 hover:text-cyan-700">+ Add purchased precursor</button>
      {precursors.length === 0 && <p className="text-center text-sm text-slate-400">None — fine if all precursors are produced internally (step 2).</p>}
    </div>
  );
}

// ---------- Step 4: Products ----------
function ProductStep({ products, setProducts, updProd, processes, seeMap }: { products: ProductRow[]; setProducts: React.Dispatch<React.SetStateAction<ProductRow[]>>; updProd: (id: number, p: Partial<ProductRow>) => void; processes: ProcessRow[]; seeMap: Map<number, SEE> }) {
  function addProduct() {
    setProducts((ps) => [...ps, { id: uid++, processId: processes[0]?.id ?? null, sector: "Iron & Steel", type: "", cnCode: "", cnName: "", productName: "", seeDirect: 0, seeIndirect: 0, shareDefault: 0, elecEfSource: "", embeddedElecPerT: 0, elecEf: 0, props: {}, cpInstrument: "", cpCurrency: "EUR", cpDuePerT: 0, rebatePerT: 0 }]);
  }
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">Each product maps to an official CN code. SEE is prefilled from its production process (editable). Add product properties and any carbon price paid at origin.</p>
      {products.map((p, i) => {
        const fields = PROPERTY_FIELDS[p.sector] ?? [];
        const proc = processes.find((x) => x.id === p.processId);
        return (
          <Card key={p.id} title={`Product ${i + 1}`} action={<button onClick={() => setProducts((ps) => ps.filter((x) => x.id !== p.id))} className="text-sm text-slate-400 hover:text-red-500">Remove</button>}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <F label="From production process"><select value={p.processId ?? ""} onChange={(e) => { const pid = e.target.value ? Number(e.target.value) : null; const s = pid != null ? seeMap.get(pid) : null; updProd(p.id, s ? { processId: pid, seeDirect: +s.seeDirect.toFixed(3), seeIndirect: +s.seeIndirect.toFixed(3) } : { processId: pid }); }} className="inp4"><option value="">—</option>{processes.map((pr) => <option key={pr.id} value={pr.id}>{pr.name}</option>)}</select></F>
              <F label="CN code (official)"><CnPicker value={p.cnCode} onPick={(e) => { const s = p.processId != null ? seeMap.get(p.processId) : null; updProd(p.id, { cnCode: e.code, cnName: e.name, type: e.category, sector: e.sector, seeDirect: s ? +s.seeDirect.toFixed(3) : e.direct, seeIndirect: s ? +s.seeIndirect.toFixed(3) : e.indirect }); }} /></F>
              <F label="Product name (for invoices)"><input value={p.productName} onChange={(e) => updProd(p.id, { productName: e.target.value })} className="inp4" /></F>
            </div>
            <p className="mt-2 text-xs text-slate-500">{p.cnName ? `${p.type} · ${p.cnName}` : ""}{proc ? ` · route: ${proc.route}` : ""}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <F label="SEE direct (tCO₂e/t)"><input type="number" min={0} step={0.001} value={p.seeDirect} onChange={(e) => updProd(p.id, { seeDirect: Number(e.target.value) })} className="inp4 data-num" /></F>
              <F label="SEE indirect (tCO₂e/t)"><input type="number" min={0} step={0.001} value={p.seeIndirect} onChange={(e) => updProd(p.id, { seeIndirect: Number(e.target.value) })} className="inp4 data-num" /></F>
              <Out k="SEE total" v={`${n3(p.seeDirect + p.seeIndirect)} tCO₂e/t`} strong />
              <F label="Share by default value (%)"><input type="number" min={0} max={100} value={p.shareDefault} onChange={(e) => updProd(p.id, { shareDefault: Number(e.target.value) })} className="inp4 data-num" /></F>
            </div>
            {fields.length > 0 && (
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Product properties · {p.sector}</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{fields.map((f) => <F key={f.key} label={f.label}><input value={(p.props[f.key] as string) ?? ""} onChange={(e) => updProd(p.id, { props: { ...p.props, [f.key]: e.target.value } })} className="inp4" /></F>)}</div>
              </div>
            )}
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Carbon price paid at origin</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <F label="Instrument"><input value={p.cpInstrument} onChange={(e) => updProd(p.id, { cpInstrument: e.target.value })} className="inp4" /></F>
                <F label="Currency"><input value={p.cpCurrency} onChange={(e) => updProd(p.id, { cpCurrency: e.target.value })} className="inp4" /></F>
                <F label="CP due (per t)"><input type="number" min={0} value={p.cpDuePerT} onChange={(e) => updProd(p.id, { cpDuePerT: Number(e.target.value) })} className="inp4 data-num" /></F>
                <F label="Rebate (per t)"><input type="number" min={0} value={p.rebatePerT} onChange={(e) => updProd(p.id, { rebatePerT: Number(e.target.value) })} className="inp4 data-num" /></F>
              </div>
              <p className="mt-2 text-xs text-slate-500">Effective CP due: <strong className="data-num">{n3(effectiveCp(p))} {p.cpCurrency}/t</strong></p>
            </div>
          </Card>
        );
      })}
      <button onClick={addProduct} className="w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:border-cyan-400 hover:text-cyan-700">+ Add product</button>
      {products.length === 0 && <p className="text-center text-sm text-slate-400">Add at least one product to generate the communication.</p>}
    </div>
  );
}

// ---------- Step 5: Export ----------
function ExportStep({ data, t }: { data: CommunicationData; t: { direct: number; indirect: number; total: number } }) {
  function buildJson() {
    return { installation: data.installation, totals: { direct: +t.direct.toFixed(2), indirect: +t.indirect.toFixed(2), total: +t.total.toFixed(2) }, processes: data.processes.map((p) => ({ name: p.name, category: p.category, route: p.route, production: p.production })), products: data.products.map((p) => ({ process: data.processes.find((x) => x.id === p.processId)?.name, route: data.processes.find((x) => x.id === p.processId)?.route, cnCode: p.cnCode, cnName: p.cnName, productName: p.productName, seeDirect: +p.seeDirect.toFixed(3), seeIndirect: +p.seeIndirect.toFixed(3), seeTotal: +(p.seeDirect + p.seeIndirect).toFixed(3), effectiveCp: +effectiveCp(p).toFixed(2), properties: p.props })) };
  }
  function dlJson() { const blob = new Blob([JSON.stringify(buildJson(), null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "cbam-communication.json"; a.click(); URL.revokeObjectURL(url); }
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 card-shadow">
        <h3 className="font-bold text-slate-900">Review &amp; export</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Out k="Installation" v={data.installation.nameEn || data.installation.nameLocal || "—"} />
          <Out k="Products" v={`${data.products.length}`} />
          <Out k="Processes" v={`${data.processes.length}`} />
          <Out k="Total embedded" v={`${n3(t.total)} tCO₂e`} strong />
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-500"><tr><th className="py-2">CN</th><th>Product</th><th>Route</th><th className="text-right">SEE direct</th><th className="text-right">SEE indirect</th><th className="text-right">SEE total</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {data.products.map((p) => { const proc = data.processes.find((x) => x.id === p.processId); return (
                <tr key={p.id}><td className="py-2 data-num font-semibold text-cyan-700">{p.cnCode || "—"}</td><td className="text-slate-700">{p.productName || p.cnName || "—"}</td><td className="text-slate-500">{proc?.route ?? "—"}</td><td className="text-right data-num">{n3(p.seeDirect)}</td><td className="text-right data-num">{n3(p.seeIndirect)}</td><td className="text-right data-num font-semibold">{n3(p.seeDirect + p.seeIndirect)}</td></tr>
              ); })}
              {data.products.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-slate-400">No products yet — go back to step 4.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <button onClick={() => downloadXlsx(data, "cbam-communication.xlsx")} className="rounded-full bg-cyan-600 px-6 py-3.5 text-center font-semibold text-white hover:bg-cyan-700">⬇ Download CBAM Communication (Excel)</button>
        <button onClick={dlJson} className="rounded-full border border-slate-300 px-6 py-3.5 text-center font-semibold text-slate-700 hover:bg-slate-50">Download JSON</button>
        <button onClick={() => window.print()} className="rounded-full border border-slate-300 px-6 py-3.5 text-center font-semibold text-slate-700 hover:bg-slate-50">Print</button>
      </div>
      <p className="text-xs text-slate-400">The Excel mirrors the official template&apos;s Installation (incl. verifier), Summary_Products and Communication tabs. Validate against the current EU template before any real submission.</p>
    </div>
  );
}
