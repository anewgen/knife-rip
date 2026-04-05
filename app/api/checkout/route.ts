import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStripe, siteOrigin } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const priceId =
    (form.get("priceId") as string | null) ??
    process.env.STRIPE_PRICE_PRO_LIFETIME ??
    "";

  if (!priceId) {
    return NextResponse.json(
      { error: "Missing priceId or STRIPE_PRICE_PRO_LIFETIME" },
      { status: 400 },
    );
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.lifetimePremiumAt) {
    return NextResponse.redirect(`${siteOrigin()}/dashboard?pro=already`);
  }

  const stripe = getStripe();
  const origin = siteOrigin();

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: user.stripeCustomerId ?? undefined,
    customer_email: user.stripeCustomerId ? undefined : (user.email ?? undefined),
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pricing`,
    metadata: { userId: user.id },
    allow_promotion_codes: true,
  });

  if (!checkout.url) {
    return NextResponse.json(
      { error: "Checkout session missing URL" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(checkout.url);
}
