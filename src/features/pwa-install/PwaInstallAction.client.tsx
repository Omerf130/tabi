"use client";

import { useTranslations } from "next-intl";
import { PwaInstallIosInstructions } from "./PwaInstallIosInstructions.client";
import styles from "./PwaInstall.module.scss";
import { usePwaInstall } from "./use-pwa-install.client";

type PwaInstallActionProps = {
  appearance?: "welcome" | "default";
  className?: string;
};

export function PwaInstallAction({
  appearance = "default",
  className,
}: PwaInstallActionProps) {
  const t = useTranslations("PwaInstall");
  const {
    visible,
    handleInstallClick,
    iosInstructionsOpen,
    closeIosInstructions,
    isPrompting,
  } = usePwaInstall();

  if (!visible) {
    return null;
  }

  const buttonClassName = [
    appearance === "welcome" ? styles.welcomeInstallButton : styles.installButton,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <button
        type="button"
        className={buttonClassName}
        onClick={() => {
          void handleInstallClick();
        }}
        disabled={isPrompting}
        aria-busy={isPrompting || undefined}
      >
        {t("cta")}
      </button>
      <PwaInstallIosInstructions
        open={iosInstructionsOpen}
        onClose={closeIosInstructions}
      />
    </>
  );
}
