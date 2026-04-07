"use client";

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
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0a0a0a]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.18 }}
        >
          <span className="sr-only">Loading commands</span>
          <motion.div
            className="relative flex size-[4.5rem] items-center justify-center sm:size-20"
            animate={
              reduce
                ? undefined
                : {
                    scale: [1, 1.06, 1],
                    opacity: [0.88, 1, 0.88],
                  }
            }
            transition={
              reduce
                ? undefined
                : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
            }
            style={{
              filter: reduce
                ? undefined
                : "drop-shadow(0 0 16px rgba(56, 189, 248, 0.42)) drop-shadow(0 0 40px rgba(56, 189, 248, 0.2))",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/knife-logo.png"
              alt=""
              width={72}
              height={72}
              className="size-[4.25rem] object-contain opacity-95 sm:size-16"
            />
          </motion.div>
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
