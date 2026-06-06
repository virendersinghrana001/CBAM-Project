// ---------------------------------------------------------------------------
// CBAM definitive-regime mechanics: reporting periods, the free-allocation
// phase-in ("CBAM factor") schedule, and a purchased-precursor library.
// Figures reflect the agreed phase-in schedule; later years remain subject to
// EU confirmation, so every value here is editable in the UI. Estimation only.
// ---------------------------------------------------------------------------

export const QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const;
export const YEARS = ["2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034"] as const;
export type Year = (typeof YEARS)[number];

// Share of embedded emissions for which CBAM certificates must be surrendered,
// as free allocation for EU producers is phased out (the "CBAM factor").
// 2026 → 2.5% rising to 100% in 2034.
export const CBAM_FACTOR: Record<string, number> = {
  "2026": 0.025,
  "2027": 0.05,
  "2028": 0.1,
  "2029": 0.225,
  "2030": 0.285,
  "2031": 0.4875,
  "2032": 0.6375,
  "2033": 0.86,
  "2034": 1.0,
};

export function cbamFactor(year: string): number {
  return CBAM_FACTOR[year] ?? 1;
}
/** Free-allocation benefit (%) implied by the CBAM factor for a year. */
export function freeAllocationPct(year: string): number {
  return Math.round((1 - cbamFactor(year)) * 1000) / 10;
}

// --- Purchased-precursor specific embedded emissions (tCO2 per tonne) ---
// Indicative defaults; suppliers should provide verified values where possible.
export type Precursor = { id: string; name: string; cn: string; sector: string; see: number };

// SEE = total embedded (direct+indirect) per the official EU transitional
// default values where the precursor is a CBAM good (22 Dec 2023). Non-CBAM
// inputs (alumina, anodes, sintered ore) keep indicative values; scrap = 0.
export const PRECURSORS: Precursor[] = [
  // Iron & steel
  { id: "pig_iron", name: "Pig iron", cn: "7201", sector: "Iron & Steel", see: 2.07 },
  { id: "dri", name: "Direct reduced iron (DRI)", cn: "7203", sector: "Iron & Steel", see: 4.81 },
  { id: "crude_steel", name: "Crude steel (primary forms)", cn: "7206", sector: "Iron & Steel", see: 2.2 },
  { id: "semi_finished", name: "Semi-finished steel", cn: "7207", sector: "Iron & Steel", see: 2.21 },
  { id: "hot_rolled_coil", name: "Hot-rolled steel coil", cn: "7208", sector: "Iron & Steel", see: 2.28 },
  { id: "wire_rod", name: "Steel wire rod", cn: "7213", sector: "Iron & Steel", see: 2.21 },
  { id: "ferro_manganese", name: "Ferro-manganese", cn: "7202", sector: "Iron & Steel", see: 3.51 },
  { id: "steel_scrap", name: "Steel scrap", cn: "7204", sector: "Iron & Steel", see: 0.0 },
  { id: "sintered_ore", name: "Sintered ore", cn: "2601", sector: "Iron & Steel", see: 0.36 },
  // Aluminium
  { id: "alumina", name: "Alumina", cn: "2818", sector: "Aluminium", see: 1.2 },
  { id: "unwrought_al", name: "Unwrought aluminium (primary)", cn: "7601", sector: "Aluminium", see: 10.49 },
  { id: "al_scrap", name: "Aluminium scrap", cn: "7602", sector: "Aluminium", see: 0.0 },
  { id: "carbon_anode", name: "Carbon anodes", cn: "8545", sector: "Aluminium", see: 1.5 },
  // Cement
  { id: "clinker", name: "Cement clinker", cn: "2523", sector: "Cement", see: 0.87 },
  // Fertilisers
  { id: "ammonia", name: "Ammonia", cn: "2814", sector: "Fertilisers", see: 2.82 },
  { id: "nitric_acid", name: "Nitric acid", cn: "2808", sector: "Fertilisers", see: 2.6 },
  // Hydrogen
  { id: "grey_hydrogen", name: "Hydrogen (grey/SMR)", cn: "2804", sector: "Hydrogen", see: 10.4 },
];

export const precursorById = (id: string) => PRECURSORS.find((p) => p.id === id)!;
export const precursorsForSector = (sectorName: string) =>
  PRECURSORS.filter((p) => p.sector === sectorName);
