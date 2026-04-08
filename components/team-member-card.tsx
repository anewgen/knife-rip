"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export type TeamMemberCardProps = {
  name: string;
  role: string;
  imageSrc: string;
  imageAlt: string;
  /** Iconify icon ids, e.g. `ant-design:code-filled` */
  badgeIcons: string[];
  bio: string;
  className?: string;
};

/**
 * Centered profile card (team / credits) — avatar, name, Iconify badges, role, bio.
 */
export function TeamMemberCard({
  name,
  role,
  imageSrc,
  imageAlt,
  badgeIcons,
  bio,
  className,
}: TeamMemberCardProps) {
  return (
    <article
      className={cn(
        "mx-auto w-full max-w-sm rounded-3xl border border-white/[0.07] bg-gradient-to-b from-[#141010] via-[#100c0c] to-[#0a0808] px-8 py-10 text-center shadow-[0_24px_48px_-24px_rgba(0,0,0,0.65)]",
        className,
      )}
    >
      <div className="mx-auto size-[7.5rem] shrink-0 overflow-hidden rounded-full ring-2 ring-white/[0.08] ring-offset-4 ring-offset-[#0a0808]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={240}
          height={240}
          className="size-full object-cover"
          priority
        />
      </div>

      <h3 className="font-display mt-7 text-2xl font-bold tracking-tight text-accent-strong">
        {name}
      </h3>

      {badgeIcons.length > 0 ? (
        <div
          className="mt-4 flex flex-wrap items-center justify-center gap-2"
          aria-label="Badges"
        >
          {badgeIcons.map((icon) => (
            <span
              key={icon}
              className="inline-flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] p-2 text-edge/90"
              title={icon}
            >
              <Icon icon={icon} className="size-5" aria-hidden />
            </span>
          ))}
        </div>
      ) : null}

      <p className="mt-5 flex items-center justify-center gap-2 text-sm text-muted">
        <Icon
          icon="tabler:briefcase"
          className="size-4 shrink-0 opacity-70"
          aria-hidden
        />
        <span>{role}</span>
      </p>

      <p className="mt-6 text-sm leading-relaxed text-muted">{bio}</p>
    </article>
  );
}
