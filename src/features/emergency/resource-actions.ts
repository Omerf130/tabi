import { buildGoogleMapsSearchUrl, buildTelHref } from "@/lib/maps/google-maps-url";
import type { EmergencyResourceAction } from "./types";

export function buildEmergencyResourceActions(input: {
  phone?: string;
  secondaryPhone?: string;
  internationalPhone?: string;
  email?: string;
  address?: string;
  url?: string;
  reference?: string;
}): EmergencyResourceAction[] {
  const actions: EmergencyResourceAction[] = [];

  if (input.phone?.trim()) {
    const value = input.phone.trim();
    actions.push({
      type: "phone",
      label: value,
      href: buildTelHref(value),
      value,
    });
  }

  if (input.secondaryPhone?.trim()) {
    const value = input.secondaryPhone.trim();
    actions.push({
      type: "phone",
      label: value,
      href: buildTelHref(value),
      value,
    });
  }

  if (input.internationalPhone?.trim()) {
    const value = input.internationalPhone.trim();
    actions.push({
      type: "phone",
      label: value,
      href: buildTelHref(value),
      value,
    });
  }

  if (input.email?.trim()) {
    const value = input.email.trim();
    actions.push({
      type: "email",
      label: value,
      href: `mailto:${value}`,
      value,
    });
  }

  if (input.url?.trim()) {
    const value = input.url.trim();
    actions.push({
      type: "url",
      label: "פתיחת אתר",
      href: value,
      value,
    });
  }

  if (input.address?.trim()) {
    const value = input.address.trim();
    actions.push({
      type: "address",
      label: "פתיחה במפה",
      href: buildGoogleMapsSearchUrl(value),
      value,
    });
  }

  if (input.reference?.trim()) {
    actions.push({
      type: "copy",
      label: "העתקת מספר/אסמכתא",
      value: input.reference.trim(),
    });
  }

  return actions;
}
