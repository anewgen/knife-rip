import { cn } from "@/lib/cn";

type BrandMarkProps = {
  className?: string;
  "aria-hidden"?: boolean;
};

const LOGO = "/brand/knife-logo.png";

/**
 * Knife wordmark silhouette — PNG mask so `text-*` / `bg-current` tints the logo.
 */
export function BrandMark({
  className,
  "aria-hidden": ariaHidden = true,
}: BrandMarkProps) {
  return (
    <span
      className={cn(
        "inline-block shrink-0 bg-current",
        "h-7 w-7 sm:h-8 sm:w-8",
        className,
      )}
      style={{
        maskImage: `url(${LOGO})`,
        WebkitMaskImage: `url(${LOGO})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
      aria-hidden={ariaHidden}
    />
  );
}
