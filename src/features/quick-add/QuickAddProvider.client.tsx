"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { QuickAddBootstrap, QuickAddContext, QuickAddOpenOptions, QuickAddStep } from "./types";
import { isAllowedQuickAddOriginPath } from "./validate-origin-path";

type QuickAddContextValue = {
  bootstrap: QuickAddBootstrap;
  tripId: string;
  isOpen: boolean;
  step: QuickAddStep;
  context: QuickAddContext;
  open: (options?: QuickAddOpenOptions) => void;
  close: () => void;
  setStep: (step: QuickAddStep) => void;
  lastOpenerRef: React.RefObject<HTMLElement | null>;
};

const QuickAddReactContext = createContext<QuickAddContextValue | null>(null);

type QuickAddProviderProps = {
  tripId: string;
  bootstrap: QuickAddBootstrap;
  children: ReactNode;
};

export function QuickAddProvider({
  tripId,
  bootstrap,
  children,
}: QuickAddProviderProps) {
  const pathname = usePathname();
  const lastOpenerRef = useRef<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<QuickAddStep>({ kind: "menu" });
  const [context, setContext] = useState<QuickAddContext>(() => ({
    tripId,
    originPath: pathname,
  }));

  const resolveOriginPath = useCallback(
    (candidate: string | undefined) => {
      const path = candidate ?? pathname;
      if (isAllowedQuickAddOriginPath(tripId, path)) {
        return path;
      }
      return `/app/trips/${tripId}`;
    },
    [pathname, tripId],
  );

  const open = useCallback(
    (options?: QuickAddOpenOptions) => {
      lastOpenerRef.current = document.activeElement as HTMLElement | null;
      const nextContext: QuickAddContext = {
        tripId,
        originPath: resolveOriginPath(options?.context?.originPath),
        date: options?.context?.date,
        linkDefaults: options?.context?.linkDefaults,
      };
      setContext(nextContext);
      setStep(options?.initialStep ?? { kind: "menu" });
      setIsOpen(true);
    },
    [pathname, resolveOriginPath, tripId],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setStep({ kind: "menu" });
  }, []);

  const value = useMemo(
    () => ({
      bootstrap,
      tripId,
      isOpen,
      step,
      context,
      open,
      close,
      setStep,
      lastOpenerRef,
    }),
    [bootstrap, tripId, isOpen, step, context, open, close],
  );

  return (
    <QuickAddReactContext.Provider value={value}>
      {children}
    </QuickAddReactContext.Provider>
  );
}

export function useQuickAdd(): QuickAddContextValue {
  const value = useContext(QuickAddReactContext);
  if (!value) {
    throw new Error("useQuickAdd must be used within QuickAddProvider");
  }
  return value;
}
