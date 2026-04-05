import type { Subscription, User } from "@prisma/client";

export type UserWithSubscription = User & {
  subscription?: Subscription | null;
};

/**
 * Premium: lifetime purchase and/or an active recurring subscription (legacy).
 */
export function hasPremiumAccess(
  user: UserWithSubscription | null | undefined,
): boolean {
  if (!user) return false;
  if (user.lifetimePremiumAt) return true;
  const sub = user.subscription;
  if (!sub) return false;
  return (
    (sub.status === "active" || sub.status === "trialing") &&
    sub.currentPeriodEnd > new Date()
  );
}
