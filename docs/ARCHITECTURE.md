# EcoBorder — Technical Architecture (for slides)

Diagrams (drop straight into PPT):
- **`architecture-runtime.png`** — runtime / deployment architecture: how a user request is served, tier by tier (16:9) ← *the main technical architecture*
- `architecture-overview.png` — logical/code architecture: layers + tech stack (16:9)
- `architecture-dataflow.png` — data & calculation flow (16:9)

---

## Slide 0 — Runtime / Deployment Architecture (request flow)

**How a user request is served, tier by tier. There is no application server or database in the request path** — the app is statically generated and served from the edge, and all logic runs in the browser.

**Request path:**

1. **Tier 1 — Client:** the user opens `https://ecoborder.app` in any modern browser (desktop or mobile).
2. **① HTTPS GET (TLS 1.3) →**
3. **Tier 2 — Network & Edge (the "backend" in the path):** DNS resolves to the nearest **Vercel Edge** point-of-presence; TLS terminates; the **CDN** returns pre-built static assets (cache HIT). No origin server is invoked.
4. **② HTML · JS · CSS (cached assets) →**
5. **Tier 3 — Application runtime (in the browser):** assets load and **Next.js / React hydrate**. The five tool components, the **pure-TypeScript calculation engine**, and the **bundled official CBAM data** all execute here. State is kept in `localStorage`. **No further server round-trips.**
6. **③ generate in-browser →**
7. **Tier 4 — Outputs:** Excel (official CBAM template), CSV, JSON and Print are produced client-side and **downloaded to the user's device** — nothing is uploaded.

**Build & deploy (out of the request path):** Developer `git push` → **GitHub** → **Vercel CI/CD** runs `next build` → **SSG static export** → artifacts deployed to the **global Edge/CDN**.

**Why it's served this way:**
- Repeat navigations are instant **CDN cache hits** at the nearest edge — low latency worldwide.
- No servers to run, scale or secure in the live path → near-zero cost, effectively infinite scale.
- Sensitive emissions data **never leaves the browser** (privacy by design).

**Future / optional (dashed in the diagram, not in the current path):** API routes · Database (e.g. Supabase) · Authentication — would be added only if saved projects/accounts are required.

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
