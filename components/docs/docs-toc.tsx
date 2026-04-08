"use client";

import { cn } from "@/lib/cn";
import type { DocSection } from "@/lib/docs/types";

export function DocsToc({
  sections,
  className,
}: {
  sections: Pick<DocSection, "id" | "title">[];
  className?: string;
}) {
  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className={cn(
        "hidden xl:block",
        "sticky top-28 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto pb-10",
        className,
      )}
    >
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
        On this page
      </p>
      <ul className="space-y-2 border-l border-white/[0.08] pl-3 text-sm">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="block py-0.5 text-muted motion-safe:transition hover:text-edge"
            >
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
