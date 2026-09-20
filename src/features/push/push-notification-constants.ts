/** Shared Web Push display contract (Service Worker + future N3 sender). */

export const PUSH_NOTIFICATION_DEFAULT_TITLE = "Tabi";
export const PUSH_NOTIFICATION_DEFAULT_BODY = "You have a new notification";
export const PUSH_NOTIFICATION_FALLBACK_URL = "/app";

export const PUSH_NOTIFICATION_ICON_PATH = "/icons/icon-192.png";

export const PUSH_NOTIFICATION_TITLE_MAX_LENGTH = 64;
export const PUSH_NOTIFICATION_BODY_MAX_LENGTH = 240;
export const PUSH_NOTIFICATION_TAG_MAX_LENGTH = 128;
export const PUSH_NOTIFICATION_URL_MAX_LENGTH = 512;

export type PushNotificationPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

export type PushNotificationWirePayload = {
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
};
