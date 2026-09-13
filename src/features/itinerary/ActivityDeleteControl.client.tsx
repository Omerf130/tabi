"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import { deleteActivityAction, type ActivityActionState } from "./actions";
import { ACTIVITY_ERROR_CODES } from "./constants";
import { translateActivityError } from "./translate-activity-error";
import styles from "./ActivityForm.module.scss";

const initialState: ActivityActionState = {};

type ActivityDeleteControlProps = {
  tripId: string;
  activityId: string;
  onSuccess?: () => void;
};

export function ActivityDeleteControl({
  tripId,
  activityId,
  onSuccess,
}: ActivityDeleteControlProps) {
  const t = useTranslations("Activity");
  const [state, formAction] = useActionState(deleteActivityAction, initialState);

  useEffect(() => {
    if (state.ok && onSuccess) {
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <form
      action={formAction}
      className={styles.deleteForm}
      onSubmit={(event) => {
        if (!window.confirm(t(`errors.${ACTIVITY_ERROR_CODES.deleteConfirm}`))) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="activityId" value={activityId} />
      {state.error ? (
        <p className={styles.formError} role="alert">
          {translateActivityError(t, state.error)}
        </p>
      ) : null}
      <Button type="submit" variant="ghost" size="compact" className={styles.deleteButton}>
        {t("deleteActivity")}
      </Button>
    </form>
  );
}
