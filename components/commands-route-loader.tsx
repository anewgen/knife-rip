"use client";

import { BrandMark } from "@/components/brand-mark";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";

export const COMMANDS_LOADER_STORAGE_KEY = "knife-commands-loader-seen";

type CommandsLoaderContextValue = {
  navigateToCommandsFromHome: () => void;
};

const CommandsLoaderContext = createContext<CommandsLoaderContextValue | null>(
  null,
);

export function useCommandsLoader(): CommandsLoaderContextValue | null {
  return useContext(CommandsLoaderContext);
}

export function CommandsLoaderProvider({ children }: { children: ReactNode }) {
  const [navigatingToCommands, setNavigatingToCommands] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  /** Overlay only while still on `/` after arming; hides as soon as route is `/commands`. */
  const showOverlay = navigatingToCommands && pathname !== "/commands";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (
      nav &&
      (nav.type === "reload" || nav.type === "navigate") &&
      window.location.pathname === "/"
    ) {
      sessionStorage.removeItem(COMMANDS_LOADER_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (pathname !== "/commands" || !navigatingToCommands) return;
    sessionStorage.setItem(COMMANDS_LOADER_STORAGE_KEY, "1");
    queueMicrotask(() => {
      setNavigatingToCommands(false);
    });
  }, [pathname, navigatingToCommands]);

  const navigateToCommandsFromHome = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem(COMMANDS_LOADER_STORAGE_KEY)
    ) {
      router.push("/commands");
      return;
    }
    setNavigatingToCommands(true);
    router.push("/commands");
  }, [router]);

  return (
    <CommandsLoaderContext.Provider value={{ navigateToCommandsFromHome }}>
      {children}
      <CommandsLoaderOverlay open={showOverlay} />
    </CommandsLoaderContext.Provider>
  );
}

function CommandsLoaderOverlay({ open }: { open: boolean }) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="knife-cmd-loader"
          role="status"
          aria-busy="true"
          aria-live="polite"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-background/75 backdrop-blur-xl backdrop-saturate-150"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reduce ? 0 : 0.2,
            ease: [0.16, 1, 0.3, 1] as const,
          }}
          style={{ willChange: "opacity" }}
        >
          <span className="sr-only">Loading commands</span>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted"
            aria-hidden
          >
            Loading
          </p>
          {/* Same surface language as homepage hero panel (app/page.tsx) */}
          <div className="hero-backdrop hero-rim hero-sheen-live relative min-w-[13.5rem] overflow-hidden rounded-[1.35rem] border border-white/[0.07] px-12 py-10 sm:min-w-[15rem] sm:p-11">
            <div
              className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-red-950/18 via-transparent to-transparent"
              aria-hidden
            />
            <motion.div
              className="relative flex items-center justify-center pt-0.5"
              animate={
                reduce ? undefined : { opacity: [0.85, 1, 0.85] }
              }
              transition={
                reduce
                  ? undefined
                  : {
                      duration: 2.35,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
              style={{ willChange: reduce ? "auto" : "opacity" }}
            >
              <BrandMark
                className="size-14 text-edge sm:size-[4.25rem]"
                aria-hidden
              />
            </motion.div>
          </div>
          <p className="font-display text-sm font-medium tracking-tight text-muted">
            Commands
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function CommandsNavLink({
  href,
  children,
  className,
  onClick,
  ...rest
}: ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const ctx = useContext(CommandsLoaderContext);
  const router = useRouter();

  if (href !== "/commands" || pathname !== "/") {
    return (
      <Link href={href} className={className} onClick={onClick} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <Link
      href="/commands"
      className={className}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (
          typeof window !== "undefined" &&
          sessionStorage.getItem(COMMANDS_LOADER_STORAGE_KEY)
        ) {
          return;
        }
        e.preventDefault();
        if (ctx) {
          ctx.navigateToCommandsFromHome();
        } else {
          router.push("/commands");
        }
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
