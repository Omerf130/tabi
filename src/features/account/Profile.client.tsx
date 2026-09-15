"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  IconCurrency,
  IconDictionary,
  IconMail,
  IconMembers,
  IconNavigation,
} from "@/components/ui/icons";
import { logoutAction } from "@/features/auth/actions";
import { updateUserNameAction } from "@/features/account/actions/update-user-name";
import {
  removeUserProfileImageAction,
  uploadUserProfileImageAction,
} from "@/features/account/actions/profile-image-actions";
import type { ProfileViewModel } from "@/features/account/build-profile-view-model";
import { UserAvatar } from "@/features/account/UserAvatar";
import { updateUserHomeCurrencyAction } from "@/features/currency/actions/update-user-home-currency";
import { CurrencyPickerList } from "@/features/currency/CurrencyPickerList.client";
import type { CurrencyOption } from "@/features/currency/types";
import { InterfaceLanguagePreference } from "@/features/i18n/components/InterfaceLanguagePreference";
import { PreferredMapsAppPreference } from "@/features/maps/components/PreferredMapsAppPreference";
import {
  homeCurrencyPickerSelectedCode,
  isHomeCurrencySaveEnabled,
} from "@/features/settings/currency/currency-settings-save-state";
import { TripDetailsSettingsRow } from "@/features/trips/settings/trip-details/TripDetailsSettingsRow";
import tripDetailsStyles from "@/features/trips/settings/trip-details/TripDetailsSettings.module.scss";
import { TravelersSettingsSheet } from "@/features/trips/settings/travelers/TravelersSettingsSheet.client";
import travelerSheetStyles from "@/features/trips/settings/travelers/TravelersSettings.module.scss";
import styles from "./Profile.module.scss";

type ProfileClientProps = {
  model: ProfileViewModel;
  currencies: readonly CurrencyOption[];
};

