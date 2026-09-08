import "server-only";

import { headers } from "next/headers";
import { resolveRequestOrigin } from "./request-origin";

export async function getRequestOrigin(): Promise<string> {
  const headerStore = await headers();

  return resolveRequestOrigin({
    host: headerStore.get("host"),
    forwardedHost: headerStore.get("x-forwarded-host"),
    forwardedProto: headerStore.get("x-forwarded-proto"),
    configuredOrigin: process.env.NEXT_PUBLIC_APP_ORIGIN,
  });
}
