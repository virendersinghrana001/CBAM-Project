import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { Section } from "@/components/ui";
import { CtaBand } from "@/components/blocks";
import EmissionsCalculator from "@/components/tools/EmissionsCalculator";

export const metadata: Metadata = {
  title: "Emissions Calculator",
  description:
    "Calculate the embedded emissions of your product from activity data — fuel combustion, process emissions and electricity — and get your tCO₂/tonne intensity for CBAM. Free, browser-based.",
};

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Free tool · runs in your browser"
        title="Emissions Calculator"
        subtitle="Start here. Turn your fuel use, process chemistry and electricity into embedded emissions and a tCO₂/tonne intensity — then carry it straight into the CBAM Tax Calculator."
      />
      <Section className="pt-12">
        <EmissionsCalculator />
      </Section>
      <CtaBand />
    </>
  );
}
