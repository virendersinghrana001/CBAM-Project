// ---------------------------------------------------------------------------
// OFFICIAL EU CBAM default values — transitional period (1 Oct 2023–31 Dec 2025)
// Source: European Commission, DG TAXUD, "Default values for the transitional
// period of the CBAM" (Brussels, 22 December 2023). Values are the published
// specific embedded emissions in tonnes CO2e per tonne of product:
//   direct  = production-process emissions
//   indirect = emissions from electricity consumed in production
// For aggregated headings the representative published sub-value is used.
//
// NOTE: From 2026 the definitive regime uses a different, country-specific set
// of default values (Implementing Regulation (EU) 2025/2621, Annexes I–III).
// Those are per exporting country; this table is the EU-wide transitional set.
// ---------------------------------------------------------------------------

export const CBAM_DEFAULTS_SOURCE =
  'European Commission (DG TAXUD) — "Default values for the transitional period of the CBAM", 22 December 2023';
export const CBAM_DEFAULTS_URL =
  "https://taxation-customs.ec.europa.eu/system/files/2023-12/Default%20values%20transitional%20period.pdf";

export type CbamDefault = { direct: number; indirect: number };

// Keyed by 4-digit CN heading (representative published value).
export const CBAM_DEFAULTS: Record<string, CbamDefault> = {
  // --- Iron & steel ---
  "7201": { direct: 1.9, indirect: 0.17 }, // Pig iron
  "7202": { direct: 1.44, indirect: 2.08 }, // Ferro-manganese (ferro-alloys)
  "7203": { direct: 4.81, indirect: 0.0 }, // DRI
  "7205": { direct: 1.9, indirect: 0.17 },
  "7206": { direct: 1.97, indirect: 0.23 }, // Crude steel, other primary
  "7207": { direct: 1.89, indirect: 0.32 }, // Semi-finished
  "7208": { direct: 2.01, indirect: 0.27 },
  "7209": { direct: 2.03, indirect: 0.36 },
  "7210": { direct: 1.97, indirect: 0.39 },
  "7211": { direct: 2.01, indirect: 0.27 },
  "7212": { direct: 1.97, indirect: 0.39 },
  "7213": { direct: 1.89, indirect: 0.32 },
  "7214": { direct: 1.89, indirect: 0.32 },
  "7215": { direct: 1.89, indirect: 0.32 },
  "7216": { direct: 1.89, indirect: 0.32 },
  "7217": { direct: 1.88, indirect: 0.49 },
  "7301": { direct: 2.03, indirect: 0.36 },
  "7302": { direct: 1.93, indirect: 0.29 },
  "7304": { direct: 1.97, indirect: 0.41 },
  "7305": { direct: 2.03, indirect: 0.36 },
  "7306": { direct: 2.01, indirect: 0.27 },
  "7307": { direct: 1.93, indirect: 0.29 },
  "7308": { direct: 2.46, indirect: 2.55 },
  "7318": { direct: 1.89, indirect: 0.32 }, // Fasteners
  "7325": { direct: 1.97, indirect: 0.39 }, // Cast articles (representative)
  "7326": { direct: 1.97, indirect: 0.39 },
  // --- Cement ---
  "2507": { direct: 0.23, indirect: 0.08 }, // Calcined kaolinic clays
  "2523": { direct: 0.81, indirect: 0.06 }, // Portland cement (clinker 2523 10 = 0.83/0.04)
  // --- Fertilisers ---
  "2808": { direct: 2.56, indirect: 0.05 }, // Nitric acid
  "2814": { direct: 2.68, indirect: 0.14 }, // Ammonia
  "3102": { direct: 1.78, indirect: 0.12 }, // Mineral N fertilisers (urea)
  "3105": { direct: 0.94, indirect: 0.08 },
  // --- Hydrogen ---
  "2804": { direct: 10.4, indirect: 0.0 }, // 2804 10 00 Hydrogen
  // --- Aluminium ---
  "7601": { direct: 2.36, indirect: 8.14 }, // Unwrought aluminium
  "7603": { direct: 2.48, indirect: 8.4 },
  "7604": { direct: 2.31, indirect: 7.49 },
  "7605": { direct: 2.31, indirect: 7.49 },
  "7606": { direct: 2.86, indirect: 9.25 },
  "7607": { direct: 2.86, indirect: 9.25 },
  "7608": { direct: 2.73, indirect: 9.3 },
  "7609": { direct: 2.73, indirect: 9.3 },
};

export function cbamDefault(code: string): CbamDefault | undefined {
  return CBAM_DEFAULTS[code.slice(0, 4)];
}
export function cbamTotal(code: string): number | undefined {
  const d = cbamDefault(code);
  return d ? +(d.direct + d.indirect).toFixed(2) : undefined;
}
