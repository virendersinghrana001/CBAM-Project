import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { Section } from "@/components/ui";
import { CtaBand } from "@/components/blocks";
import ReadinessQuiz from "@/components/tools/ReadinessQuiz";

export const metadata: Metadata = {
  title: "CBAM Readiness Check",
  description:
    "Take the 5-question CBAM readiness assessment and get a personalised score plus an action plan to close your compliance gaps.",
};

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="2-minute assessment · no email required"
        title="Check Your CBAM Readiness"
        subtitle="Answer 5 quick questions to get your readiness score and a prioritised action list — shown instantly, free, no signup."
      />
      <Section className="pt-12">
        <ReadinessQuiz />
      </Section>
      <CtaBand />
    </>
  );
}
