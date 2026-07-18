"use client";

import { animate, m, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export function CountUp({
  value,
  decimals = 0,
  className = "",
}: {
  value: number | null;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) =>
    value == null ? "—" : decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString()
  );

  useEffect(() => {
    if (!inView || value == null) return;
    const controls = animate(mv, value, { duration: 1.1, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [inView, value, mv]);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsub;
  }, [rounded]);

  return (
    <m.span ref={ref} className={className}>
      {value == null ? "—" : decimals > 0 ? value.toFixed(decimals) : Math.round(value)}
    </m.span>
  );
}
