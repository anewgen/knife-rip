import { auth } from "@/auth";
import { db } from "@/lib/db";
import { API } from "@/lib/safe-api-message";
import { getStripe, siteOrigin } from "@/lib/stripe";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(API.unauthorized, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  const origin = siteOrigin();
  if (!user?.stripeCustomerId) {
    return NextResponse.redirect(`${origin}/pricing`);
  }

  let portalUrl: string | null;
  try {
    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/dashboard`,
    });
    portalUrl = portal.url ?? null;
  } catch {
    console.error("[billing portal] stripe session create failed");
    return NextResponse.redirect(`${origin}/dashboard?billing=error`);
  }

  if (!portalUrl) {
    return NextResponse.redirect(`${origin}/dashboard?billing=error`);
  }

  return NextResponse.redirect(portalUrl);
}
