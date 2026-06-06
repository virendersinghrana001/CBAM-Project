import type { ReactNode } from "react";

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden aurora border-b border-slate-100">
      <div className="dot-grid absolute inset-0 opacity-50" />
      <div className="orb orb-cyan -left-16 -top-10 h-56 w-56 opacity-40" />
      <div className="orb orb-lime right-0 top-0 h-52 w-52 opacity-30" />
      <div className="container-x relative py-16 text-center sm:py-20">
        {eyebrow && (
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs font-semibold text-cyan-700 shadow-sm">
              {eyebrow}
            </span>
          </div>
        )}
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          {title}
        </h1>
        {subtitle && <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">{subtitle}</p>}
        {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
      </div>
    </section>
  );
}
