# EcoBorder — The Free CBAM Toolkit
## Product & Technical Documentation

**Live:** https://ecoborder.vercel.app · **Status:** Production · CBAM-aligned estimation toolkit

> A polished Word version of this document is at
> [`EcoBorder_CBAM_Toolkit_Documentation.docx`](./EcoBorder_CBAM_Toolkit_Documentation.docx).

---

## 1. Overview

EcoBorder is a free, browser-based toolkit for the EU **Carbon Border Adjustment Mechanism (CBAM)**. It helps exporters and importers calculate embedded emissions, estimate the carbon-border tax, look up CN codes, assess readiness, and assemble the official installation emissions communication.

Every tool runs **entirely in the browser** — no signup, and nothing entered is sent to a server. The product is deliberately **tools-first**: functionality is open and ungated.

**Baseline principle:** CBAM is the single source of truth — all inputs, factors, vocabularies and outputs are anchored to the official EU CBAM regulation, default values, CN code list, production routes and the SEE communication template.

### Tool suite

| Tool | What it does | Primary output |
|------|--------------|----------------|
| Emissions Calculator | Bottom-up embedded emissions from activity data | SEE direct/indirect, intensity (tCO₂e/t) |
| CBAM Tax Calculator | Carbon-border liability across product lines | Net liability (€), breakdown, CSV/JSON |
| CN Code Checker | Search the official CBAM CN code list | Code, name, category, default factors, cost |
| Readiness Check | Self-assessment of CBAM preparedness | Score (%) + prioritised action list |
| Communication Builder | Official installation SEE communication | Excel template + JSON |

---

## 2. Requirements and how they were incorporated

| Requirement | How it was incorporated |
|-------------|-------------------------|
| Rebrand & deploy a CBAM web app | Original **EcoBorder** brand; deployed live |
| No copied third-party contacts/content | All phone/email/clients/testimonials/certs removed; original copy |
| Tools fully functional, not gated | Full results shown and exportable; no email walls |
| Minimal tools-first site, distinct look | Lean marketing; cyan/teal + navy "data" identity |
| Calculate emissions before tax | Dedicated Emissions Calculator feeds the Tax Calculator |
| Use exact / official numbers | EU transitional default values (22 Dec 2023) + 749-code CN catalogue |
| Reporting period | Annual basis; reporting year drives the CBAM factor |
| Purchased precursor calculation | Country/route/quantity/SEE, cascaded into the product |
| Internal vs purchased precursors | Internal precursors modelled as linked processes + bubble approach |
| Production routes as options | Official route vocabulary per category (BF-BOF, EAF, …) |
| Process-wise emissions | Fuel + process + heat + waste-gas + indirect + elec export per process |
| SEE direct vs indirect | Computed and shown separately throughout |
| Installation & product details | Full installation (+verifier) and per-product CN/properties/carbon price |
| Exportable CBAM template | Excel mirroring Installation / Summary_Products / Communication |
| CN code → product → precursor | CN code sets category and auto-lists relevant precursors |
| Remove reporting quarter | Emissions Calculator uses year only |
| Verify the 0.25 process multiplier | Replaced; process emissions are explicit, factor only as labelled estimate |
| Two-decimal accuracy | All emission figures to 2 dp |
| Map Emissions → Communication Builder | Header parity + "Send to Communication Builder" hand-off |
| Carbon-tax threshold logic | Taxable = embedded × CBAM factor; exempt = free allocation (1 − factor) |
| Next-level UI/UX, 3D | Aurora, glassmorphism, 3D-tilt, glow and depth |
| Validate vs filled steel example | Reproduces the official example exactly; "Load steel example" button |

---

## 3. Architecture & data flow

```
Activity data → Embedded emissions → Emission intensity → CBAM tax → Official communication
```

Client-side hand-offs (nothing sent to a server):
- **Emissions Calculator → Tax Calculator:** intensity, product, sector, tonnes, year prefill a tax line.
- **Emissions Calculator → Communication Builder:** a full production process + product are created automatically.

---

## 4. Tools — inputs, calculations, outputs

### 4.1 Emissions Calculator
**Purpose:** bottom-up embedded emissions and SEE intensity from activity data.

**Inputs:** CN code (drives category + relevant precursors), product, sector, category, production route, annual production (t), reporting year; fuels (qty × factor); CN-derived precursor inputs (amount × category SEE); explicit process emissions; measurable heat & waste-gas import/export; electricity (MWh × EF) − export.

**Calculation:**
```
fuelDirect   = Σ (fuel quantity × fuel EF)
precDirect   = Σ (precursor amount × precursor SEE_direct)
precIndirect = Σ (precursor amount × precursor SEE_indirect)
heatAdj      = (heat imported − heat exported) × heat EF
wasteGasAdj  = (WG imported − WG exported) × WG EF
ownDirect    = fuelDirect + processEmissions + heatAdj + wasteGasAdj
direct       = ownDirect + precDirect
ownIndirect  = (electricity MWh × grid EF) − (exported MWh × export EF)
indirect     = ownIndirect + precIndirect
SEE direct   = direct ÷ production       SEE indirect = indirect ÷ production
intensity    = (direct + indirect) ÷ production           (2 dp)
```
**Double-count protection:** fuels = combustion at your installation; a precursor's factor already includes its own energy — kept separate with an on-screen warning.
**Process emissions:** explicit measured input (separate from fuels & precursors, per the CBAM template); indicative sector estimate offered but clearly labelled.

**Outputs:** SEE direct/indirect, total, intensity, indicative cost (2 dp); "Use in Tax Calculator", "Send to Communication Builder", JSON.

