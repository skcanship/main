import { Suspense } from "react";
import LandingClient from "./page-client";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-[var(--ink-muted)]">
          Loading…
        </main>
      }
    >
      <LandingClient />
    </Suspense>
  );
}
