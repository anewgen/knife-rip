"use client";

import { CommandsLoaderProvider } from "@/components/commands-route-loader";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CommandsLoaderProvider>{children}</CommandsLoaderProvider>
    </SessionProvider>
  );
}
