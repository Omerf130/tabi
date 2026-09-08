export function resolveRequestOrigin(input: {
  host: string | null;
  forwardedHost: string | null;
  forwardedProto: string | null;
  configuredOrigin?: string;
}): string {
  const host = input.forwardedHost ?? input.host;
  const proto = input.forwardedProto ?? "http";

  if (host) {
    return `${proto}://${host}`;
  }

  if (input.configuredOrigin) {
    return input.configuredOrigin.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}
