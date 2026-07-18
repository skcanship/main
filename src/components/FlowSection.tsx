"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, type ReactNode } from "react";

const BACKGROUNDS = [
  // seal + moss
  "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(90,44,7,0.45), transparent 55%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(140,141,104,0.16), transparent 50%), linear-gradient(135deg, #1a0e05 0%, #0c0805 50%, #120a05 100%)",
  "radial-gradient(ellipse 70% 50% at 80% 20%, rgba(140,141,104,0.2), transparent 50%), linear-gradient(160deg, #140c07 0%, #0c0805 45%, #1a1008 100%)",
  "radial-gradient(ellipse 90% 70% at 50% 100%, rgba(90,44,7,0.4), transparent 55%), linear-gradient(180deg, #120a05 0%, #0c0805 55%, #16100a 100%)",
  "linear-gradient(105deg, rgba(140,141,104,0.18) 0%, transparent 35%), radial-gradient(ellipse at 0% 50%, #2a1a0c 0%, #0c0805 60%)",
  "radial-gradient(circle at 50% 0%, rgba(140,141,104,0.12), transparent 40%), linear-gradient(200deg, #1a1008 0%, #0c0805 55%, #120a05 100%)",
  "radial-gradient(ellipse 60% 40% at 70% 60%, rgba(90,44,7,0.35), transparent 50%), linear-gradient(145deg, #140c07 0%, #0c0805 100%)",
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
  const y = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.55, 1, 1, 0.65]);
  const contentY = useTransform(scrollYProgress, [0, 0.35, 1], [40, 0, -20]);
  const bg = BACKGROUNDS[index % BACKGROUNDS.length];

  return (
    <section ref={ref} id={id} className={`relative min-h-[85vh] overflow-hidden ${className}`}>
      <motion.div
        aria-hidden
        className="absolute inset-0 scale-110"
        style={{
          y,
          backgroundImage: `${bg}, url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: "cover, 180px 180px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(247,244,239,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(247,244,239,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <motion.div
        className="relative z-10 mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center px-5 py-14 sm:px-8"
        style={{ opacity, y: contentY }}
      >
        {children}
      </motion.div>
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
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function useParallax(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance]);
}
