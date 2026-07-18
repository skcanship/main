"use client";

import { m, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

const BACKGROUNDS = [
  "radial-gradient(ellipse 70% 55% at 20% 20%, rgba(90,200,250,0.22), transparent 55%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(48,209,88,0.1), transparent 50%), linear-gradient(160deg, #0a0a10, #000 60%)",
  "radial-gradient(ellipse 60% 50% at 80% 15%, rgba(191,90,242,0.16), transparent 50%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(90,200,250,0.12), transparent 50%), linear-gradient(180deg, #08080c, #000 70%)",
  "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(48,209,88,0.14), transparent 55%), linear-gradient(145deg, #0c0c12, #000 65%)",
  "radial-gradient(ellipse 55% 45% at 0% 40%, rgba(90,200,250,0.2), transparent 50%), linear-gradient(120deg, #101018, #000 60%)",
  "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.07), transparent 40%), radial-gradient(ellipse at 70% 60%, rgba(255,159,10,0.08), transparent 45%), linear-gradient(200deg, #0a0a0e, #000)",
  "radial-gradient(ellipse 60% 40% at 60% 30%, rgba(90,200,250,0.14), transparent 50%), radial-gradient(ellipse 40% 30% at 20% 70%, rgba(191,90,242,0.1), transparent 45%), #000",
];

export function FlowSection({
  children,
  index = 0,
  className = "",
  id,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0.4, 1, 1, 0.55]);
  const contentY = useTransform(scrollYProgress, [0, 0.3, 1], [48, 0, -16]);
  const scale = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.97, 1, 1, 0.985]);
  const bg = BACKGROUNDS[index % BACKGROUNDS.length];

  return (
    <section ref={ref} id={id} className={`relative min-h-[88vh] overflow-hidden ${className}`}>
      <m.div
        aria-hidden
        className="absolute inset-0 scale-110"
        style={{ y, backgroundImage: bg, backgroundSize: "cover" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.05) 0.5px, transparent 0.5px)",
          backgroundSize: "3px 3px",
          maskImage: "linear-gradient(to bottom, black, transparent 90%)",
        }}
      />
      <m.div
        className="relative z-10 mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-5 py-16 sm:px-8"
        style={{ opacity, y: contentY, scale }}
      >
        {children}
      </m.div>
    </section>
  );
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}
