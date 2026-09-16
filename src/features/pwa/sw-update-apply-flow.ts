import type { Serwist } from "@serwist/window";
import { shouldReloadAfterControlling } from "./sw-update-state";

const SW_SCOPE = "/";

export type ApplySwUpdateInput = {
  serwist: Serwist;
  isApplyingUpdateRef: { current: boolean };
  getRegistration?: () => Promise<ServiceWorkerRegistration | undefined>;
  reload?: () => void;
};

export async function applySwUpdate({
  serwist,
  isApplyingUpdateRef,
  getRegistration = () =>
    "serviceWorker" in navigator
      ? navigator.serviceWorker.getRegistration(SW_SCOPE)
      : Promise.resolve(undefined),
  reload = () => {
    window.location.reload();
  },
}: ApplySwUpdateInput): Promise<boolean> {
  if (isApplyingUpdateRef.current) {
    return false;
  }

  if (!navigator.onLine) {
    return false;
  }

  const registration = await getRegistration();
  if (!registration?.waiting) {
    return false;
  }

  isApplyingUpdateRef.current = true;

  const onControlling = (event: { isExternal?: boolean }) => {
    if (
      !shouldReloadAfterControlling({
        userApprovedUpdate: isApplyingUpdateRef.current,
        isExternal: event.isExternal,
      })
    ) {
      return;
    }

    isApplyingUpdateRef.current = false;
    serwist.removeEventListener("controlling", onControlling);
    reload();
  };

  serwist.addEventListener("controlling", onControlling);
  serwist.messageSkipWaiting();
  return true;
}
