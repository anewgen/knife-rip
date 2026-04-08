import { DocsLayoutClient } from "@/components/docs/docs-layout-client";
import type { ReactNode } from "react";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <DocsLayoutClient>{children}</DocsLayoutClient>;
}
