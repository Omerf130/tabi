export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export type InstallInteraction = "native" | "ios-instructions" | "none";

export type PwaInstallAvailability = {
  isStandalone: boolean;
  hasDeferredPrompt: boolean;
  iosInstallEligible: boolean;
};
