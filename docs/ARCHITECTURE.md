# EcoBorder — Technical Architecture (for slides)

Diagrams (drop straight into PPT):
- `architecture-overview.png` — layered architecture + tech stack (16:9)
- `architecture-dataflow.png` — data & calculation flow (16:9)

---

## Slide 1 — Architecture at a glance

**One line:** A client-side, statically-generated, privacy-by-design CBAM toolkit — **no backend, no database, no auth**. Everything runs in the browser.

**Five layers (top → bottom):**

1. **Presentation (UI)** — Next.js App Router pages (Home, tool pages, About, legal) + shared components (Header, Footer, PageHero, Tilt, blocks, ui) + a 3D/glass design system (aurora, glass, tilt tokens in `globals.css`).
2. **Application / Tools** — 5 interactive client components: `EmissionsCalculator`, `CbamCalculator`, `CnCodeChecker`, `ReadinessQuiz`, `CommunicationBuilder` (+ `CnPicker`).
3. **Calculation engine** — pure TypeScript domain logic in `src/lib`: `communication.ts` (SEE resolver), `cbam.ts` (phase-in factor + precursor library), `cbam-routes.ts` (routes + category SEE), `emissions.ts` (fuel/grid factors), `cbam-xlsx.ts` (Excel export).
4. **Data (bundled, static)** — official EU datasets compiled into the app: `cbam-defaults.ts` (EU default values, 22 Dec 2023), `cn-catalog.ts` (749 official CN codes), production routes & precursor relationships. Inter-tool state via `localStorage`. **No runtime database.**
5. **Build & delivery** — GitHub (source) → Vercel CI → Next.js **SSG build** → static export served from a **global CDN/edge**. Outputs generated client-side: XLSX, CSV, JSON, Print.

**Tech stack:** Next.js 16 · React 19 · TypeScript · Tailwind v4 · SheetJS (xlsx) · Vercel.

**Principles:** Tools-first / ungated · Privacy by design · CBAM = single source of truth · Official data.

---

## Slide 2 — Data & calculation flow

**Pipeline:** `Activity data → Embedded emissions → Emission intensity → CBAM tax → Official communication`

| Stage | Inputs | Outputs |
|-------|--------|---------|
| **Emissions Calculator** | CN code, production, fuels, precursors, process, heat/waste-gas, electricity | SEE direct & indirect, intensity (tCO₂e/t) |
| **Tax Calculator** | intensity, volume, reporting year, origin price | chargeable, relief, **net liability (€)** |
| **Communication Builder** | installation, processes, precursors, products | SEE per product → **official Excel template** |

**Hand-offs (client-side state, nothing leaves the browser):**
- Emissions → Tax Calculator via `eb_prefill`
- Emissions → Communication Builder via `eb_process`

**Calculation engine (core formulas):**
- `SEE = attributed emissions ÷ production` (direct & indirect split, 2 dp)
- `net tax = embedded × ETS price × CBAM_factor(year) − origin credit`
- Precursors cascade into the consuming product (internal chains resolved recursively).

**Supporting tools:** CN Code Checker (749 codes → category + default factors), Readiness Check (score + actions).

**Data sources bundled at build time:** EU default values (Dec 2023), 749-code CN catalogue, production routes & precursor relationships (template V2, 2024).

---

## Why this architecture (talking points)

- **Privacy & trust:** all computation is local — no user data is transmitted or stored, which is a strong selling point for sensitive emissions data.
- **Cost & scale:** static export on a CDN means near-zero hosting cost and effectively infinite scale; no servers to run or secure.
- **Speed:** pre-rendered pages + in-browser math = instant results, no API latency.
- **Maintainability:** official data lives in versioned TypeScript modules with citations; the calculation engine is pure functions, easy to test and audit.
- **Correctness:** the engine reproduces the official EU steel example exactly (SEE 1.54 / 0.20 / 1.74).
- **Extensibility roadmap:** optional backend later for saved projects/accounts; official registry **XML (XSD-validated)** export; country-specific 2026 default values (IR 2025/2621).
