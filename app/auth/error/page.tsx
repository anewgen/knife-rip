import { PageShell } from "@/components/page-shell";
import { ButtonLink } from "@/components/ui/button-link";
import Link from "next/link";

const errorCopy: Record<string, { title: string; body: string }> = {
  Configuration: {
    title: "Auth configuration",
    body:
      "Missing env vars, invalid AUTH_SECRET, or the database cannot be reached. Check Vercel Environment Variables and Function logs.",
  },
  AccessDenied: {
    title: "Access denied",
    body: "You cancelled sign-in or this account is not allowed.",
  },
  Verification: {
    title: "Verification",
    body: "The sign-in link expired or was already used.",
  },
  OAuthSignin: {
    title: "OAuth sign-in failed",
    body: "Discord did not start the login flow. Verify DISCORD_CLIENT_ID and app status in the Developer Portal.",
  },
  OAuthCallbackError: {
    title: "OAuth callback failed",
    body:
      "Discord returned an error or the redirect URI does not match. Add exactly: https://your-domain/api/auth/callback/discord",
  },
  OAuthCreateAccount: {
    title: "Could not create account",
    body:
      "Saving your Discord profile to Postgres failed. Check DATABASE_URL, run migrations, and look for Prisma errors in Vercel logs.",
  },
  AdapterError: {
    title: "Database error",
    body:
      "The auth adapter failed (create user / link account / session). Confirm DATABASE_URL and that prisma migrate deploy succeeded on deploy.",
  },
  CallbackRouteError: {
    title: "Callback error",
    body: "Something failed during the OAuth callback. Enable AUTH_DEBUG=1, redeploy, retry, and read Function logs.",
  },
  Default: {
    title: "Sign-in error",
    body: "Something went wrong. Try again.",
  },
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AuthErrorPage({ searchParams }: Props) {
  const { error: code } = await searchParams;
  const copy =
    (code && errorCopy[code]) ||
    (code
      ? {
          title: "Sign-in error",
          body: `Error code: ${code}. Check Vercel → Logs, or set AUTH_DEBUG=1 for verbose auth logs.`,
        }
      : errorCopy.Default);

  return (
    <PageShell
      title={copy.title}
      description={copy.body}
      maxWidth="narrow"
      prelude={
        <Link href="/" className="text-accent-strong hover:underline">
          ← Home
        </Link>
      }
    >
      <div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-surface/40 p-6 text-sm text-muted">
        <p className="font-medium text-foreground">Site owner checklist</p>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>Vercel → Environment Variables:</strong>{" "}
            <code className="text-accent-strong">AUTH_SECRET</code>,{" "}
            <code className="text-accent-strong">DISCORD_CLIENT_ID</code>,{" "}
            <code className="text-accent-strong">DISCORD_CLIENT_SECRET</code>,{" "}
            <code className="text-accent-strong">DATABASE_URL</code>,{" "}
            <code className="text-accent-strong">AUTH_URL</code> /{" "}
            <code className="text-accent-strong">NEXT_PUBLIC_SITE_URL</code>{" "}
            (no trailing slash, match your live domain)
          </li>
          <li>
            <strong>Discord → OAuth2 redirects:</strong>{" "}
            <code className="break-all text-accent-strong">
              https://your-domain/api/auth/callback/discord
            </code>
          </li>
          <li>
            <strong>Debug:</strong> set{" "}
            <code className="text-accent-strong">AUTH_DEBUG=1</code>, redeploy,
            sign in again, inspect logs, then remove it.
          </li>
        </ul>
        <ButtonLink href="/dashboard" variant="secondary" className="w-fit">
          Back to dashboard
        </ButtonLink>
      </div>
    </PageShell>
  );
}
