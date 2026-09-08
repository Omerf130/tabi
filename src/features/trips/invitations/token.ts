import "server-only";

export function buildInviteUrl(rawToken: string, origin?: string): string {
  const base =
    origin ??
    process.env.NEXT_PUBLIC_APP_ORIGIN ??
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/invite/${rawToken}`;
}
