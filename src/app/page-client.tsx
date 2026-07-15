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
            "linear-gradient(120deg, rgba(11,18,16,0.2) 0%, rgba(11,18,16,0.75) 55%, rgba(11,18,16,0.92) 100%), url(\"data:image/svg+xml,%3Csvg viewBox='0 0 800 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%231f9e6a'/%3E%3Cstop offset='1' stop-color='%230b1210'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='600' fill='url(%23g)'/%3E%3Cpath d='M0 420 Q200 300 400 380 T800 320 V600 H0Z' fill='%233dffa8' fill-opacity='0.12'/%3E%3Cpath d='M0 480 Q250 360 500 440 T800 400 V600 H0Z' fill='%233dffa8' fill-opacity='0.08'/%3E%3C/svg%3E\")",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
        <p className="font-display animate-rise text-sm font-semibold tracking-[0.28em] text-[var(--accent)] uppercase">
          PulsePlan
        </p>
        <h1 className="font-display animate-rise-delay-1 mt-4 max-w-3xl text-5xl leading-[0.95] font-bold tracking-tight text-[var(--ink)] sm:text-7xl">
          Train from recovery,
          <span className="block text-[var(--accent)]">not guesswork.</span>
        </h1>
        <p className="animate-rise-delay-2 mt-6 max-w-xl text-lg text-[var(--ink-muted)] sm:text-xl">
          Connect WHOOP to see recovery, sleep, and strain — then get a daily training block built for
          muscle gain and fat loss.
        </p>

        <div className="animate-rise-delay-2 mt-10 flex flex-wrap items-center gap-4">
          {checking ? (
            <span className="text-[var(--ink-muted)]">Checking connection…</span>
          ) : (
            <a
              href="/auth/whoop"
              className="animate-glow inline-flex items-center justify-center rounded-md bg-[var(--accent)] px-7 py-3.5 text-base font-semibold text-[#062118] transition hover:brightness-110"
            >
              Connect WHOOP
            </a>
          )}
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-8 max-w-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[#ffb4b4]"
          >
            {error}
          </div>
        ) : null}
      </div>
    </main>
  );
}
