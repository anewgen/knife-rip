"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] as const },
  },
};

type As = "div" | "ul";

export function StaggerChildren({
  as = "div",
  children,
  className,
}: {
  as?: As;
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionComponent = as === "ul" ? motion.ul : motion.div;

  return (
    <MotionComponent
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.08 }}
    >
      {children}
    </MotionComponent>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionComponent = as === "li" ? motion.li : motion.div;

  return (
    <MotionComponent className={className} variants={item}>
      {children}
    </MotionComponent>
  );
}
