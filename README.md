# EcoBorder — The free CBAM toolkit

A **tools-first**, browser-based toolkit for the EU Carbon Border Adjustment
Mechanism (CBAM). The product *is* the tools: every calculation runs client-side,
shows its full results, and is exportable — no signup, no consulting gate, no data
leaving the browser. Original branding and content (not a copy of any third-party
site's details). Built with **Next.js 16 (App Router) + Tailwind v4**.

🔗 **Live:** https://ecoborder.vercel.app

## The four tools (all fully functional, ungated)

| Tool | Route | What it does |
|------|-------|--------------|
| **CBAM Tax Calculator** | `/tools/cbam-calculator` | Multi-line liability model — volume × emission intensity, origin-price & free-allocation credits, per-line + total breakdown, liability-by-line chart, quarterly cost, **CSV/JSON export**. |
| **CN Code Checker** | `/tools/cn-code-checker` | Searchable/filterable CBAM CN-code database with default emission factors and an instant per-tonne + 1,000 t cost estimate in a detail panel. |
| **Readiness Check** | `/cbam-readiness` | 5-question scored assessment with a score gauge and a **prioritised action list shown free** (no email gate). |
| **CBAM Communication Builder** | `/tools/report-builder` | Multi-step build of the official EU **installation SEE communication**: installation details → production processes (SEE = attributed emissions ÷ production) → purchased precursors (cascaded) → products (official CN code + sector properties + carbon price). Exports an **Excel workbook mirroring the official template** (Installation / Summary_Products / Communication tabs) + JSON. |

Plus a minimal marketing surface: tools-first homepage, About, Privacy, Terms.
Covers all six CBAM categories: steel, aluminium, cement, fertilisers, hydrogen, electricity.

## Architecture

- **100% client-side** — no backend, no database, no environment variables required.
  Nothing a user types is transmitted. (Earlier Supabase wiring was removed in the
  tools-first rework.)
- New brand identity: cyan/teal + navy "data" aesthetic, distinct from the source site.

## Develop & deploy
```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build (all static)
vercel --prod --yes
```

## Data sources

- **CN-code default values** (`src/lib/cbam-defaults.ts`) — the **official** EU Commission
  *"Default values for the transitional period of the CBAM"* (22 Dec 2023), direct + indirect
  tCO₂e/t per CN heading. Used by the CN Code Checker, Communication Builder and sector defaults.
- **Full CN catalog** (`src/lib/cn-catalog.ts`) — all **749 CBAM CN codes** with official CN
  names and aggregated goods categories, parsed from the official *"CBAM Communication template
  for installations"* (V2, 2024-12-13). Powers the CN Code Checker and Communication Builder.
- **Excel export** uses SheetJS (`xlsx`); workbook structure in `src/lib/cbam-xlsx.ts` mirrors the
  template's Installation, Summary_Products and Communication tabs.
- **CBAM phase-in factor** (`src/lib/cbam.ts`) — free-allocation phase-out schedule (2.5% 2026 → 100% 2034).
- **Activity-data factors** (`src/lib/emissions.ts`) — indicative IPCC/IEA-style fuel & grid factors.
- From 2026 the definitive regime uses **country-specific** defaults (IR 2025/2621) — not yet encoded.

> Estimates only — not legal or financial advice. The CBAM XML export is CBAM-aligned in
> structure; validate against the official EU registry XSD before any real submission, and use
> verified installation-specific data for filings.
