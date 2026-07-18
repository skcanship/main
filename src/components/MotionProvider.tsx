"use client";

import { AnimatePresence, LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { PageTransition } from "@/components/PageTransition";

export function MotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 28 }}>
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={pathname}>{children}</PageTransition>
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>
  );
}
