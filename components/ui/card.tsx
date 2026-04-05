import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: "none" | "sm" | "md" | "lg";
  elevated?: boolean;
  /** `glass` = sheen + blur; `plain` = no ::before (use for custom overlays e.g. pricing Pro). */
  surface?: "glass" | "plain";
};

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

export function Card({
  className,
  padding = "md",
  elevated = false,
  surface = "glass",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        surface === "glass" && "card-surface",
        "rounded-2xl border border-white/[0.06] bg-surface/55 backdrop-blur-md",
        surface === "plain" && "bg-surface/90",
        elevated && "shadow-card",
        surface === "glass" && "tile-hover",
        paddingMap[padding],
        className,
      )}
      {...props}
    />
  );
}
