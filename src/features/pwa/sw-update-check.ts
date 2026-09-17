/** Runs an explicit SW update check; failures must not break the app. */
export async function runSerwistUpdateCheck(serwist: {
  update: () => Promise<void>;
}): Promise<void> {
  try {
    await serwist.update();
  } catch {
    // Update checks can fail offline or when throttled; visibility/mount may retry.
  }
}

declare global {
  interface Window {
    __tabiSwStartupUpdateDone?: boolean;
  }
}

/** One startup update check per full page load (avoids Strict Mode double-invoke in dev). */
export function shouldRunStartupSerwistUpdate(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  if (window.__tabiSwStartupUpdateDone) {
    return false;
  }
  window.__tabiSwStartupUpdateDone = true;
  return true;
}
