"use client";

import { m, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LandingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [checking, setChecking] = useState(true);
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0.25]);
  const titleY = useTransform(scrollYProgress, [0, 0.3], [0, -40]);

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
    <main className="relative overflow-x-hidden bg-black">
      <section className="relative min-h-screen overflow-hidden">
        <m.div
          aria-hidden
          className="absolute inset-0"
          style={{
            scale: heroScale,
            opacity: heroOpacity,
            backgroundImage: `
              radial-gradient(ellipse 60% 45% at 50% 35%, rgba(90,200,250,0.22), transparent 60%),
              radial-gradient(ellipse 40% 30% at 80% 20%, rgba(191,90,242,0.14), transparent 50%),
              radial-gradient(ellipse 40% 35% at 15% 75%, rgba(48,209,88,0.12), transparent 50%),
              linear-gradient(180deg, #050508 0%, #000 70%)
            `,
          }}
        />
        <div className="aurora-orb left-[10%] top-[20%] h-72 w-72 bg-[rgba(90,200,250,0.25)]" />
        <div className="aurora-orb right-[8%] top-[40%] h-64 w-64 bg-[rgba(191,90,242,0.18)]" />
        <div className="aurora-orb bottom-[10%] left-[35%] h-56 w-56 bg-[rgba(48,209,88,0.14)]" />

        <nav className="nav-blur relative z-20 flex items-center justify-between px-5 py-4 sm:px-8">
          <p className="font-display text-[15px] tracking-tight">ShankoFIT</p>
          {!checking ? (
            <a href="/auth/whoop" className="btn-ghost !py-2 !px-4 text-xs">
              Connect
            </a>
          ) : null}
        </nav>

        <m.div
          className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 pb-20 text-center"
          style={{ y: titleY }}
        >
          <m.p
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Performance OS
          </m.p>
          <m.h1
            className="font-display shine-text mt-4 max-w-4xl text-6xl leading-[0.95] tracking-tight sm:text-8xl lg:text-[7.5rem]"
            initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.18, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            ShankoFIT
          </m.h1>
          <m.p
            className="mt-6 max-w-md text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
          >
            WHOOP intelligence. Equinox discipline. Apple-grade clarity. Your recovery, training, and
            recomp — in one seamless flow.
          </m.p>
          <m.div
            className="mt-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {checking ? (
              <span className="text-sm text-[var(--ink-muted)]">Preparing…</span>
            ) : (
              <a href="/auth/whoop" className="btn-primary">
                Connect WHOOP
              </a>
            )}
          </m.div>
          {error ? (
            <div
              role="alert"
              className="mt-8 max-w-lg rounded-2xl border border-[var(--bad)]/40 bg-[rgba(255,69,58,0.12)] px-4 py-3 text-sm text-[#ffb4ae]"
            >
              {error}
            </div>
          ) : null}
        </m.div>
      </section>

      <section className="relative min-h-[70vh] overflow-hidden px-5 py-24 sm:px-8">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 30% 40%, rgba(90,200,250,0.14), transparent 50%), #000",
          }}
        />
        <m.div
          className="relative z-10 mx-auto grid max-w-6xl gap-4 sm:grid-cols-3"
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
              body: "Live WHOOP recovery, HRV, and sleep — surfaced like a morning briefing.",
            },
            {
              title: "Protocol",
              body: "A living split that adapts intensity when your body asks for rest.",
            },
            {
              title: "Recomp",
              body: "Strain budget, protein targets, and weekly physique signals in one place.",
            },
          ].map((item) => (
            <m.div
              key={item.title}
              className="glass-dense p-7"
              variants={{
                hidden: { opacity: 0, y: 36, scale: 0.97 },
                show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 22 } }}
            >
              <p className="eyebrow">{item.title}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink-muted)]">{item.body}</p>
            </m.div>
          ))}
        </m.div>
      </section>

      <section className="relative overflow-hidden px-5 py-28 sm:px-8">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(105deg, rgba(90,200,250,0.16), transparent 42%), radial-gradient(ellipse at left, #14141c, #000 70%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-6xl">
          <m.h2
            className="font-display max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-6xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75 }}
          >
            Designed to feel inevitable.
          </m.h2>
          <m.p
            className="mt-5 max-w-lg text-[var(--ink-muted)]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            Open Morning Command. Know your lift. Hit your protein. Stay inside the strain budget.
          </m.p>
          <m.div
            className="mt-8"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {!checking ? (
              <a href="/auth/whoop" className="btn-primary">
                Enter ShankoFIT
              </a>
            ) : null}
          </m.div>
        </div>
      </section>
    </main>
  );
}
