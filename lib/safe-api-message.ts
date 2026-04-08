/**
 * Generic API error payloads — avoid env names, stack traces, or config hints
 * in responses (authenticated or not).
 */
export const API = {
  unauthorized: { error: "Unauthorized" } as const,
  badRequest: { error: "Invalid request" } as const,
  notFound: { error: "Not found" } as const,
  unavailable: { error: "Service unavailable" } as const,
  checkoutUnavailable: { error: "Checkout is unavailable" } as const,
} as const;
