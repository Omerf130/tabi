/** Root-level read of Quick Add open state (synced from QuickAddProvider). */

let quickAddOverlayOpen = false;
const listeners = new Set<() => void>();

export function setQuickAddOverlayOpen(open: boolean): void {
  if (quickAddOverlayOpen === open) {
    return;
  }
  quickAddOverlayOpen = open;
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeQuickAddOverlayOpen(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getQuickAddOverlayOpenSnapshot(): boolean {
  return quickAddOverlayOpen;
}

export function getQuickAddOverlayOpenServerSnapshot(): boolean {
  return false;
}
