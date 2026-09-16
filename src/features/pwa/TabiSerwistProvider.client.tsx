"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import type { ReactNode } from "react";

type TabiSerwistProviderProps = {
  children: ReactNode;
};

export function TabiSerwistProvider({ children }: TabiSerwistProviderProps) {
  return (
    <SerwistProvider
      swUrl="/serwist/sw.js"
      disable={process.env.NODE_ENV === "development"}
      register
      cacheOnNavigation={false}
      reloadOnOnline={false}
      options={{ scope: "/" }}
    >
      {children}
    </SerwistProvider>
  );
}
