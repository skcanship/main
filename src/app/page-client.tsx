"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LandingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        if (!cancelled && data.connected) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // stay on landing
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 50% 20%, rgba(90,44,7,0.55), transparent 70%), linear-gradient(120deg, rgba(12,8,5,0.2), rgba(12,8,5,0.92))",
        }}
      />
      <div className="scanline pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
        <p className="hud-label animate-rise">Colours Cafe · Tactical OS</p>
        <h1 className="font-display animate-rise-delay-1 mt-4 max-w-4xl text-5xl leading-[1.05] tracking-[0.04em] text-[var(--ink)] sm:text-7xl">
          Operation
          <span className="mt-2 block text-[var(--moss-bright)]">Killmonger</span>
        </h1>
        <p className="animate-rise-delay-2 mt-6 max-w-xl text-lg text-[var(--ink-muted)] sm:text-xl">
          JARVIS-grade command center for WHOOP recovery, strain, body vitals, and a recovery-aware
          split: Back & Bis → Chest/Shoulders/Tris → Legs → Cardio & Core → Rest.
        </p>

        <div className="animate-rise-delay-2 mt-10 flex flex-wrap items-center gap-4">
          {checking ? (
            <span className="font-mono text-[var(--moss)]">Scanning uplink…</span>
          ) : (
            <a
              href="/auth/whoop"
              className="inline-flex items-center justify-center border border-[var(--moss)] bg-[var(--seal)] px-8 py-3.5 font-semibold tracking-[0.18em] text-[var(--ink)] uppercase transition hover:bg-[var(--seal-deep)]"
            >
              Initialize WHOOP Link
            </a>
          )}
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-8 max-w-xl border border-[var(--danger)]/40 bg-[rgba(196,92,58,0.12)] px-4 py-3 font-mono text-sm text-[#f0b4a0]"
          >
            {error}
          </div>
        ) : null}
      </div>
    </main>
  );
}
