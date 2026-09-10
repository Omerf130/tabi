export function buildGoogleAuthHref(nextPath?: string | null): string {
  if (nextPath) {
    return `/auth/google?next=${encodeURIComponent(nextPath)}`;
  }
  return "/auth/google";
}
