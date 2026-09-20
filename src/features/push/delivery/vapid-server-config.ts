import "server-only";

const VAPID_SUBJECT_PATTERN =
  /^(mailto:.+@.+|https?:\/\/[^\s/]+(?:\/[^\s]*)?)$/i;

export class VapidConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VapidConfigurationError";
  }
}

export type VapidServerConfig = {
  subject: string;
  publicKey: string;
  privateKey: string;
};

export function getVapidServerConfig(): VapidServerConfig {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim();

  if (!publicKey) {
    throw new VapidConfigurationError("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured");
  }
  if (!privateKey) {
    throw new VapidConfigurationError("VAPID_PRIVATE_KEY is not configured");
  }
  if (!subject || !VAPID_SUBJECT_PATTERN.test(subject)) {
    throw new VapidConfigurationError("VAPID_SUBJECT must be a mailto: or https: contact URI");
  }

  return { subject, publicKey, privateKey };
}
