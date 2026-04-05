import { cn } from "@/lib/cn";
import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";

const variants = {
  primary:
    "relative overflow-hidden bg-primary text-primary-foreground shadow-card ring-1 ring-inset ring-white/10 before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/12 before:to-transparent before:opacity-40 hover:opacity-100 hover:shadow-[var(--shadow-glow-primary)] hover:ring-white/15 active:opacity-[0.98]",
  secondary:
    "border border-white/[0.08] bg-surface/70 text-foreground ring-1 ring-inset ring-white/[0.04] hover:border-white/[0.1] hover:bg-surface-elevated/90",
  ghost:
    "text-muted hover:bg-white/[0.04] hover:text-foreground",
  danger:
    "bg-danger-muted text-danger border border-danger-border hover:bg-danger/20",
} as const;

export type ButtonLinkVariant = keyof typeof variants;

type ButtonLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    variant?: ButtonLinkVariant;
  };

export function ButtonLink({
  className,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "motion-safe:transition inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
