"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, type ReactNode } from "react";

const BACKGROUNDS = [
  // deep warm athletic
  "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(194,168,120,0.22), transparent 55%), linear-gradient(135deg, #1a1410 0%, #0a0a0a 45%, #12181c 100%)",
  // cool performance
  "radial-gradient(ellipse 70% 50% at 80% 20%, rgba(143,188,143,0.18), transparent 50%), linear-gradient(160deg, #0c1014 0%, #0a0a0a 40%, #1a1210 100%)",
  // champagne flare
  "radial-gradient(ellipse 90% 70% at 50% 100%, rgba(194,168,120,0.2), transparent 55%), linear-gradient(180deg, #14100c 0%, #0a0a0a 50%, #101418 100%)",
  // dramatic side light
  "linear-gradient(105deg, rgba(194,168,120,0.15) 0%, transparent 35%), radial-gradient(ellipse at 0% 50%, #2a2018 0%, #0a0a0a 60%)",
  // night club floor
  "radial-gradient(circle at 50% 0%, rgba(247,244,239,0.08), transparent 40%), linear-gradient(200deg, #161210 0%, #0a0a0a 55%, #0e1612 100%)",
  // ember
  "radial-gradient(ellipse 60% 40% at 70% 60%, rgba(196,122,106,0.12), transparent 50%), linear-gradient(145deg, #120e0c 0%, #0a0a0a 100%)",
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
