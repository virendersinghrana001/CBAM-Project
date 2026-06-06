// ---------------------------------------------------------------------------
// EcoBorder — a free, tools-first CBAM toolkit. Content is original; no third
// party contact details, client names or accreditation claims are used.
// ---------------------------------------------------------------------------

export const BRAND = {
  name: "EcoBorder",
  tagline: "The free CBAM toolkit",
  domain: "ecoborder.app",
  email: "hello@ecoborder.app",
  // No phone / office / personal contact details are copied from any source.
  socials: {
    github: "#",
    linkedin: "#",
    x: "#",
  },
};

export const NAV = [
  { label: "Emissions", href: "/tools/emissions-calculator" },
  { label: "Tax Calculator", href: "/tools/cbam-calculator" },
  { label: "CN Codes", href: "/tools/cn-code-checker" },
  { label: "Readiness", href: "/cbam-readiness" },
  { label: "Communication Builder", href: "/tools/report-builder" },
  { label: "About", href: "/about" },
];

export type Sector = {
  slug: string;
  name: string;
  short: string;
  icon: string;
  cnCodes: string[];
  defaultIntensity: number; // tCO2 per tonne of product (indicative default)
};

// Used by the calculator, CN checker and report builder.
export const SECTORS: Sector[] = [
  // defaultIntensity = official transitional total (direct+indirect) for a representative CN heading.
  { slug: "iron-steel", name: "Iron & Steel", icon: "🏭", short: "Flat & long steel, tubes and structures.", cnCodes: ["7208", "7209", "7210", "7214", "7216", "7301", "7304", "7306"], defaultIntensity: 2.28 },
  { slug: "aluminium", name: "Aluminium", icon: "🔩", short: "Primary and downstream aluminium products.", cnCodes: ["7601", "7603", "7604", "7605", "7606", "7607", "7608", "7609"], defaultIntensity: 10.49 },
  { slug: "cement", name: "Cement", icon: "🧱", short: "Clinker, cement and related binders.", cnCodes: ["2523", "2507"], defaultIntensity: 0.87 },
  { slug: "fertilisers", name: "Fertilisers", icon: "🌾", short: "Nitrogen fertilisers, ammonia and nitric acid.", cnCodes: ["3102", "3105", "2814", "2808"], defaultIntensity: 1.9 },
  { slug: "hydrogen", name: "Hydrogen", icon: "⚛️", short: "Hydrogen and related non-metals.", cnCodes: ["2804"], defaultIntensity: 10.4 },
  { slug: "electricity", name: "Electricity", icon: "⚡", short: "Imported electrical energy.", cnCodes: ["2716"], defaultIntensity: 0.45 },
];

// What the toolkit does (tools, not consulting services).
export const CAPABILITIES = [
  { icon: "🌫️", title: "Emissions Calculator", desc: "Start here. Turn fuel use, process chemistry and electricity into embedded emissions and a tCO₂/tonne intensity.", href: "/tools/emissions-calculator", cta: "Calculate emissions" },
  { icon: "🧮", title: "Tax Calculator", desc: "Carry your intensity in and model CBAM liability across multiple product lines with origin-price and free-allocation credits. Export the result.", href: "/tools/cbam-calculator", cta: "Open calculator" },
  { icon: "🔎", title: "CN Code Checker", desc: "Search the CBAM-covered CN codes, see default emission factors and an instant cost estimate per code.", href: "/tools/cn-code-checker", cta: "Search CN codes" },
  { icon: "📋", title: "Readiness Check", desc: "Score your CBAM readiness in 2 minutes and get a concrete, prioritised action list — no email required.", href: "/cbam-readiness", cta: "Check readiness" },
  { icon: "📄", title: "Communication Builder", desc: "Fill the official EU installation SEE communication — installation, processes, precursors and per-product emissions — and export it in the official template structure (Excel).", href: "/tools/report-builder", cta: "Build the communication" },
];

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  { q: "What is CBAM?", a: "The EU Carbon Border Adjustment Mechanism is a carbon tariff on imports of carbon-intensive goods — iron & steel, aluminium, cement, fertilisers, hydrogen and electricity. Importers report the embedded emissions of these goods and, in the definitive regime, surrender certificates that cover them." },
  { q: "How does the calculator estimate my liability?", a: "It multiplies your product volume by an emission intensity (a sector default you can override) to get embedded tCO₂, values it at a reference EU ETS price, then subtracts any carbon price already paid at origin and the transitional free-allocation factor. Everything runs in your browser." },
  { q: "Are the emission factors official?", a: "The CN-code default values (direct + indirect tCO₂/t) in the CN Code Checker and Report Builder are the official EU Commission transitional-period default values (published 22 December 2023). The activity-data factors in the Emissions Calculator (fuels, grid electricity) are indicative IPCC/IEA-style values. From 2026 the definitive regime uses country-specific defaults (IR 2025/2621) — always confirm against current EU guidance and use verified installation data for actual filings." },
  { q: "Do I need to sign up or share data to use the tools?", a: "No. Every tool is free and runs entirely client-side — nothing you enter is sent to a server or required to see your full results. You can export your results locally." },
  { q: "Does it handle purchased precursors?", a: "Yes. The Emissions Calculator and Report Builder let you add purchased precursors (pig iron, alumina, clinker, ammonia, etc.) with their specific embedded emissions, which cascade into the finished good's total — the way CBAM requires for complex goods." },
  { q: "What is the CBAM factor in the calculator?", a: "It's the share of embedded emissions for which certificates must be surrendered as EU free allocation is phased out — 2.5% in 2026 rising to 100% by 2034. Pick your reporting year and the calculator applies it automatically; later-year values remain subject to EU confirmation and are editable." },
  { q: "Is this legal or financial advice?", a: "No. EcoBorder is an estimation toolkit for planning and education. The CBAM report export uses a CBAM-aligned structure — validate it against the official EU registry XSD before any real submission, and confirm obligations against the official regulation." },
];

// Default EU ETS reference price (€/tCO2) used by the tools.
export const CBAM_PRICE_EUR = 82;
