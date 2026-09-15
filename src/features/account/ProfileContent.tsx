import { getLocale, getTranslations } from "next-intl/server";
import { requireUser } from "@/features/auth/session";
import { getSupportedCurrencies } from "@/features/currency/queries";
import { resolveAppLocale } from "@/features/i18n/locale";
import { buildProfileViewModel } from "@/features/account/build-profile-view-model";
import { loadProfileUserRecord } from "@/features/account/load-profile-user";
import { AccountShell } from "@/features/account/AccountShell";
import { ProfileClient } from "@/features/account/Profile.client";

type ProfileContentProps = {
  returnTo: unknown;
};

export async function ProfileContent({ returnTo }: ProfileContentProps) {
  const sessionUser = await requireUser();
  const [record, currencies, rawLocale] = await Promise.all([
    loadProfileUserRecord(sessionUser.id),
    getSupportedCurrencies(),
    getLocale(),
  ]);
  const locale = resolveAppLocale(rawLocale);

  if (!record) {
    throw new Error("Profile user not found");
  }

  const model = buildProfileViewModel({
    user: record,
    returnTo,
    currencies,
    locale,
  });

  const t = await getTranslations("Profile");
  const tCommon = await getTranslations("Common");

  return (
    <AccountShell
      title={t("title")}
      backHref={model.backHref}
      backLabel={tCommon("back")}
    >
      <ProfileClient model={model} currencies={currencies} />
    </AccountShell>
  );
}
