"use client";

import { addCollection } from "@iconify/react";
import { icons as circleFlagsIcons } from "@iconify-json/circle-flags";
import { icons as mdiIcons } from "@iconify-json/mdi";
import { icons as tablerIcons } from "@iconify-json/tabler";

addCollection(mdiIcons);
addCollection(tablerIcons);
addCollection(circleFlagsIcons);

/** Bundles mdi + tabler + circle-flags (locale UI) so icons work offline / strict CSP. */
export function IconifyRegister() {
  return null;
}
