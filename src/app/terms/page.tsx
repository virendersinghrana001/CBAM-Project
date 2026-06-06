import type { Metadata } from "next";
import { Section } from "@/components/ui";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = { title: "Terms & Conditions", description: "The terms governing your use of EcoBorder's website and services." };

export default function Page() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold text-slate-900">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
        <div className="mt-8 space-y-6 text-slate-600 leading-relaxed">
          <Para title="1. Acceptance">By accessing this website and using EcoBorder&apos;s services, you agree to these terms.</Para>
          <Para title="2. Services">EcoBorder provides CBAM advisory, carbon-accounting software and reporting services. Specific deliverables and fees are set out in your separate engagement agreement.</Para>
          <Para title="3. Estimates & tools">Our calculators and readiness checks provide indicative estimates only, based on default factors and the inputs you provide. They are not financial, legal or compliance advice and should not be solely relied upon for regulatory filings.</Para>
          <Para title="4. Your responsibilities">You are responsible for the accuracy of the data you provide. Final regulatory submissions remain your responsibility unless otherwise agreed in writing.</Para>
          <Para title="5. Intellectual property">All content, software and branding on this site are the property of EcoBorder and may not be reproduced without permission.</Para>
          <Para title="6. Limitation of liability">To the extent permitted by law, EcoBorder is not liable for indirect or consequential losses arising from use of this website or its free tools.</Para>
          <Para title="7. Contact">For questions about these terms, email {BRAND.email}.</Para>
        </div>
      </div>
    </Section>
  );
}

function Para({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-2">{children}</p>
    </section>
  );
}
