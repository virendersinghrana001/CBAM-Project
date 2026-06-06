import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/ui";
import { CtaBand } from "@/components/blocks";
import { CAPABILITIES, BRAND } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "EcoBorder is a free, independent CBAM toolkit. Learn what it does, how it estimates, and what it deliberately doesn't do.",
};

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="A free, independent CBAM toolkit"
        subtitle="EcoBorder exists to make the EU Carbon Border Adjustment Mechanism easier to reason about — through tools anyone can use, not a sales funnel."
      />

      <Section>
        <div className="mx-auto max-w-3xl space-y-6 text-lg leading-relaxed text-slate-600">
          <p>
            CBAM introduced a wall of new concepts for exporters — CN codes, embedded emissions,
            default factors, free-allocation phase-outs, quarterly declarations. Understanding your
            likely exposure shouldn&apos;t require booking a consultation.
          </p>
          <p>
            So EcoBorder is built the other way around: the useful parts are the product. The
            calculator, CN code checker, readiness check and report builder all run in your browser,
            show their full results, and let you export everything. Nothing you type is sent anywhere.
          </p>
          <p>
            It&apos;s an <strong>estimation and planning toolkit</strong> — a fast way to get oriented,
            sanity-check a number, or prepare a draft. It is not a substitute for the official EU CBAM
            regulation, and the figures it produces are indicative.
          </p>
        </div>
      </Section>

      <Section className="bg-slate-50">
        <SectionHeading center eyebrow="What's inside" title="The tools" className="mx-auto" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((c) => (
            <Link key={c.href} href={c.href} className="rounded-2xl border border-slate-200 bg-white p-6 card-shadow transition-transform hover:-translate-y-1">
              <span className="text-2xl">{c.icon}</span>
              <h3 className="mt-3 font-bold text-slate-900">{c.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{c.desc}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center card-shadow">
          <h2 className="text-xl font-bold text-slate-900">A note on accuracy</h2>
          <p className="mt-3 text-slate-600">
            Default emission factors approximate the EU transitional default values and are provided
            for estimation. For real filings, use your own verified, installation-specific data and
            confirm obligations against official EU guidance. Questions or feedback?{" "}
            <a href={`mailto:${BRAND.email}`} className="font-semibold text-cyan-700 hover:underline">{BRAND.email}</a>.
          </p>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
