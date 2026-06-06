import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { Section } from "@/components/ui";
import CommunicationBuilder from "@/components/tools/CommunicationBuilder";

export const metadata: Metadata = {
  title: "CBAM Communication Builder",
  description:
    "Build the official EU CBAM SEE communication for installations: installation details, production processes, purchased precursors and per-product specific embedded emissions — exported in the official template structure (Excel).",
};

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Free tool · runs in your browser"
        title="CBAM Communication Builder"
        subtitle="Fill the official EU installation communication step by step — installation, production processes (SEE), purchased precursors and products with CN codes & properties — and export it in the official template structure."
      />
      <Section className="pt-10">
        <CommunicationBuilder />
      </Section>
    </>
  );
}
