import { cn } from "@/lib/cn";

type HeroOrnamentProps = {
  className?: string;
};

/** Abstract shards for the home hero — uses currentColor → `text-edge` / `text-accent`. */
export function HeroOrnament({ className }: HeroOrnamentProps) {
  return (
    <svg
      className={cn("pointer-events-none select-none text-edge/40", className)}
      viewBox="0 0 400 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M280 12 L388 8 L320 120 L240 88 Z"
        fill="currentColor"
        opacity="0.35"
      />
      <path
        d="M320 140 L395 95 L360 210 L275 175 Z"
        fill="currentColor"
        opacity="0.22"
      />
      <path
        d="M180 40 L260 20 L220 100 L140 85 Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M12 180 L95 155 L70 250 L8 230 Z"
        fill="currentColor"
        opacity="0.12"
      />
    </svg>
  );
}
