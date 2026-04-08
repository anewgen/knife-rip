import { auth } from "@/auth";
import { db } from "@/lib/db";
import { API } from "@/lib/safe-api-message";
import { getStripe, siteOrigin } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(API.unauthorized, { status: 401 });
  }

  const form = await req.formData();
  const priceId =
    (form.get("priceId") as string | null) ??
    process.env.STRIPE_PRICE_PRO_LIFETIME ??
    "";

  if (!priceId?.trim()) {
    return NextResponse.json(API.checkoutUnavailable, { status: 503 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json(API.notFound, { status: 404 });
  }

  if (user.lifetimePremiumAt) {
    return NextResponse.redirect(`${siteOrigin()}/dashboard?pro=already`);
  }

  const origin = siteOrigin();

  let checkoutUrl: string | null;
  try {
    const stripe = getStripe();
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: user.stripeCustomerId ?? undefined,
      customer_email: user.stripeCustomerId ? undefined : (user.email ?? undefined),
      client_reference_id: user.id,
      line_items: [{ price: priceId.trim(), quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/pricing`,
      metadata: { userId: user.id },
      allow_promotion_codes: true,
    });
    checkoutUrl = checkout.url ?? null;
  } catch {
    console.error("[checkout] stripe session create failed");
    return NextResponse.json(API.checkoutUnavailable, { status: 503 });
  }

  if (!checkoutUrl) {
    return NextResponse.json(API.checkoutUnavailable, { status: 503 });
  }

  return NextResponse.redirect(checkoutUrl);
}
