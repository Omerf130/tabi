import { describe, expect, it } from "vitest";
import {
  PUSH_NOTIFICATION_BODY_MAX_LENGTH,
  PUSH_NOTIFICATION_DEFAULT_BODY,
  PUSH_NOTIFICATION_DEFAULT_TITLE,
  PUSH_NOTIFICATION_FALLBACK_URL,
  PUSH_NOTIFICATION_TAG_MAX_LENGTH,
  PUSH_NOTIFICATION_TITLE_MAX_LENGTH,
} from "./push-notification-constants";
import { parsePushNotificationPayload } from "./parse-push-notification-payload";

function mockPushData(payload: unknown): PushMessageData {
  return {
    json: () => payload,
    text: () => JSON.stringify(payload),
  } as unknown as PushMessageData;
}

function mockPushDataJsonThrows(text: string): PushMessageData {
  return {
    json: () => {
      throw new Error("not json");
    },
    text: () => text,
  } as unknown as PushMessageData;
}

describe("parsePushNotificationPayload", () => {
  it("parses a valid payload", () => {
    const result = parsePushNotificationPayload(
      mockPushData({
        title: "Tabi",
        body: "You have a trip reminder",
        url: "/app/trips/507f1f77bcf86cd799439011",
        tag: "reminder-abc",
      }),
    );

    expect(result).toEqual({
      title: "Tabi",
      body: "You have a trip reminder",
      url: "/app/trips/507f1f77bcf86cd799439011",
      tag: "reminder-abc",
    });
  });

  it("uses defaults when payload is missing", () => {
    expect(parsePushNotificationPayload(null)).toEqual({
      title: PUSH_NOTIFICATION_DEFAULT_TITLE,
      body: PUSH_NOTIFICATION_DEFAULT_BODY,
      url: PUSH_NOTIFICATION_FALLBACK_URL,
    });
  });

  it("handles malformed JSON safely", () => {
    expect(
      parsePushNotificationPayload(mockPushDataJsonThrows("not-json")),
    ).toEqual({
      title: PUSH_NOTIFICATION_DEFAULT_TITLE,
      body: PUSH_NOTIFICATION_DEFAULT_BODY,
      url: PUSH_NOTIFICATION_FALLBACK_URL,
    });
  });

  it("truncates oversized title, body, and tag", () => {
    const long = "x".repeat(500);
    const result = parsePushNotificationPayload(
      mockPushData({
        title: long,
        body: long,
        tag: long,
        url: "/app",
      }),
    );

    expect(result.title.length).toBe(PUSH_NOTIFICATION_TITLE_MAX_LENGTH);
    expect(result.body.length).toBe(PUSH_NOTIFICATION_BODY_MAX_LENGTH);
    expect(result.tag?.length).toBe(PUSH_NOTIFICATION_TAG_MAX_LENGTH);
  });

  it("falls back when url is missing or unsafe", () => {
    expect(parsePushNotificationPayload(mockPushData({})).url).toBe(
      PUSH_NOTIFICATION_FALLBACK_URL,
    );
    expect(
      parsePushNotificationPayload(
        mockPushData({ url: "https://evil.example.com" }),
      ).url,
    ).toBe(PUSH_NOTIFICATION_FALLBACK_URL);
  });
});
