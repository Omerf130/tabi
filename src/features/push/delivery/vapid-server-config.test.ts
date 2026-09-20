import { afterEach, describe, expect, it } from "vitest";
import {
  getVapidServerConfig,
  VapidConfigurationError,
} from "./vapid-server-config";

const ENV_KEYS = [
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_SUBJECT",
] as const;

describe("getVapidServerConfig", () => {
  const previous: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    }
  });

  it("throws when configuration is incomplete", () => {
    for (const key of ENV_KEYS) {
      previous[key] = process.env[key];
      delete process.env[key];
    }

    expect(() => getVapidServerConfig()).toThrow(VapidConfigurationError);
  });

  it("returns validated config when env is present", () => {
    for (const key of ENV_KEYS) {
      previous[key] = process.env[key];
    }

    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "public-key";
    process.env.VAPID_PRIVATE_KEY = "private-key";
    process.env.VAPID_SUBJECT = "mailto:ops@example.com";

    expect(getVapidServerConfig()).toEqual({
      subject: "mailto:ops@example.com",
      publicKey: "public-key",
      privateKey: "private-key",
    });
  });
});
