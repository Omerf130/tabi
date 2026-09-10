"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/Button/Button";
import { deleteActivityAction, type ActivityActionState } from "./actions";
import { ACTIVITY_MESSAGES } from "./constants";
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
        if (!window.confirm(ACTIVITY_MESSAGES.deleteConfirm)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="activityId" value={activityId} />
      {state.error ? (
        <p className={styles.formError} role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" variant="ghost" size="compact" className={styles.deleteButton}>
        מחיקת פעילות
      </Button>
    </form>
  );
}
