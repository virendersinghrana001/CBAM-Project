// Data model + SEE computation for the CBAM Communication Builder.
// Mirrors the official "CBAM SEE Communication template for installations".

export type Installation = {
  nameLocal: string;
  nameEn: string;
  street: string;
  economicActivity: string;
  postcode: string;
  poBox: string;
  city: string;
  country: string;
  unlocode: string;
  lat: string;
  lng: string;
  repName: string;
  repEmail: string;
  repPhone: string;
  periodStart: string;
  periodEnd: string;
  // Verifier (section 3) — optional, not required during transitional period
  verifierName: string;
  verifierStreet: string;
  verifierCity: string;
  verifierPostcode: string;
  verifierCountry: string;
  verifierRepName: string;
  verifierEmail: string;
  accredMemberState: string;
  accredBody: string;
  accredRegNo: string;
};

export const emptyInstallation = (): Installation => ({
  nameLocal: "", nameEn: "", street: "", economicActivity: "", postcode: "", poBox: "",
  city: "", country: "", unlocode: "", lat: "", lng: "", repName: "", repEmail: "", repPhone: "",
  periodStart: "", periodEnd: "",
  verifierName: "", verifierStreet: "", verifierCity: "", verifierPostcode: "", verifierCountry: "",
  verifierRepName: "", verifierEmail: "", accredMemberState: "", accredBody: "", accredRegNo: "",
});

export type InternalInput = { id: number; fromProcessId: number | null; quantity: number };

export type ProcessRow = {
  id: number;
  name: string;
  sector: string;
  category: string;
  route: string;
  production: number; // total production level (denominator), tonnes
  directEmissions: number; // directly attributable direct emissions, tCO2e
  // measurable heat import/export
  heatImported: number; // TJ
  heatExported: number; // TJ
  heatEf: number; // tCO2/TJ
  // waste gas import/export
  wgImported: number; // TJ
  wgExported: number; // TJ
  wgEf: number; // tCO2/TJ
  // electricity
  elecMwh: number; // consumed, MWh
  elecEf: number; // tCO2/MWh
  elecExportMwh: number; // exported, MWh
  elecExportEf: number; // tCO2/MWh
  // internal precursors produced by other processes and consumed here
  internalInputs: InternalInput[];
};

export const emptyProcess = (id: number, name: string): ProcessRow => ({
  id, name, sector: "Iron & Steel", category: "Crude steel", route: "Basic oxygen steelmaking",
  production: 1000, directEmissions: 0, heatImported: 0, heatExported: 0, heatEf: 0,
  wgImported: 0, wgExported: 0, wgEf: 0, elecMwh: 0, elecEf: 0.45, elecExportMwh: 0, elecExportEf: 0,
  internalInputs: [],
});

export type PrecRow = {
  id: number;
  name: string;
  country: string;
  route: string;
  quantity: number; // tonnes consumed
  seeDirect: number; // tCO2e/t
  seeIndirect: number; // tCO2e/t
  processId: number | null; // which production process consumes it
};

export type ProductProps = Record<string, string | number>;

export type ProductRow = {
  id: number;
  processId: number | null;
  sector: string;
  type: string;
  cnCode: string;
  cnName: string;
  productName: string;
  seeDirect: number;
  seeIndirect: number;
  shareDefault: number;
  elecEfSource: string;
  embeddedElecPerT: number;
  elecEf: number;
  props: ProductProps;
  cpInstrument: string;
  cpCurrency: string;
  cpDuePerT: number;
  rebatePerT: number;
};

export type CommunicationData = {
  installation: Installation;
  processes: ProcessRow[];
  precursors: PrecRow[];
  products: ProductRow[];
};

// --- SEE computation ------------------------------------------------------

