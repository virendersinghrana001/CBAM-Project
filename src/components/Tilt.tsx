"use client";

import { useRef, type ReactNode } from "react";

/** Mouse-tracking 3D tilt wrapper. Subtle by default; set `max` for intensity. */
export default function Tilt({
  children,
  className = "",
  max = 8,
  glare = false,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * max * 2;
    const ry = (px - 0.5) * max * 2;
    el.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
    if (glare) el.style.setProperty("--gx", `${px * 100}%`);
  }
  function reset() {
    const el = ref.current;
    if (el) el.style.transform = "rotateX(0deg) rotateY(0deg)";
  }

  return (
    <div className="scene h-full">
      <div ref={ref} onMouseMove={onMove} onMouseLeave={reset} className={`tilt-3d relative ${className}`}>
        {children}
        {glare && (
          <span
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 [background:radial-gradient(circle_at_var(--gx,50%)_0%,rgba(255,255,255,0.35),transparent_60%)] group-hover:opacity-100"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
