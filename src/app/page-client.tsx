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
      {/* Full-bleed cinematic hero plane */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div
          className="animate-kenburns absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(180deg, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.55) 45%, rgba(10,10,10,0.92) 100%),
              linear-gradient(90deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.15) 50%, rgba(10,10,10,0.7) 100%),
              radial-gradient(ellipse at 30% 40%, #2a2420 0%, #0a0a0a 65%),
              url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")
            `,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <p className="font-display text-sm tracking-[0.35em] text-[var(--ink)]">Operation Killmonger</p>
        {!checking ? (
          <a href="/auth/whoop" className="btn-ghost">
            Connect
          </a>
        ) : null}
      </nav>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl flex-col justify-end px-6 pb-20 sm:px-10 sm:pb-24">
        <div className="rule mb-8 max-w-xs bg-[var(--accent)]" style={{ height: 2 }} />
        <h1 className="font-display animate-fade-up max-w-4xl text-6xl leading-[0.92] text-[var(--ink)] sm:text-8xl">
          Operation
          <br />
          Killmonger
        </h1>
        <p className="animate-fade-up-1 mt-6 max-w-md text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
          Where luxury performance meets precision recovery. Your WHOOP data, training protocol, and
          body metrics — refined into one command.
        </p>

        <div className="animate-fade-up-2 mt-10">
          {checking ? (
            <span className="text-sm tracking-wide text-[var(--ink-muted)]">Preparing…</span>
          ) : (
            <a href="/auth/whoop" className="btn-primary">
              Connect WHOOP
            </a>
          )}
        </div>

        {error ? (
          <div
            role="alert"
            className="animate-fade-up-3 mt-8 max-w-lg border border-[var(--bad)]/40 bg-[rgba(196,122,106,0.1)] px-4 py-3 text-sm text-[#e8b4a8]"
          >
            {error}
          </div>
        ) : null}
      </div>
    </main>
  );
}
