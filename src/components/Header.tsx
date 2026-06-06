"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { NAV } from "@/lib/site";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled ? "border-b border-slate-200 bg-white/85 backdrop-blur" : "border-b border-transparent bg-white"
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-cyan-50 text-cyan-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/tools/cbam-calculator"
            className="rounded-full bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700"
          >
            Open the Calculator
          </Link>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-slate-700 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <div className="container-x space-y-1 py-3">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 font-medium text-slate-800 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/tools/cbam-calculator"
              className="mt-2 block rounded-full bg-cyan-600 px-5 py-3 text-center font-semibold text-white"
            >
              Open the Calculator
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
