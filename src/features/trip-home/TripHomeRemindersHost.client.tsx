"use client";

import type { ReactNode } from "react";
import { TripHomeRemindersProvider, useTripHomeReminders } from "./TripHomeRemindersContext.client";
import { TripHomeRemindersManager } from "./TripHomeRemindersManager.client";
import type { TripHomeRemindersManagerData } from "./types";

type TripHomeRemindersHostProps = {
  managerData: TripHomeRemindersManagerData;
  children: ReactNode;
};

function TripHomeRemindersManagerMount() {
  const { isOpen, closeManager, managerData, initialTab, sessionKey } =
    useTripHomeReminders();

  return (
    <TripHomeRemindersManager
      key={sessionKey}
      isOpen={isOpen}
      onClose={closeManager}
      managerData={managerData}
      initialTab={initialTab}
    />
  );
}

export function TripHomeRemindersHost({
  managerData,
  children,
}: TripHomeRemindersHostProps) {
  return (
    <TripHomeRemindersProvider managerData={managerData}>
      {children}
      <TripHomeRemindersManagerMount />
    </TripHomeRemindersProvider>
  );
}
