"use client";

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

type Props = {
  disabled: boolean;
  className?: string;
};

export function CheckoutSubmitButton({ disabled, className }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      className={className}
      aria-busy={pending}
    >
      {pending ? "Redirecting to Stripe…" : "Checkout with Stripe"}
    </Button>
  );
}
