"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LandingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [checking, setChecking] = useState(true);
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.35]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        if (!cancelled && data.connected) {
          router.replace("/morning");
          return;
        }
      } catch {
        // stay
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="relative overflow-x-hidden bg-[#0c0805]">
      {/* Full-bleed dynamic hero — Colours Cafe */}
      <section className="relative min-h-screen overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{
            scale: heroScale,
            opacity: heroOpacity,
            backgroundImage: `
              linear-gradient(180deg, rgba(12,8,5,0.15) 0%, rgba(12,8,5,0.45) 50%, rgba(12,8,5,0.92) 100%),
              radial-gradient(ellipse 70% 55% at 65% 35%, rgba(90,44,7,0.5), transparent 55%),
              radial-gradient(ellipse 50% 40% at 15% 70%, rgba(140,141,104,0.18), transparent 50%),
              linear-gradient(135deg, #1c1008 0%, #0c0805 50%, #14100a 100%)
            `,
          }}
        />
        <div
          aria-hidden
          className="animate-orb pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-[rgba(140,141,104,0.14)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 bottom-32 h-64 w-64 rounded-full bg-[rgba(90,44,7,0.35)] blur-3xl"
          style={{ animation: "float-orb 12s ease-in-out infinite reverse" }}
        />

        <nav className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
          <p className="font-display text-base tracking-[0.28em]">ShankoFIT</p>
          {!checking ? (
            <a href="/auth/whoop" className="btn-ghost">
              Connect
            </a>
          ) : null}
        </nav>

        <div className="relative z-10 flex min-h-[calc(100vh-72px)] flex-col justify-end px-5 pb-16 sm:px-8 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-5 h-0.5 w-24 bg-[var(--accent)]" />
            <h1 className="font-display max-w-5xl text-6xl leading-[0.9] sm:text-8xl lg:text-9xl">
              Shanko
              <span className="text-[var(--accent)]">FIT</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
              Performance that moves with you. WHOOP recovery, a living training split, and body
              vitals — in one cinematic flow.
            </p>
            <div className="mt-8">
              {checking ? (
                <span className="text-sm text-[var(--ink-muted)]">Preparing…</span>
              ) : (
                <a href="/auth/whoop" className="btn-primary">
                  Connect WHOOP
                </a>
              )}
            </div>
            {error ? (
              <div
                role="alert"
                className="mt-6 max-w-lg border border-[var(--bad)]/40 bg-[rgba(196,122,106,0.12)] px-4 py-3 text-sm text-[#e8b4a8]"
              >
                {error}
              </div>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* Dense feature bands — full bleed, no whitespace voids */}
      <section className="relative min-h-[70vh] overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 30% 40%, rgba(90,44,7,0.4), transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(140,141,104,0.14), transparent 45%), linear-gradient(160deg, #14100a, #0c0805 60%, #120a05)",
          }}
        />
        <motion.div
          className="relative z-10 mx-auto grid max-w-6xl gap-4 px-5 py-16 sm:grid-cols-3 sm:px-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15%" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {[
            {
              title: "Recovery",
              body: "Live WHOOP recovery, HRV, and sleep — surfaced the moment you need them.",
            },
            {
              title: "Protocol",
              body: "Back & Bis + Cardio · Push + Cardio · Legs + Core · Stretch / Mobility.",
            },
            {
              title: "Vitals",
              body: "Track height, weight, and recomp progress with a clean performance read.",
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              className="glass-dense p-6"
              variants={{
                hidden: { opacity: 0, y: 32 },
                show: { opacity: 1, y: 0, transition: { duration: 0.65 } },
              }}
            >
              <p className="eyebrow">{item.title}</p>
              <p className="mt-4 text-[var(--ink-muted)] leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="relative min-h-[55vh] overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(105deg, rgba(140,141,104,0.18), transparent 40%), radial-gradient(ellipse at left, #2a1a0c, #0c0805 70%)",
          }}
        />
        <div className="relative z-10 mx-auto flex min-h-[55vh] max-w-6xl flex-col justify-center px-5 py-16 sm:px-8">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Built for the grind
          </motion.p>
          <motion.h2
            className="font-display mt-4 max-w-3xl text-4xl leading-[1] sm:text-6xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Train smarter. Recover harder. Look the part.
          </motion.h2>
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            {!checking ? (
              <a href="/auth/whoop" className="btn-primary">
                Enter ShankoFIT
              </a>
            ) : null}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
