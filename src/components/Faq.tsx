"use client";

import { useState } from "react";
import type { Faq as FaqType } from "@/lib/site";

export default function Faq({ items }: { items: FaqType[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            aria-expanded={open === i}
          >
            <span className="font-semibold text-slate-900">{item.q}</span>
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600 transition-transform ${
                open === i ? "rotate-45" : ""
              }`}
            >
              +
            </span>
          </button>
          {open === i && (
            <div className="px-6 pb-6 -mt-1 text-slate-600 leading-relaxed animate-fade-up">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
