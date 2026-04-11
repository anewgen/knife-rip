"use client";

import { Icon } from "@/components/ui/icon";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type WinRow = {
  game: string;
  player: string;
  profit: string;
  at: string;
};

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  const s = Math.max(0, Math.floor((Date.now() - d) / 1000));
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function RecentWinsTicker() {
  const reduce = useReducedMotion();
  const [wins, setWins] = useState<WinRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/knife-cash/recent-wins", {
        cache: "no-store",
      });
      if (!res.ok) {
        setErr("Could not load wins");
        return;
      }
      const j = (await res.json()) as { wins?: WinRow[] };
      setWins(j.wins ?? []);
      setErr(null);
    } catch {
      setErr("Could not load wins");
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 45_000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <section
      className="rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3"
      aria-label="Recent wins"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Recent wins
        </h3>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
        >
          <Icon icon="mdi:refresh" className="size-3.5" aria-hidden />
          Refresh
        </button>
      </div>

      {err ? (
        <p className="text-sm text-muted">{err}</p>
      ) : wins.length === 0 ? (
        <p className="text-sm text-muted">No wins yet — take a seat.</p>
      ) : (
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-0.5">
          {wins.map((w, i) => (
            <motion.div
              key={`${w.at}-${w.player}-${i}`}
              initial={reduce ? undefined : { opacity: 0, y: 4 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.2) }}
              className="min-w-[8.5rem] shrink-0 rounded-lg border border-white/[0.06] bg-zinc-950/80 px-3 py-2"
            >
              <p className="text-[11px] font-medium text-muted">{w.game}</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-edge">
                {w.profit}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-muted">
                {w.player}
                <span className="text-muted/70"> · {timeAgo(w.at)}</span>
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