export function ProfileClient({ model, currencies }: ProfileClientProps) {
  const t = useTranslations("Profile");
  const tCommon = useTranslations("Common");
  const tSettings = useTranslations("Settings");
  const router = useRouter();
  const tCurrency = useTranslations("CurrencySettings");
  const fileInputId = useId();
  const prevLocaleRef = useRef(model.locale);
  const prevMapsRef = useRef(model.storedPreferredMapsApp);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  const [nameSheetOpen, setNameSheetOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(model.name);
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false);
  const [currencySheetOpen, setCurrencySheetOpen] = useState(false);
  const [homeCurrencyDraft, setHomeCurrencyDraft] = useState<string | null>(
    model.homeCurrency,
  );
  const [mapsSheetOpen, setMapsSheetOpen] = useState(false);
  const [removePhotoOpen, setRemovePhotoOpen] = useState(false);

  const [nameState, nameDispatch] = useActionState(updateUserNameAction, {});
  const [uploadState, uploadDispatch] = useActionState(
    uploadUserProfileImageAction,
    {},
  );
  const [removeState, removeDispatch] = useActionState(
    removeUserProfileImageAction,
    {},
  );
  const [homeState, homeDispatch] = useActionState(
    updateUserHomeCurrencyAction,
    {},
  );

  useEffect(() => {
    if (nameState.ok || homeState.ok || uploadState.ok || removeState.ok) {
      router.refresh();
    }
  }, [nameState.ok, homeState.ok, uploadState.ok, removeState.ok, router]);

  useEffect(() => {
    if (prevLocaleRef.current !== model.locale) {
      prevLocaleRef.current = model.locale;
      setLanguageSheetOpen(false);
    }
  }, [model.locale]);

  useEffect(() => {
    if (prevMapsRef.current !== model.storedPreferredMapsApp) {
      prevMapsRef.current = model.storedPreferredMapsApp;
      setMapsSheetOpen(false);
    }
  }, [model.storedPreferredMapsApp]);

  function openNameSheet() {
    setNameDraft(model.name);
    setNameSheetOpen(true);
  }

  function closeNameSheet() {
    setNameSheetOpen(false);
    setNameDraft(model.name);
  }

  function openCurrencySheet() {
    setHomeCurrencyDraft(model.homeCurrency);
    setCurrencySheetOpen(true);
  }

  function closeCurrencySheet() {
    setCurrencySheetOpen(false);
    setHomeCurrencyDraft(model.homeCurrency);
  }

  function saveName() {
    const trimmed = nameDraft.trim();
    if (trimmed.length < 2 || trimmed.length > 80) {
      return;
    }
    setNameSheetOpen(false);
    startTransition(() => {
      const formData = new FormData();
      formData.set("name", trimmed);
      nameDispatch(formData);
    });
  }

  function saveHomeCurrency() {
    if (
      !isHomeCurrencySaveEnabled({
        draft: homeCurrencyDraft,
        saved: model.homeCurrency,
        pending,
      })
    ) {
      return;
    }
    setCurrencySheetOpen(false);
    startTransition(() => {
      const formData = new FormData();
      formData.set("homeCurrency", homeCurrencyDraft!);
      homeDispatch(formData);
    });
  }

  function onFileSelected() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      return;
    }
    startTransition(() => {
      uploadFormRef.current?.requestSubmit();
    });
  }

  function confirmRemovePhoto() {
    setRemovePhotoOpen(false);
    startTransition(() => {
      removeDispatch(new FormData());
    });
  }

  const uploadError = uploadState.errorCode
    ? t(`errors.${uploadState.errorCode}`)
    : null;
  const removeError = removeState.errorCode ? t("errors.generic") : null;
  const nameError = nameState.errorCode === "invalid_name" ? t("errors.invalidName") : null;

  const homeCurrencyValue = model.homeCurrencyMuted
    ? t("notSelected")
    : model.homeCurrencyLabel;

  const mapsLabel = tSettings(`mapsPage.providers.${model.mapsAppLabelKey}`);

  function renderPickerFooter(
    onCancel: () => void,
    onSave: () => void,
    saveDisabled: boolean,
  ) {
    return (
      <div className={travelerSheetStyles.sheetFootActions}>
        <button
          type="button"
          className={travelerSheetStyles.sheetCancel}
          onClick={onCancel}
        >
          {tCommon("cancel")}
        </button>
        <button
          type="button"
          className={travelerSheetStyles.sheetSaveSecondary}
          disabled={saveDisabled}
          onClick={onSave}
        >
          {tCommon("save")}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section aria-labelledby="profile-identity-label">
        <h2 id="profile-identity-label" className={styles.sectionLabel}>
          {t("identitySection")}
        </h2>
        <div className={styles.group}>
          <div className={styles.identity}>
            <UserAvatar
              name={model.name}
              avatarHref={model.avatarHref}
              size="lg"
            />
            <p className={styles.identityName} dir="auto">
              {model.name}
            </p>
            <p className={styles.identityEmail} dir="ltr">
              {model.email}
            </p>
            <div className={styles.photoActions}>
              <label htmlFor={fileInputId} className={styles.photoAction}>
                {model.hasProfileImage ? t("changePhoto") : t("uploadPhoto")}
              </label>
              {model.hasProfileImage ? (
                <button
                  type="button"
                  className={styles.photoActionDanger}
                  disabled={pending}
                  onClick={() => setRemovePhotoOpen(true)}
                >
                  {t("removePhoto")}
                </button>
              ) : null}
            </div>
            {uploadError ? (
              <p className={styles.inlineError} role="alert">
                {uploadError}
              </p>
            ) : null}
            {removeError ? (
              <p className={styles.inlineError} role="alert">
                {removeError}
              </p>
            ) : null}
          </div>
        </div>
        <form
          ref={uploadFormRef}
          action={uploadDispatch}
          encType="multipart/form-data"
          hidden
        >
          <input
            ref={fileInputRef}
            id={fileInputId}
            className={styles.hiddenFileInput}
            type="file"
            name="profileImage"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFileSelected}
            disabled={pending}
          />
        </form>
      </section>

      <section aria-labelledby="profile-personal-label">
        <h2 id="profile-personal-label" className={styles.sectionLabel}>
          {t("personalDetails")}
        </h2>
        <div className={styles.group} role="list">
          <TripDetailsSettingsRow
            label={t("name")}
            value={model.name}
            icon={<IconMembers className={tripDetailsStyles.rowIconSvg} />}
            onPress={openNameSheet}
            showChevron
            dir="auto"
          />
          <TripDetailsSettingsRow
            label={t("email")}
            value={model.email}
            icon={<IconMail className={tripDetailsStyles.rowIconSvg} />}
            dir="ltr"
          />
        </div>
        <p className={styles.emailHint}>{t("emailReadOnlyHint")}</p>
      </section>

      <section aria-labelledby="profile-preferences-label">
        <h2 id="profile-preferences-label" className={styles.sectionLabel}>
          {t("preferences")}
        </h2>
        <div className={styles.group} role="list">
          <TripDetailsSettingsRow
            label={t("language")}
            value={model.localeLabel}
            icon={<IconDictionary className={tripDetailsStyles.rowIconSvg} />}
            onPress={() => setLanguageSheetOpen(true)}
            showChevron
          />
          <TripDetailsSettingsRow
            label={t("myCurrency")}
            value={homeCurrencyValue}
            icon={<IconCurrency className={tripDetailsStyles.rowIconSvg} />}
            valueMuted={model.homeCurrencyMuted}
            onPress={openCurrencySheet}
            showChevron
            dir="auto"
          />
          <TripDetailsSettingsRow
            label={t("navigation")}
            value={mapsLabel}
            icon={<IconNavigation className={tripDetailsStyles.rowIconSvg} />}
            onPress={() => setMapsSheetOpen(true)}
            showChevron
          />
        </div>
      </section>

      <section aria-labelledby="profile-account-label">
        <h2 id="profile-account-label" className={styles.sectionLabel}>
          {t("accountSection")}
        </h2>
        <div className={styles.group}>
          <form action={logoutAction} className={styles.logoutForm}>
            <button type="submit" className={styles.logoutButton}>
              {t("logout")}
            </button>
          </form>
        </div>
      </section>

      {nameSheetOpen ? (
        <TravelersSettingsSheet
          open
          title={t("name")}
          onClose={closeNameSheet}
          footer={() =>
            renderPickerFooter(
              closeNameSheet,
              saveName,
              nameDraft.trim().length < 2 || nameDraft.trim().length > 80 || pending,
            )
          }
        >
          <div className={tripDetailsStyles.formField}>
            <label className={tripDetailsStyles.formLabel} htmlFor="profile-name">
              {t("name")}
            </label>
            <input
              id="profile-name"
              name="name"
              type="text"
              className={tripDetailsStyles.input}
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              minLength={2}
              maxLength={80}
              aria-invalid={nameError ? true : undefined}
              autoComplete="name"
            />
            {nameError ? (
              <p className={styles.inlineError} role="alert">
                {nameError}
              </p>
            ) : null}
          </div>
        </TravelersSettingsSheet>
      ) : null}

      {languageSheetOpen ? (
        <TravelersSettingsSheet
          open
          title={t("language")}
          lead={tSettings("languagePage.sectionHint")}
          onClose={() => setLanguageSheetOpen(false)}
        >
          <InterfaceLanguagePreference
            currentLocale={model.locale}
            variant="settingsList"
          />
        </TravelersSettingsSheet>
      ) : null}

      {currencySheetOpen ? (
        <TravelersSettingsSheet
          open
          variant="picker"
          title={
            model.homeCurrency
              ? tCurrency("changeMyCurrency")
              : tCurrency("chooseMyCurrency")
          }
          lead={tCurrency("pickerHint")}
          onClose={closeCurrencySheet}
          footer={() =>
            renderPickerFooter(
              closeCurrencySheet,
              saveHomeCurrency,
              !isHomeCurrencySaveEnabled({
                draft: homeCurrencyDraft,
                saved: model.homeCurrency,
                pending,
              }),
            )
          }
        >
          <CurrencyPickerList
            currencies={currencies}
            selectedCode={homeCurrencyPickerSelectedCode(homeCurrencyDraft)}
            onSelect={(code) => setHomeCurrencyDraft(code)}
            embeddedInSheet
          />
        </TravelersSettingsSheet>
      ) : null}

      {mapsSheetOpen ? (
        <TravelersSettingsSheet
          open
          title={t("navigation")}
          lead={tSettings("mapsPage.sectionHint")}
          onClose={() => setMapsSheetOpen(false)}
        >
          <PreferredMapsAppPreference
            storedPreferredMapsApp={model.storedPreferredMapsApp ?? null}
            variant="settingsList"
          />
        </TravelersSettingsSheet>
      ) : null}

      {removePhotoOpen ? (
        <TravelersSettingsSheet
          open
          title={t("removePhotoConfirmTitle")}
          onClose={() => setRemovePhotoOpen(false)}
          footer={() => (
            <div className={travelerSheetStyles.sheetFootActions}>
              <button
                type="button"
                className={travelerSheetStyles.sheetCancel}
                onClick={() => setRemovePhotoOpen(false)}
              >
                {tCommon("cancel")}
              </button>
              <button
                type="button"
                className={travelerSheetStyles.sheetSaveSecondary}
                disabled={pending}
                onClick={confirmRemovePhoto}
              >
                {t("removePhotoConfirmAction")}
              </button>
            </div>
          )}
        >
          <p className={styles.confirmLead}>{t("removePhotoConfirmBody")}</p>
        </TravelersSettingsSheet>
      ) : null}
    </div>
  );
}
