import { DocsPageView } from "@/components/docs/docs-page-view";
import { getDocPage } from "@/lib/docs/doc-registry";
import { DOCS_SLUGS } from "@/lib/docs/nav-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return DOCS_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocPage(slug);
  if (!doc) return { title: "Docs" };
  return {
    title: doc.title,
    description: doc.description,
    robots: { index: true, follow: true },
  };
}

export default async function DocSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocPage(slug);
  if (!doc) notFound();
  return <DocsPageView doc={doc} />;
}
