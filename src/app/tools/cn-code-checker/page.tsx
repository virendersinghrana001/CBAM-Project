import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { Section } from "@/components/ui";
import { CtaBand } from "@/components/blocks";
import CnCodeChecker from "@/components/tools/CnCodeChecker";

export const metadata: Metadata = {
  title: "CN Code Checker for CBAM",
  description:
    "Check whether your product is covered by EU CBAM. Search CN codes for steel, aluminium, cement, fertilisers and hydrogen, with default emission factors.",
};

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Free tool · runs in your browser"
        title="CN Code Checker"
        subtitle="Search all 749 CBAM-covered CN codes from the official EU template — exact code, name and aggregated goods category — with default emission factors and an instant cost estimate."
      />
      <Section className="pt-12">
        <CnCodeChecker />
      </Section>
      <CtaBand />
    </>
  );
}
