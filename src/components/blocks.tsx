import Link from "next/link";
import { CAPABILITIES } from "@/lib/site";

export function CtaBand() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[2rem] aurora-dark px-8 py-12 text-white elevate sm:px-12">
          <div className="hero-grid absolute inset-0 opacity-30" />
          <div className="orb orb-cyan -right-10 -top-10 h-52 w-52 pulse-glow" />
          <div className="orb orb-lime -bottom-12 left-1/4 h-48 w-48 pulse-glow" style={{ animationDelay: "-3s" }} />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">Explore the rest of the toolkit</h2>
              <p className="mt-3 max-w-xl text-cyan-50/80">
                Every tool is free, runs in your browser and needs no signup. Jump to whichever one helps next.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CAPABILITIES.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="group flex items-center gap-2 rounded-xl glass-dark px-4 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:bg-white/15"
                >
                  <span className="text-lg transition-transform group-hover:scale-110">{c.icon}</span> {c.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
