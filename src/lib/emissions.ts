// ---------------------------------------------------------------------------
// Emission-factor library for the EcoBorder Emissions Calculator.
// Factors are indicative, drawn from common IPCC / DEFRA-style values. They are
// for estimation only — use verified, site-specific factors for real filings.
// ---------------------------------------------------------------------------

export type Fuel = {
  id: string;
  name: string;
  unit: string; // native unit the quantity is entered in
  factor: number; // tCO2 per unit
};

// Scope 1 — stationary/mobile combustion. factor = tCO2 per native unit.
export const FUELS: Fuel[] = [
  { id: "natural_gas", name: "Natural gas", unit: "1000 m³", factor: 1.879 },
  { id: "coal_bituminous", name: "Coal (bituminous)", unit: "tonne", factor: 2.42 },
  { id: "coke", name: "Coke / metallurgical coke", unit: "tonne", factor: 3.13 },
  { id: "petcoke", name: "Petroleum coke", unit: "tonne", factor: 3.39 },
  { id: "diesel", name: "Diesel / gas oil", unit: "litre", factor: 0.00268 },
  { id: "fuel_oil", name: "Heavy fuel oil", unit: "tonne", factor: 3.11 },
  { id: "lpg", name: "LPG", unit: "tonne", factor: 2.94 },
  { id: "petrol", name: "Petrol / gasoline", unit: "litre", factor: 0.00231 },
  { id: "biomass", name: "Biomass (wood/pellets)", unit: "tonne", factor: 0.0 }, // biogenic — counted zero
];

// Scope 2 — electricity grid emission factors (tCO2 per MWh).
export type Grid = { id: string; name: string; factor: number };
export const GRIDS: Grid[] = [
  { id: "in", name: "India", factor: 0.71 },
  { id: "cn", name: "China", factor: 0.58 },
  { id: "us", name: "United States", factor: 0.37 },
  { id: "eu", name: "EU average", factor: 0.23 },
  { id: "global", name: "Global average", factor: 0.48 },
  { id: "green", name: "Certified renewable (PPA)", factor: 0.0 },
];

// Optional sector process-emission defaults (tCO2 per tonne of product),
// covering chemistry NOT captured by fuel combustion (e.g. calcination, PFCs).
export const PROCESS_DEFAULTS: Record<string, { label: string; factor: number }> = {
  "iron-steel": { label: "BF-BOF reduction & flux", factor: 0.25 },
  aluminium: { label: "Anode / PFC process", factor: 1.6 },
  cement: { label: "Clinker calcination", factor: 0.53 },
  fertilisers: { label: "N₂O / process", factor: 0.3 },
  hydrogen: { label: "SMR process", factor: 0.0 },
  electricity: { label: "—", factor: 0.0 },
};

export const fuelById = (id: string) => FUELS.find((f) => f.id === id)!;
export const gridById = (id: string) => GRIDS.find((g) => g.id === id)!;
