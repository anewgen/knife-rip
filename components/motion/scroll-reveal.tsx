"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { HTMLAttributes, ReactNode } from "react";

type As = "div" | "main" | "section" | "header" | "article";

const MotionTag = {
  div: motion.div,
  main: motion.main,
  section: motion.section,
  header: motion.header,
  article: motion.article,
} as const;

type ScrollRevealProps = {
  as?: As;
  children: ReactNode;
  className?: string;
  /** Additional delay after viewport trigger (seconds) */
  delay?: number;
  /** Fraction of element visible before animating (0–1) */
  amount?: number;
} & Pick<
  HTMLAttributes<HTMLElement>,
  "id" | "aria-labelledby" | "aria-label" | "role"
>;

export function ScrollReveal({
  as = "div",
  children,
  className,
  delay = 0,
  amount = 0.12,
  id,
  "aria-labelledby": ariaLabelledBy,
  "aria-label": ariaLabel,
  role,
}: ScrollRevealProps) {
  const reduce = useReducedMotion();
  const Tag = as;

  if (reduce) {
    return (
      <Tag
        className={className}
        id={id}
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabel}
        role={role}
      >
        {children}
      </Tag>
    );
  }

  const Component = MotionTag[as];

  return (
    <Component
      className={className}
      id={id}
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      role={role}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1] as const,
        delay,
      }}
    >
      {children}
    </Component>
  );
}
