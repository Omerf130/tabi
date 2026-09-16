export enum PwaCachePolicy {
  NetworkOnly = "network-only",
  PublicCacheFirstStatic = "public-cache-first-static",
  PublicStaleWhileRevalidate = "public-stale-while-revalidate",
}

export const PUBLIC_STALE_WHILE_REVALIDATE_PREFIXES = [
  "/icons/",
  "/themes/",
  "/theme-atmosphere/",
  "/transport-visuals/",
  "/destination-visuals/",
] as const;

export type PwaRequestInput = {
  url: string;
  method: string;
  headers: Record<string, string | undefined>;
  destination?: RequestDestination;
  mode?: RequestMode;
};

const NON_DOCUMENT_FALLBACK_DESTINATIONS: ReadonlySet<RequestDestination> =
  new Set([
    "audio",
    "audioworklet",
    "font",
    "image",
    "manifest",
    "object",
    "paintworklet",
    "script",
    "style",
    "track",
    "video",
    "worker",
    "xslt",
  ]);

export function parsePwaRequestUrl(url: string): URL {
  return new URL(url, "https://tabi.local");
}

export function getPwaPathname(url: string): string {
  return parsePwaRequestUrl(url).pathname;
}

export function isServerActionRequest(input: PwaRequestInput): boolean {
  if (input.method.toUpperCase() !== "POST") {
    return false;
  }

  return Boolean(input.headers["next-action"] ?? input.headers["Next-Action"]);
}

export function isRscRequest(input: PwaRequestInput): boolean {
  const accept = input.headers["accept"] ?? input.headers["Accept"] ?? "";
  const parsed = parsePwaRequestUrl(input.url);

  return (
    input.headers["rsc"] === "1" ||
    input.headers["RSC"] === "1" ||
    accept.includes("text/x-component") ||
    parsed.searchParams.has("_rsc")
  );
}

export function isPrivateAppPath(pathname: string): boolean {
  return (
    pathname === "/app" ||
    pathname.startsWith("/app/") ||
    pathname.startsWith("/auth/") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/invite/")
  );
}

export function isExplicitNetworkOnlyPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/image") || pathname.startsWith("/serwist/")
  );
}

export function isPublicStaleWhileRevalidatePath(pathname: string): boolean {
  return PUBLIC_STALE_WHILE_REVALIDATE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
}

export function isPublicCacheFirstStaticPath(pathname: string): boolean {
  return pathname.startsWith("/_next/static/");
}

export function isPublicCacheEligiblePath(pathname: string): boolean {
  return (
    isPublicCacheFirstStaticPath(pathname) ||
    isPublicStaleWhileRevalidatePath(pathname)
  );
}

export function classifyPwaRequest(input: PwaRequestInput): PwaCachePolicy {
  const pathname = getPwaPathname(input.url);
  const method = input.method.toUpperCase();

  if (method === "POST") {
    return PwaCachePolicy.NetworkOnly;
  }

  if (isServerActionRequest(input)) {
    return PwaCachePolicy.NetworkOnly;
  }

  if (isRscRequest(input)) {
    return PwaCachePolicy.NetworkOnly;
  }

  if (isExplicitNetworkOnlyPath(pathname) || isPrivateAppPath(pathname)) {
    return PwaCachePolicy.NetworkOnly;
  }

  if (input.destination === "document") {
    return PwaCachePolicy.NetworkOnly;
  }

  if (isPublicCacheFirstStaticPath(pathname)) {
    return PwaCachePolicy.PublicCacheFirstStatic;
  }

  if (isPublicStaleWhileRevalidatePath(pathname)) {
    return PwaCachePolicy.PublicStaleWhileRevalidate;
  }

  return PwaCachePolicy.NetworkOnly;
}

export function toPwaRequestInput(request: Request): PwaRequestInput {
  const headers: Record<string, string | undefined> = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  return {
    url: request.url,
    method: request.method,
    headers,
    destination: request.destination,
    mode: request.mode,
  };
}

export function isOfflineFallbackPath(pathname: string): boolean {
  return pathname === "/offline" || pathname.startsWith("/offline/");
}

export function shouldServeOfflineDocumentFallback(
  input: PwaRequestInput,
): boolean {
  if (input.method.toUpperCase() !== "GET") {
    return false;
  }

  if (isServerActionRequest(input)) {
    return false;
  }

  if (isRscRequest(input)) {
    return false;
  }

  const pathname = getPwaPathname(input.url);

  if (isOfflineFallbackPath(pathname)) {
    return false;
  }

  if (isExplicitNetworkOnlyPath(pathname)) {
    return false;
  }

  if (pathname.startsWith("/app/api/")) {
    return false;
  }

  if (
    input.destination &&
    NON_DOCUMENT_FALLBACK_DESTINATIONS.has(input.destination)
  ) {
    return false;
  }

  if (input.mode === "navigate") {
    return true;
  }

  if (input.destination === "document") {
    return true;
  }

  return false;
}
