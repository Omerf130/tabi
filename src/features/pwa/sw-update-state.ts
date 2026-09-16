export type SwUpdatePromptState = {
  hasWaitingWorker: boolean;
  isFirstInstallWaiting: boolean;
  dismissedForSession: boolean;
  isApplyingUpdate: boolean;
};

export function isWaitingWorkerUpdate(hasController: boolean): boolean {
  return hasController;
}

export function shouldShowSwUpdatePrompt(state: SwUpdatePromptState): boolean {
  if (!state.hasWaitingWorker) {
    return false;
  }

  if (state.isFirstInstallWaiting) {
    return false;
  }

  if (state.isApplyingUpdate) {
    return false;
  }

  if (state.dismissedForSession) {
    return false;
  }

  return true;
}

export function shouldEnableUpdateNow(isOnline: boolean, isApplying: boolean): boolean {
  return isOnline && !isApplying;
}

export function shouldReloadAfterControlling(input: {
  userApprovedUpdate: boolean;
  isExternal: boolean | undefined;
}): boolean {
  if (!input.userApprovedUpdate) {
    return false;
  }

  if (input.isExternal) {
    return false;
  }

  return true;
}
