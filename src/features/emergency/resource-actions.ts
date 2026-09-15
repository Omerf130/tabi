import { buildTelHref } from "@/lib/maps/google-maps-url";
import { buildNavigationUrl } from "@/lib/maps/navigation-url";
import {
  resolvePreferredMapsApp,
  type PreferredMapsApp,
} from "@/lib/maps/maps-app";
import type { EmergencyResourceAction } from "./types";

export type EmergencyResourceActionLabels = {
  openWebsite: string;
  openInMap: string;
  copyReference: string;
};

export function buildEmergencyResourceActions(input: {
  phone?: string;
  secondaryPhone?: string;
  internationalPhone?: string;
  email?: string;
  address?: string;
  url?: string;
  reference?: string;
}, labels: EmergencyResourceActionLabels, preferredMapsApp: PreferredMapsApp): EmergencyResourceAction[] {
  const provider = resolvePreferredMapsApp(preferredMapsApp);
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
      label: labels.openWebsite,
      href: value,
      value,
    });
  }

  if (input.address?.trim()) {
    const value = input.address.trim();
    const href = buildNavigationUrl({
      provider,
      address: value,
    });
    if (href) {
      actions.push({
        type: "address",
        label: labels.openInMap,
        href,
        value,
      });
    }
  }

  if (input.reference?.trim()) {
    actions.push({
      type: "copy",
      label: labels.copyReference,
      value: input.reference.trim(),
    });
  }

  return actions;
}
