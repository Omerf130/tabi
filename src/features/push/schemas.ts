import { z } from "zod";
import {
  PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH,
  PUSH_SUBSCRIPTION_KEY_MAX_LENGTH,
} from "./constants";

export const pushSubscriptionKeysSchema = z
  .object({
    p256dh: z
      .string()
      .trim()
      .min(1)
      .max(PUSH_SUBSCRIPTION_KEY_MAX_LENGTH),
    auth: z
      .string()
      .trim()
      .min(1)
      .max(PUSH_SUBSCRIPTION_KEY_MAX_LENGTH),
  })
  .strict();

export const pushSubscriptionInputSchema = z
  .object({
    endpoint: z
      .string()
      .trim()
      .url()
      .max(PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH),
    keys: pushSubscriptionKeysSchema,
  })
  .strict();

export const pushSubscriptionEndpointSchema = z
  .object({
    endpoint: z
      .string()
      .trim()
      .url()
      .max(PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH),
  })
  .strict();
