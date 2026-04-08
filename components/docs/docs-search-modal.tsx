"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { flattenDocsNavForSearch } from "@/lib/docs/nav-config";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const INDEX = flattenDocsNavForSearch();

export function DocsSearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) {
      setQ("");
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return INDEX.slice(0, 12);
    return INDEX.filter((row) => row.searchText.toLowerCase().includes(s)).slice(0, 24);
  }, [q]);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        onClose();
      }
    },
    [open, onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onKey]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close search"
            className="fixed inset-0 z-[90] bg-background/80 backdrop-blur-md"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="docs-search-title"
            className="fixed left-1/2 top-[min(22vh,8rem)] z-[91] w-[min(32rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/[0.1] bg-surface-elevated shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85),0_0_0_1px_rgba(248,113,113,0.08)]"
            initial={
              reduce
                ? false
                : { opacity: 0, y: -12, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduce
                ? undefined
                : { opacity: 0, y: -8, scale: 0.99 }
            }
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            <div className="flex items-center gap-2 border-b border-white/[0.07] px-3 py-2.5">
              <Icon
                icon="mdi:magnify"
                className="size-5 shrink-0 text-muted"
                aria-hidden
              />
              <input
                ref={inputRef}
                id="docs-search-title"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search docs…"
                className="min-w-0 flex-1 bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-muted"
                autoComplete="off"
              />
              <kbd className="hidden shrink-0 rounded border border-white/12 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline-block">
                Esc
              </kbd>
            </div>
            <ul className="max-h-[min(50vh,22rem)] overflow-y-auto p-1.5">
              {results.length === 0 ? (
                <li className="px-3 py-8 text-center text-sm text-muted">No matches</li>
              ) : (
                results.map((row) => (
                  <li key={`${row.href}-${row.title}`}>
                    <Link
                      href={row.href}
                      onClick={onClose}
                      className={cn(
                        "flex flex-col rounded-xl px-3 py-2.5 motion-safe:transition",
                        "hover:bg-white/[0.05] hover:text-foreground",
                      )}
                    >
                      <span className="text-sm font-medium text-accent-strong">
                        {row.title}
                      </span>
                      <span className="text-[11px] text-muted">{row.group}</span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export function useDocsSearchShortcut(
  setOpen: (v: boolean | ((b: boolean) => boolean)) => void,
) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [setOpen]);
}
