import {
  CacheFirst,
  NetworkOnly,
  StaleWhileRevalidate,
  type RuntimeCaching,
  type SerwistPlugin,
} from "serwist";
import {
  classifyPwaRequest,
  PwaCachePolicy,
  toPwaRequestInput,
} from "./pwa-request-policy";

const denyPrivateOrNoStoreResponses: SerwistPlugin = {
  cacheWillUpdate: async ({ response }) => {
    if (!response || response.status !== 200) {
      return null;
    }

    const cacheControl = response.headers.get("Cache-Control") ?? "";
    if (/\bprivate\b/i.test(cacheControl) || /\bno-store\b/i.test(cacheControl)) {
      return null;
    }

    return response;
  },
};

const cachePlugins = [denyPrivateOrNoStoreResponses];

function matchesPolicy(
  request: Request,
  policy: PwaCachePolicy,
): boolean {
  return classifyPwaRequest(toPwaRequestInput(request)) === policy;
}

export function createTabiRuntimeCaching(): RuntimeCaching[] {
  return [
    {
      matcher: ({ request }) =>
        matchesPolicy(request, PwaCachePolicy.PublicStaleWhileRevalidate),
      handler: new StaleWhileRevalidate({ plugins: cachePlugins }),
    },
    {
      matcher: ({ request }) =>
        matchesPolicy(request, PwaCachePolicy.PublicCacheFirstStatic),
      handler: new CacheFirst({ plugins: cachePlugins }),
    },
    {
      matcher: () => true,
      handler: new NetworkOnly(),
    },
  ];
}
