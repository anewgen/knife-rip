import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Docs",
  description: "Knife documentation — getting started, permissions, billing.",
};

const pages = [
  { href: "/docs/getting-started", title: "Getting started" },
  { href: "/docs/permissions", title: "Permissions" },
  { href: "/docs/billing", title: "Billing & premium" },
] as const;

export default function DocsIndexPage() {
  return (
    <PageShell
      title="Docs"
      description="How to get started, what permissions matter, and how Knife Pro billing works."
    >
      <ul className="!mt-0 grid gap-3">
        {pages.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="block motion-safe:transition">
              <Card
                padding="md"
                className="motion-safe:transition hover:border-muted"
              >
                <span className="font-medium text-foreground">{p.title}</span>
                <span className="mt-1 flex items-center gap-1 text-sm text-muted">
                  Open
                  <Icon icon="tabler:chevron-right" aria-hidden className="size-4" />
                </span>
              </Card>
            </Link>
          </li>
        ))}
        <li>
          <Link href="/commands" className="block motion-safe:transition">
            <Card
              padding="md"
              className="motion-safe:transition hover:border-muted"
            >
              <span className="font-medium text-foreground">Commands</span>
              <span className="mt-0.5 block text-xs text-muted">
                Prefix commands (synced from the live bot)
              </span>
              <span className="mt-1 flex items-center gap-1 text-sm text-muted">
                Open
                <Icon icon="tabler:chevron-right" aria-hidden className="size-4" />
              </span>
            </Card>
          </Link>
        </li>
      </ul>
    </PageShell>
  );
}
