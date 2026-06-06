import type { Metadata } from "next";
import { Section } from "@/components/ui";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy", description: "How EcoBorder collects, uses and protects your data." };

export default function Page() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl prose-slate">
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
        <div className="mt-8 space-y-6 text-slate-600 leading-relaxed">
          <Para title="1. Who we are">
            EcoBorder (&quot;we&quot;, &quot;us&quot;) provides CBAM reporting and compliance services. You can reach us at {BRAND.email}.
          </Para>
          <Para title="2. Data we collect">
            We collect only what you actively send us, such as an email to our address. The inputs you type into the tools stay on your device. We may collect basic, anonymised page analytics.
          </Para>
          <Para title="3. How we use it">
            The CBAM tools run entirely in your browser — the figures you enter into the calculator, CN code checker, readiness check and report builder are processed locally and are not transmitted to or stored by us. We use any email you choose to send us only to respond to you. We never sell your data.
          </Para>
          <Para title="4. Legal basis">
            We process your data on the basis of your consent and our legitimate interest in providing the services you request. You can withdraw consent at any time.
          </Para>
          <Para title="5. Storage & security">
            Your data is stored on secure, access-controlled infrastructure aligned with ISO 27001 practices. We retain enquiry data only as long as necessary to serve you.
          </Para>
          <Para title="6. Your rights">
            You may request access to, correction of, or deletion of your personal data, and object to processing, by emailing {BRAND.email}.
          </Para>
          <Para title="7. Contact">
            Questions about this policy? Email {BRAND.email}.
          </Para>
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
