import {
  generateSecureToken,
  hashToken,
} from "@/lib/crypto/tokens";

export function generateSessionToken(): string {
  return generateSecureToken();
}

export function hashSessionToken(token: string): string {
  return hashToken(token);
}
