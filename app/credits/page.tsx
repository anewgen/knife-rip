import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credits",
  description: "Team and contributors behind Knife.",
  robots: { index: false, follow: false },
};

/**
 * Unlisted in navigation — surfaced via `.credits` / `.team` in Discord.
 */
export default function CreditsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16 sm:px-6">
      <header className="border-b border-red-950/35 pb-8">
        <span
          className="mb-4 block h-1 w-10 rounded-full bg-gradient-to-r from-edge/70 via-edge/30 to-transparent"
          aria-hidden
        />
        <h1 className="font-display text-3xl font-bold tracking-tight text-accent-strong sm:text-4xl">
          Credits
        </h1>
        <p className="mt-3 text-muted leading-relaxed">
          You found the unlisted page — this list isn&apos;t linked elsewhere on
          the site. Thanks for using Knife.
        </p>
      </header>
      <section className="space-y-6 text-sm leading-relaxed text-foreground/90">
        <div>
          <h2 className="font-display text-lg font-semibold text-accent-strong">
            Team
          </h2>
          <p className="mt-2 text-muted">
            <strong className="text-foreground">knife.rip</strong> — product,
            bot, and site.
          </p>
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-accent-strong">
            Contributors
          </h2>
          <p className="mt-2 text-muted">
            Everyone who files issues, suggests features, and spreads the word.
            If you&apos;d like a name listed here, reach out through support.
          </p>
        </div>
      </section>
    </main>
  );
}
