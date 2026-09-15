import type { AppLocale } from "@/features/i18n/locale";
import { findCurrencyOption } from "@/features/currency/currency-metadata";
import type { CurrencyOption } from "@/features/currency/types";
import {
  resolvePreferredMapsApp,
  type MapsApp,
  type PreferredMapsApp,
} from "@/lib/maps/maps-app";
import { buildUserProfileImageHref } from "@/features/account/profile-image/constants";
import { sanitizeProfileReturnTo } from "@/features/account/profile-return-to";

export type ProfileViewModel = {
  id: string;
  name: string;
  email: string;
  locale: AppLocale;
  homeCurrency: string | null;
  storedPreferredMapsApp: PreferredMapsApp;
  effectiveMapsApp: MapsApp;
  hasProfileImage: boolean;
  avatarHref?: string;
  backHref: string;
  homeCurrencyLabel: string;
  homeCurrencyMuted: boolean;
  localeLabel: string;
  mapsAppLabelKey: MapsApp;
};

type BuildProfileViewModelInput = {
  user: {
    id: string;
    name: string;
    email: string;
    locale: AppLocale;
    homeCurrency: string | null;
    preferredMapsApp: PreferredMapsApp;
    hasProfileImage: boolean;
  };
  returnTo: unknown;
  currencies: readonly CurrencyOption[];
  locale: AppLocale;
};

function formatHomeCurrencyLabel(
  homeCurrency: string | null,
  currencies: readonly CurrencyOption[],
  intlLocale: string,
): { label: string; muted: boolean } {
  if (!homeCurrency) {
    return { label: "", muted: true };
  }
  const option = findCurrencyOption(currencies, homeCurrency);
  if (!option) {
    return { label: homeCurrency, muted: false };
  }
  try {
    const display = new Intl.DisplayNames([intlLocale], { type: "currency" }).of(
      option.code,
    );
    return { label: display ? `${display} (${option.code})` : option.code, muted: false };
  } catch {
    return { label: option.code, muted: false };
  }
}

export function buildProfileViewModel({
  user,
  returnTo,
  currencies,
  locale,
}: BuildProfileViewModelInput): ProfileViewModel {
  const intlLocale = locale === "he" ? "he-IL" : "en-US";
  const { label: homeCurrencyLabel, muted: homeCurrencyMuted } =
    formatHomeCurrencyLabel(user.homeCurrency, currencies, intlLocale);
  const effectiveMapsApp = resolvePreferredMapsApp(user.preferredMapsApp);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    locale: user.locale,
    homeCurrency: user.homeCurrency,
    storedPreferredMapsApp: user.preferredMapsApp,
    effectiveMapsApp,
    hasProfileImage: user.hasProfileImage,
    avatarHref: user.hasProfileImage
      ? buildUserProfileImageHref(user.id)
      : undefined,
    backHref: sanitizeProfileReturnTo(returnTo),
    homeCurrencyLabel,
    homeCurrencyMuted,
    localeLabel: user.locale === "he" ? "עברית" : "English",
    mapsAppLabelKey: effectiveMapsApp,
  };
}
