import Link from "next/link";
import Logo from "./Logo";
import { NAV, BRAND } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="container-x grid gap-8 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
            A free, open CBAM toolkit — estimate your carbon border liability, check CN codes,
            score your readiness and build a report. Everything runs in your browser.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            📧 <a href={`mailto:${BRAND.email}`} className="hover:text-cyan-700">{BRAND.email}</a>
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">Tools</h4>
          <ul className="space-y-2.5 text-sm">
            {NAV.filter((n) => n.href !== "/about").map((l) => (
              <li key={l.href}><Link href={l.href} className="text-slate-600 hover:text-cyan-700">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">Project</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/about" className="text-slate-600 hover:text-cyan-700">About</Link></li>
            <li><Link href="/privacy" className="text-slate-600 hover:text-cyan-700">Privacy</Link></li>
            <li><Link href="/terms" className="text-slate-600 hover:text-cyan-700">Terms</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} EcoBorder. An independent CBAM estimation toolkit.</p>
          <p>Estimates only — not legal or financial advice.</p>
        </div>
      </div>
    </footer>
  );
}
