import { Icon } from "@/components/ui/icon";

export default function Loading() {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-4 py-24"
      aria-busy="true"
      aria-label="Loading"
    >
      <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-surface/60 text-edge motion-safe:animate-pulse">
        <Icon icon="mdi:loading" className="size-7 motion-safe:animate-spin" aria-hidden />
      </span>
      <p className="text-sm text-muted">Loading…</p>
    </div>
  );
}
