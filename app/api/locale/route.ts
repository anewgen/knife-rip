import { isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { API } from "@/lib/safe-api-message";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(API.badRequest, { status: 400 });
  }
  const locale = (body as { locale?: string })?.locale;
  if (!locale || !isLocale(locale)) {
    return NextResponse.json(API.badRequest, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, locale: locale as Locale });
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
