"use client";

import { useMemo, useState } from "react";
import { searchCatalog, type CnEntry } from "@/lib/cn-catalog";

export default function CnPicker({
  value,
  sector,
  onPick,
}: {
  value: string;
  sector?: string;
  onPick: (e: CnEntry) => void;
}) {
  const [q, setQ] = useState(value);
  const [open, setOpen] = useState(false);
  const results = useMemo(() => (open ? searchCatalog(q, sector, 40) : []), [q, sector, open]);

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search CN code or product…"
        className="inpc data-num"
      />
      {open && results.length > 0 && (
        <div className="absolute z-30 mt-1 max-h-64 w-[min(28rem,90vw)] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {results.map((e) => (
            <button
              key={e.code}
              type="button"
              onMouseDown={() => { onPick(e); setQ(e.code); setOpen(false); }}
              className="block w-full px-3 py-2 text-left hover:bg-cyan-50"
            >
              <span className="data-num text-sm font-semibold text-cyan-700">{e.code}</span>
              <span className="ml-2 text-xs text-slate-500">{e.category}</span>
              <span className="block truncate text-xs text-slate-500">{e.name}</span>
            </button>
          ))}
        </div>
      )}
      <style>{`
        .inpc { width:100%; border-radius:0.5rem; border:1px solid #cbd5e1; padding:0.5rem 0.65rem; font-size:0.875rem; outline:none; background:#fff; }
        .inpc:focus { border-color:#06b6d4; box-shadow:0 0 0 3px rgba(8,145,178,0.15); }
      `}</style>
    </div>
  );
}
