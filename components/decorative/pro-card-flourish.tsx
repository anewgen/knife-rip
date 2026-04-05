import { cn } from "@/lib/cn";

type ProCardFlourishProps = {
  className?: string;
};

/** Subtle corner accent for the pricing Pro card. */
export function ProCardFlourish({ className }: ProCardFlourishProps) {
  return (
    <svg
      className={cn("pointer-events-none select-none text-edge/30", className)}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M0 0 H90 L120 30 V120 H0 Z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M20 20 L75 15 L55 65 L12 55 Z"
        fill="currentColor"
        opacity="0.35"
      />
    </svg>
  );
}
