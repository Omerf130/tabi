"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button/Button";
import {
  deleteTripEmergencyResourceAction,
  type TripEmergencyResourceActionState,
} from "./actions";
import { EMERGENCY_MESSAGES } from "./constants";
import { EmergencyResourceActions } from "./EmergencyResourceActions";
import { TripEmergencyResourceForm } from "./TripEmergencyResourceForm.client";
import type { TripEmergencyResourceViewModel } from "./types";
import styles from "./EmergencyPage.module.scss";

const initialState: TripEmergencyResourceActionState = {};

type CustomResourcesSectionProps = {
  tripId: string;
  resources: TripEmergencyResourceViewModel[];
};

export function CustomResourcesSection({
  tripId,
  resources,
}: CustomResourcesSectionProps) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteState, deleteAction] = useActionState(
    deleteTripEmergencyResourceAction,
    initialState,
  );

  useEffect(() => {
    if (deleteState.ok) {
      router.refresh();
    }
  }, [deleteState.ok, router]);

  function handleDelete(resourceId: string) {
    if (!window.confirm(EMERGENCY_MESSAGES.deleteConfirm)) {
      return;
    }
    const form = window.document.getElementById(
      `delete-emergency-resource-${resourceId}`,
    ) as HTMLFormElement | null;
    form?.requestSubmit();
  }

  return (
    <section className={styles.section}>
      <div className={styles.customHeader}>
        <h2 className={styles.sectionTitle}>{EMERGENCY_MESSAGES.myTripResources}</h2>
        {!showCreateForm ? (
          <Button type="button" size="compact" onClick={() => setShowCreateForm(true)}>
            + {EMERGENCY_MESSAGES.addResource}
          </Button>
        ) : null}
      </div>

      {showCreateForm ? (
        <TripEmergencyResourceForm
          tripId={tripId}
          onCancel={() => setShowCreateForm(false)}
        />
      ) : null}

      {resources.length === 0 && !showCreateForm ? (
        <p className={styles.empty}>{EMERGENCY_MESSAGES.noCustomResources}</p>
      ) : (
        <ul className={styles.resourceList}>
          {resources.map((resource) =>
            editingId === resource.id ? (
              <li key={resource.id} className={styles.resourceItem}>
                <TripEmergencyResourceForm
                  tripId={tripId}
                  resource={resource}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li key={resource.id} className={styles.resourceItem}>
                <p className={styles.resourceTitle} dir="auto">
                  {resource.title}
                </p>
                <p className={styles.resourceMeta}>{resource.categoryLabel}</p>
                {resource.notes ? (
                  <p className={styles.resourceMeta} dir="auto">
                    {resource.notes}
                  </p>
                ) : null}
                <EmergencyResourceActions actions={resource.actions} />
                <div className={styles.rowActions}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="compact"
                    onClick={() => setEditingId(resource.id)}
                  >
                    {EMERGENCY_MESSAGES.edit}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="compact"
                    onClick={() => handleDelete(resource.id)}
                  >
                    {EMERGENCY_MESSAGES.delete}
                  </Button>
                </div>
                <form
                  id={`delete-emergency-resource-${resource.id}`}
                  action={deleteAction}
                >
                  <input type="hidden" name="tripId" value={tripId} />
                  <input type="hidden" name="resourceId" value={resource.id} />
                </form>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}
