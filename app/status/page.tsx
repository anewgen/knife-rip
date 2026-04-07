import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Status",
  description: "knife.rip and Knife bot service status.",
};

export default function StatusPage() {
  return (
    <PageShell
      title="Status"
      description="Current health of the marketing site, dashboard, and APIs. For command behavior, check Discord or the Commands page."
    >
      <Card
        padding="lg"
        elevated
        className="border-success-border bg-success-muted"
      >
        <p className="flex items-center gap-2 font-medium text-success">
          <Icon
            icon="mdi:check-decagram"
            aria-hidden
            className="size-5 shrink-0"
          />
          All systems operational
        </p>
        <p className="mt-2 text-sm text-muted">
          Website, authentication, and billing endpoints are up. If you hit an
          error, try again in a minute or contact{" "}
          <a
            href="mailto:support@knife.rip"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            support@knife.rip
          </a>
          .
        </p>
      </Card>

      <p className="text-sm text-muted">
        Command reference:{" "}
        <Link href="/commands" className="font-medium text-edge hover:underline">
          /commands
        </Link>
      </p>
    </PageShell>
  );
}
