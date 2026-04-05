"use client";

import { Icon as IconifyIcon, type IconProps } from "@iconify/react";
import { cn } from "@/lib/cn";

export type UiIconProps = Omit<IconProps, "icon"> & {
  icon: string;
  className?: string;
};

/** Iconify icon — use `icon="collection:name"` (e.g. `mdi:check`). */
export function Icon({ icon, className, ...props }: UiIconProps) {
  return (
    <IconifyIcon
      icon={icon}
      className={cn("inline-block shrink-0", className)}
      {...props}
    />
  );
}
