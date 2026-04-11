"use client";

import type { ReactNode } from "react";

export function CasinoFloor({ children }: { children: ReactNode }) {
  return (
    <section
      className="rounded-2xl border border-edge/25 bg-gradient-to-b from-zinc-950/90 to-black/95 shadow-[0_0_0_1px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]"
      aria-labelledby="knife-cash-tables-heading"
    >
      <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          Tables
        </p>
        <h2
          id="knife-cash-tables-heading"
          className="mt-1 font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl"
        >
          Knife Cash floor
        </h2>
        <p className="mt-1 max-w-lg text-sm text-muted">
          Server-side outcomes · wallet cash only · play responsibly
        </p>
      </div>
      <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}