/** A process's own attributed emissions (excluding precursor cascade). */
export function ownDirect(p: ProcessRow): number {
  return p.directEmissions + (p.heatImported - p.heatExported) * p.heatEf + (p.wgImported - p.wgExported) * p.wgEf;
}
export function ownIndirect(p: ProcessRow): number {
  return p.elecMwh * p.elecEf - p.elecExportMwh * p.elecExportEf;
}

export type SEE = { direct: number; indirect: number; seeDirect: number; seeIndirect: number };

/** Resolve SEE for every process, cascading purchased + internal precursors. */
export function computeSEE(data: CommunicationData): Map<number, SEE> {
  const memo = new Map<number, SEE>();
  const visiting = new Set<number>();
  const byId = new Map(data.processes.map((p) => [p.id, p]));

  function calc(p: ProcessRow): SEE {
    const hit = memo.get(p.id);
    if (hit) return hit;
    if (visiting.has(p.id)) return { direct: 0, indirect: 0, seeDirect: 0, seeIndirect: 0 }; // cycle guard
    visiting.add(p.id);

    let direct = ownDirect(p);
    let indirect = ownIndirect(p);
    // purchased precursors assigned to this process
    for (const pr of data.precursors.filter((x) => x.processId === p.id)) {
      direct += pr.quantity * pr.seeDirect;
      indirect += pr.quantity * pr.seeIndirect;
    }
    // internal precursors produced by other processes
    for (const inp of p.internalInputs) {
      const from = inp.fromProcessId != null ? byId.get(inp.fromProcessId) : undefined;
      if (from) {
        const s = calc(from);
        direct += inp.quantity * s.seeDirect;
        indirect += inp.quantity * s.seeIndirect;
      }
    }
    const prod = p.production > 0 ? p.production : 0;
    const res: SEE = { direct, indirect, seeDirect: prod ? direct / prod : 0, seeIndirect: prod ? indirect / prod : 0 };
    visiting.delete(p.id);
    memo.set(p.id, res);
    return res;
  }
  data.processes.forEach(calc);
  return memo;
}

export function seeOf(data: CommunicationData, processId: number | null): SEE {
  if (processId == null) return { direct: 0, indirect: 0, seeDirect: 0, seeIndirect: 0 };
  return computeSEE(data).get(processId) ?? { direct: 0, indirect: 0, seeDirect: 0, seeIndirect: 0 };
}

export function totals(data: CommunicationData) {
  const direct = data.processes.reduce((a, p) => a + ownDirect(p), 0);
  const indirect = data.processes.reduce((a, p) => a + ownIndirect(p), 0);
  return { direct, indirect, total: direct + indirect };
}

export const effectiveCp = (p: ProductRow) => Math.max(p.cpDuePerT - p.rebatePerT, 0);

export const PROPERTY_FIELDS: Record<string, { key: string; label: string }[]> = {
  "Iron & Steel": [
    { key: "steelMillId", label: "Steel mill identification number" },
    { key: "pctMn", label: "% Mn" },
    { key: "pctCr", label: "% Cr" },
    { key: "pctNi", label: "% Ni" },
    { key: "pctOtherAlloys", label: "% other alloys" },
    { key: "pctCarbon", label: "% carbon" },
    { key: "scrapPerT", label: "t scrap per t steel" },
  ],
  Aluminium: [
    { key: "scrapPerTAl", label: "t scrap per t aluminium" },
    { key: "pctNonAl", label: "% non-aluminium elements" },
  ],
  Cement: [
    { key: "clinkerFactor", label: "Clinker factor" },
    { key: "calcined", label: "Calcined or not" },
  ],
  Fertilisers: [
    { key: "pctNitricAcid", label: "% nitric acid" },
    { key: "pctUrea", label: "% urea" },
    { key: "pctN", label: "% N contained" },
    { key: "pctNAmmonium", label: "% N as ammonium (NH4+)" },
    { key: "pctNNitrate", label: "% N as nitrate (NO3–)" },
  ],
  Hydrogen: [],
  Electricity: [],
};
