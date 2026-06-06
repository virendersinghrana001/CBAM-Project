import Link from "next/link";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl brand-gradient text-white shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
          <path d="M8 14.5C8 11 10 8.5 12.5 8.5M12.5 8.5l-2 .2M12.5 8.5l.2 2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="15.5" cy="15" r="1.6" fill="#bef264" />
        </svg>
      </span>
      <span className={`text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-slate-900"}`}>
        Eco<span className="text-cyan-500">Border</span>
      </span>
    </Link>
  );
}
