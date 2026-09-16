"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";

export function OfflineTryAgain() {
  const t = useTranslations("Offline");

  return (
    <Button
      type="button"
      variant="primary"
      onClick={() => {
        window.location.reload();
      }}
    >
      {t("tryAgain")}
    </Button>
  );
}
