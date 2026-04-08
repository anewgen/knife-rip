import type { ReactNode } from "react";

export type DocNavLink = {
  title: string;
  href: string;
  icon: string;
  /** Extra tokens for search */
  keywords?: string[];
};

export type DocNavGroup = {
  id: string;
  title: string;
  icon: string;
  items: DocNavLink[];
};

export type DocSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export type DocPageDefinition = {
  title: string;
  description: string;
  sections: DocSection[];
};
