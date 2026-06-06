import * as XLSX from "xlsx";
import {
  type CommunicationData,
  totals,
  effectiveCp,
  PROPERTY_FIELDS,
} from "./communication";

function processName(data: CommunicationData, id: number | null) {
  const p = data.processes.find((x) => x.id === id);
  return p ? p.name || `Process ${p.id}` : "—";
}

function r2(n: number) {
  return Math.round(n * 1000) / 1000;
}

/** Build a workbook mirroring the official CBAM communication template tabs. */
export function buildWorkbook(data: CommunicationData): XLSX.WorkBook {
  const { installation: inst } = data;
  const t = totals(data);
  const wb = XLSX.utils.book_new();

  // ---- Installation tab -------------------------------------------------
  const instRows: (string | number)[][] = [
    ["CBAM SEE Communication — Installation details"],
    [],
    ["Reporting period start", inst.periodStart],
    ["Reporting period end", inst.periodEnd],
    [],
    ["Name of the installation (local)", inst.nameLocal],
    ["Name of the installation (English)", inst.nameEn],
    ["Street, Number", inst.street],
    ["Economic activity", inst.economicActivity],
    ["Post code", inst.postcode],
    ["P.O. Box", inst.poBox],
    ["City", inst.city],
    ["Country", inst.country],
    ["UNLOCODE", inst.unlocode],
    ["Coordinates — latitude", inst.lat],
    ["Coordinates — longitude", inst.lng],
    ["Authorised representative", inst.repName],
    ["Email", inst.repEmail],
    ["Telephone", inst.repPhone],
    [],
    ["Verifier — company name", inst.verifierName],
    ["Verifier — street", inst.verifierStreet],
    ["Verifier — city", inst.verifierCity],
    ["Verifier — postcode", inst.verifierPostcode],
    ["Verifier — country", inst.verifierCountry],
    ["Verifier — representative", inst.verifierRepName],
    ["Verifier — email", inst.verifierEmail],
    ["Accreditation member state", inst.accredMemberState],
    ["National accreditation body", inst.accredBody],
    ["Accreditation registration number", inst.accredRegNo],
    [],
    ["Total direct emissions (tCO2e)", r2(t.direct)],
    ["Total indirect emissions (tCO2e)", r2(t.indirect)],
    ["Total emissions (tCO2e)", r2(t.total)],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(instRows), "Installation");

  // ---- Summary_Products tab --------------------------------------------
  const header = [
    "Production process from which the products arise",
    "Production route",
    "Type of aggregated good or precursor",
    "CN Code",
    "CN Name",
    "Product name (for communication / invoices)",
    "SEE (direct) tCO2e/t",
    "SEE (indirect) tCO2e/t",
    "SEE (total) tCO2e/t",
    "Unit",
    "Share of emissions by default value (%)",
    "Source for electricity EF",
    "Embedded electricity (MWh/t)",
    "Electricity EF (tCO2/MWh)",
    "Product properties",
    "Carbon price instrument",
    "Currency",
    "CP due (per t)",
    "Rebate (per t)",
    "Effective CP due (per t)",
  ];
  const prodRows = data.products.map((p) => {
    const fields = PROPERTY_FIELDS[p.sector || data.processes.find((x) => x.id === p.processId)?.sector || ""] ?? [];
    const props = fields
      .map((f) => (p.props[f.key] !== undefined && p.props[f.key] !== "" ? `${f.label}: ${p.props[f.key]}` : null))
      .filter(Boolean)
      .join("; ");
    const proc = data.processes.find((x) => x.id === p.processId);
    return [
      processName(data, p.processId),
      proc?.route ?? "",
      p.type,
      p.cnCode,
      p.cnName,
      p.productName,
      r2(p.seeDirect),
      r2(p.seeIndirect),
      r2(p.seeDirect + p.seeIndirect),
      "tCO2e/t",
      p.shareDefault,
      p.elecEfSource,
      p.embeddedElecPerT,
      p.elecEf,
      props,
      p.cpInstrument,
      p.cpCurrency,
      p.cpDuePerT,
      p.rebatePerT,
      r2(effectiveCp(p)),
    ];
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([header, ...prodRows]), "Summary_Products");

  // ---- Communication tab (importer-facing) ------------------------------
  const commRows: (string | number)[][] = [
    ["Communication with reporting declarants"],
    [],
    ["Installation (English name)", inst.nameEn || inst.nameLocal],
    ["Country", inst.country],
    ["UNLOCODE", inst.unlocode],
    ["Reporting period", `${inst.periodStart} – ${inst.periodEnd}`],
    ["Total direct emissions (tCO2e)", r2(t.direct)],
    ["Total indirect emissions (tCO2e)", r2(t.indirect)],
    ["Total emissions (tCO2e)", r2(t.total)],
    [],
    ["CN Code", "Product name", "SEE direct", "SEE indirect", "SEE total", "Unit", "Effective CP due (per t)"],
    ...data.products.map((p) => [
      p.cnCode,
      p.productName || p.cnName,
      r2(p.seeDirect),
      r2(p.seeIndirect),
      r2(p.seeDirect + p.seeIndirect),
      "tCO2e/t",
      r2(effectiveCp(p)),
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(commRows), "Communication");

  return wb;
}

export function downloadXlsx(data: CommunicationData, filename = "cbam-communication.xlsx") {
  XLSX.writeFile(buildWorkbook(data), filename);
}
