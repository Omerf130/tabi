/// <reference lib="esnext" />
/// <reference lib="webworker" />

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import {
  shouldServeOfflineDocumentFallback,
  toPwaRequestInput,
} from "../features/pwa/pwa-request-policy";
import { createTabiRuntimeCaching } from "../features/pwa/sw-runtime-caching";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // Wait for explicit SKIP_WAITING from the in-app update prompt (skipWaiting: false).
  // After approval, clientsClaim lets the new worker control open clients so
  // controllerchange / Serwist "controlling" can drive a single reload.
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: createTabiRuntimeCaching(),
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return shouldServeOfflineDocumentFallback(toPwaRequestInput(request));
        },
      },
    ],
  },
});

serwist.addEventListeners();
