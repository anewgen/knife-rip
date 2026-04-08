import { DocsPageView } from "@/components/docs/docs-page-view";
import { DOCS_OVERVIEW } from "@/lib/docs/doc-registry";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description: DOCS_OVERVIEW.description,
  robots: { index: true, follow: true },
};

export default function DocsOverviewPage() {
  return <DocsPageView doc={DOCS_OVERVIEW} />;
}