### 4.2 CBAM Tax Calculator
**Inputs:** reporting year (→ CBAM factor), ETS price (€82 default); per line: product, sector, volume, intensity, origin carbon price.

**Calculation:**
```
embedded     = volume × intensity
factor       = CBAM phase-in factor for the year   (taxable share)
chargeable   = embedded × factor
gross        = embedded × ETS price
freeRelief   = gross × (1 − factor)                (exempt: free allocation)
originCredit = chargeable × min(origin price, ETS price)
net          = max(gross − freeRelief − originCredit, 0)
quarterly    = net ÷ 4
```
**Threshold logic:** no quantity threshold — taxable = embedded × CBAM factor; exempt = free allocation (1 − factor); origin carbon price credited.

**Outputs:** per-line embedded/chargeable/relief/net, chart, total, quarterly; CSV/JSON.

**CBAM phase-in factor schedule:**

| Year | CBAM factor (taxable) | Free allocation (exempt) |
|------|----------------------|--------------------------|
| 2026 | 2.5% | 97.5% |
| 2027 | 5% | 95% |
| 2028 | 10% | 90% |
| 2029 | 22.5% | 77.5% |
| 2030 | 28.5% | 71.5% |
| 2031 | 48.75% | 51.25% |
| 2032 | 63.75% | 36.25% |
| 2033 | 86% | 14% |
| 2034 | 100% | 0% |

_Later-year values remain subject to EU confirmation and are editable._

### 4.3 CN Code Checker
**Inputs:** search (code/name/category) + sector filter.
**Data:** 749 official CBAM CN codes (code, name, aggregated category) with official transitional direct/indirect default factors.
```
cost per tonne = (direct + indirect) × €82      annual = factor × 1,000 t × €82
```
Electricity flagged as country-specific (IEA), not a single tCO₂/t default.
**Outputs:** filtered list + detail panel (category, factors, cost, link to Tax Calculator).

### 4.4 Readiness Check
**Inputs/scoring:** 5 questions, each 0–2.
```
score% = (Σ answers ÷ 10) × 100
```
Tiers: ≥75% Ready, 40–74% Getting There, <40% At Risk.
**Outputs:** score gauge + prioritised action list (free, no email).

### 4.5 CBAM Communication Builder
**Purpose:** assemble the official installation SEE communication and export it in template structure.

**Inputs (5 steps):** (1) Installation incl. verifier & accreditation, annual period; (2) Production processes — category, official route, production, directly attributable emissions, heat & waste-gas import/export, electricity & export, internal precursors; (3) Purchased precursors; (4) Products — official CN code, properties, carbon price, SEE; (5) Export.

**Calculation (SEE resolver):**
```
ownDirect(process)   = directEmissions + heatAdj + wasteGasAdj
ownIndirect(process) = (electricity × EF) − (exported × EF)
direct   = ownDirect   + Σ purchased(qty × SEE_direct)   + Σ internal(qty × upstreamSEE_direct)
indirect = ownIndirect + Σ purchased(qty × SEE_indirect) + Σ internal(qty × upstreamSEE_indirect)
SEE direct = direct ÷ production      SEE indirect = indirect ÷ production
```
Internal precursor chains (sintered ore → pig iron → crude steel → products) resolved recursively with a cycle guard. Effective carbon price = max(CP due − rebate, 0).

**Outputs:** Excel workbook (Installation incl. verifier & totals; Summary_Products with CN/name/SEE/route/properties/carbon price; Communication summary); JSON; print; "Load steel example".

---

## 5. Data sources & accuracy

| Data | Source | Status |
|------|--------|--------|
| CN-code default factors (direct/indirect) | EU Commission "Default values for the transitional period of the CBAM", 22 Dec 2023 | Official |
| 749 CN codes / names / categories | Official EU CBAM Communication template for installations (V2, 2024) | Official |
| Production routes & precursor relationships | Same template (Parameters) | Official |
| CBAM phase-in factor | EU free-allocation phase-out (2.5% 2026 → 100% 2034) | Official (later years TBC) |
| Fuel & grid factors (Emissions Calculator) | IPCC/IEA-style reference values | Indicative |
| EU ETS reference price (€82/tCO₂) | Reference for valuation | Editable assumption |

Definitive-regime (2026+) country-specific defaults (IR (EU) 2025/2621) are not yet encoded; transitional EU-wide values are used.

---

## 6. Validation

Validated against the official filled example *CBAM SEE V2.1 — Example Steel 1 (Blast furnace)* (4,800,000 t; 7,866,044 tCO₂e direct; 12,800 TJ waste-gas exported; 1,658,844 MWh × 0.589):

| Result | EcoBorder | Official workbook |
|--------|-----------|-------------------|
| SEE direct | 1.54 (1.5390) | 1.53898 |
| SEE indirect | 0.20 (0.2036) | 0.20355 |
| SEE total | 1.74 (1.7425) | 1.74253 |

Figures match exactly; displayed to 2 dp per requirement.

---

## 7. UX & design
Distinct cyan/teal + navy identity; animated aurora backgrounds; glassmorphism; mouse-tracking 3D-tilt cards; gradient glow and depth; reduced-motion respected. Tool interiors are clean and form-focused with live results, charts and exports.

---

## 8. Scope & caveats
- Estimation and planning toolkit — **not** legal/financial/compliance advice.
- CN-code default values are official; fuel/grid factors are indicative.
- The Excel mirrors the official template's structure/columns (clean workbook), not the protected original with formulas — validate against the current EU template/registry before submission.
- A submittable registry XML still requires the official EU XSD (future step).

_© EcoBorder — independent CBAM estimation toolkit. CBAM remains the baseline for all input and output logic._
