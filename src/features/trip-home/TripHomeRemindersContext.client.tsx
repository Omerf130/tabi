"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ReminderManagerTab } from "@/features/trips/reminders/filter-trip-home-reminders";
import type { TripHomeRemindersManagerData } from "./types";

type OpenManagerOptions = {
  tab?: ReminderManagerTab;
};

type TripHomeRemindersContextValue = {
  managerData: TripHomeRemindersManagerData;
  isOpen: boolean;
  sessionKey: number;
  openManager: (options?: OpenManagerOptions) => void;
  closeManager: () => void;
  initialTab: ReminderManagerTab;
};

const TripHomeRemindersContext = createContext<TripHomeRemindersContextValue | null>(
  null,
);

type TripHomeRemindersProviderProps = {
  managerData: TripHomeRemindersManagerData;
  children: ReactNode;
};

export function TripHomeRemindersProvider({
  managerData,
  children,
}: TripHomeRemindersProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<ReminderManagerTab>("today");
  const [sessionKey, setSessionKey] = useState(0);

  const openManager = useCallback((options?: OpenManagerOptions) => {
    setInitialTab(options?.tab ?? "today");
    setSessionKey((key) => key + 1);
    setIsOpen(true);
  }, []);

  const closeManager = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      managerData,
      isOpen,
      sessionKey,
      openManager,
      closeManager,
      initialTab,
    }),
    [managerData, isOpen, sessionKey, openManager, closeManager, initialTab],
  );

  return (
    <TripHomeRemindersContext.Provider value={value}>
      {children}
    </TripHomeRemindersContext.Provider>
  );
}

export function useTripHomeReminders(): TripHomeRemindersContextValue {
  const context = useContext(TripHomeRemindersContext);
  if (!context) {
    throw new Error("useTripHomeReminders must be used within TripHomeRemindersProvider");
  }
  return context;
}
