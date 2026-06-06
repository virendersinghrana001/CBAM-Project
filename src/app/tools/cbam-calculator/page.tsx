import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { Section } from "@/components/ui";
import { CtaBand } from "@/components/blocks";
import CbamCalculator from "@/components/tools/CbamCalculator";

export const metadata: Metadata = {
  title: "Free CBAM Tax Calculator",
  description:
    "Estimate your EU CBAM carbon tax exposure in seconds. Adjust volume, emission intensity and origin carbon price to see your liability — and how much EcoBorder can save you.",
};

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Free tool · runs in your browser"
        title="CBAM Tax Calculator"
        subtitle="Model your CBAM liability across as many product lines as you like, apply origin-price and free-allocation credits, and export the full breakdown. No signup, nothing leaves your browser."
      />
      <Section className="pt-12">
        <CbamCalculator />
      </Section>
      <CtaBand />
    </>
  );
}
