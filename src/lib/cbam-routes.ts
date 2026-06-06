// Official production routes and relevant-precursor relationships per aggregated
// goods category, parsed from the EU CBAM communication template
// (Parameters_Constants). Used to drive route dropdowns and internal precursor
// chains in the Communication Builder.

export type CategoryInfo = { routes: string[]; precursors: string[] };

export const CATEGORY_INFO: Record<string, CategoryInfo> = {
  "Cement clinker": { routes: ["All production routes"], precursors: [] },
  "Calcined clays": { routes: ["All production routes"], precursors: [] },
  "Aluminous cement": { routes: ["All production routes"], precursors: [] },
  Cement: { routes: ["All production routes"], precursors: ["Cement clinker"] },
  "Iron or steel products": { routes: ["All production routes"], precursors: ["Crude steel"] },
  "Crude steel": {
    routes: ["Basic oxygen steelmaking", "Electric arc furnace", "Other production routes", "Unknown production routes"],
    precursors: ["Pig iron", "Direct reduced iron", "Alloys (FeMn, FeCr, FeNi)"],
  },
  "Direct reduced iron": { routes: ["All production routes"], precursors: ["Sintered Ore", "Hydrogen"] },
  "Pig iron": {
    routes: ["Blast furnace route", "Smelting reduction", "Other production routes", "Unknown production routes"],
    precursors: ["Sintered Ore", "Alloys (FeMn, FeCr, FeNi)"],
  },
  "Alloys (FeMn, FeCr, FeNi)": { routes: ["All production routes"], precursors: ["Sintered Ore"] },
  "Sintered Ore": { routes: ["All production routes"], precursors: [] },
  Hydrogen: {
    routes: ["Steam reforming and partial oxidation", "Electrolysis of water", "Chlor-Alkali electrolysis and production of chlorates", "Other production routes", "Unknown production routes"],
    precursors: [],
  },
  Ammonia: {
    routes: ["Haber-Bosch process with steam reforming of natural gas or biogas", "Haber-Bosch process with gasification of coal or other fuels", "Other production routes", "Unknown production routes"],
    precursors: ["Hydrogen"],
  },
  "Nitric acid": { routes: ["All production routes"], precursors: ["Ammonia"] },
  Urea: { routes: ["All production routes"], precursors: ["Ammonia"] },
  "Mixed fertilisers": { routes: ["All production routes"], precursors: ["Ammonia", "Nitric acid", "Urea"] },
  "Aluminium products": { routes: ["All production routes"], precursors: ["Unwrought aluminium"] },
  "Unwrought aluminium": {
    routes: ["Primary (electrolytic) smelting", "Secondary melting (recycling)", "Other production routes", "Unknown production routes"],
    precursors: [],
  },
  "Electricity (export to EU)": { routes: ["All production routes"], precursors: [] },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_INFO);

// Categories grouped by sector, for sector-scoped dropdowns.
export const CATEGORIES_BY_SECTOR: Record<string, string[]> = {
  "Iron & Steel": ["Iron or steel products", "Crude steel", "Pig iron", "Direct reduced iron", "Alloys (FeMn, FeCr, FeNi)", "Sintered Ore"],
  Aluminium: ["Aluminium products", "Unwrought aluminium"],
  Cement: ["Cement", "Cement clinker", "Aluminous cement", "Calcined clays"],
  Fertilisers: ["Ammonia", "Nitric acid", "Urea", "Mixed fertilisers"],
  Hydrogen: ["Hydrogen"],
  Electricity: ["Electricity (export to EU)"],
};

export const routesFor = (category: string): string[] =>
  CATEGORY_INFO[category]?.routes ?? ["All production routes"];
export const relevantPrecursors = (category: string): string[] =>
  CATEGORY_INFO[category]?.precursors ?? [];

// Official transitional default SEE (direct, indirect tCO2e/t) per aggregated
// goods category — used to compute CN-derived precursor emissions.
export const CATEGORY_DEFAULTS: Record<string, { direct: number; indirect: number }> = {
  "Cement clinker": { direct: 0.83, indirect: 0.04 },
  "Calcined clays": { direct: 0.23, indirect: 0.08 },
  "Aluminous cement": { direct: 1.75, indirect: 0.15 },
  Cement: { direct: 0.81, indirect: 0.06 },
  "Iron or steel products": { direct: 2.01, indirect: 0.27 },
  "Crude steel": { direct: 1.97, indirect: 0.23 },
  "Direct reduced iron": { direct: 4.81, indirect: 0.0 },
  "Pig iron": { direct: 1.9, indirect: 0.17 },
  "Alloys (FeMn, FeCr, FeNi)": { direct: 1.44, indirect: 2.08 },
  "Sintered Ore": { direct: 0.31, indirect: 0.05 },
  Hydrogen: { direct: 10.4, indirect: 0.0 },
  Ammonia: { direct: 2.68, indirect: 0.14 },
  "Nitric acid": { direct: 2.56, indirect: 0.05 },
  Urea: { direct: 1.78, indirect: 0.12 },
  "Mixed fertilisers": { direct: 1.78, indirect: 0.12 },
  "Aluminium products": { direct: 2.73, indirect: 9.3 },
  "Unwrought aluminium": { direct: 2.36, indirect: 8.14 },
  "Electricity (export to EU)": { direct: 0, indirect: 0 },
};

export const categorySEE = (category: string) =>
  CATEGORY_DEFAULTS[category] ?? { direct: 0, indirect: 0 };
