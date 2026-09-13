"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  createTripListItemAction,
  deleteTripListItemAction,
  setTripListItemCompletedAction,
  updateTripListItemAction,
} from "./actions";
import { TRIP_LIST_ERROR_CODES, type TripListType } from "./constants";
import type { TripListItemViewModel } from "./types";
import styles from "./ListDetail.module.scss";

type ListChecklistProps = {
  tripId: string;
  listType: TripListType;
  initialItems: TripListItemViewModel[];
};

type OptimisticAction =
  | { type: "setCompleted"; itemId: string; isCompleted: boolean }
  | { type: "updateText"; itemId: string; text: string }
  | { type: "delete"; itemId: string }
  | { type: "add"; item: TripListItemViewModel };

function applyOptimisticAction(
  items: TripListItemViewModel[],
  action: OptimisticAction,
): TripListItemViewModel[] {
  switch (action.type) {
    case "setCompleted":
      return items.map((item) =>
        item.id === action.itemId
          ? { ...item, isCompleted: action.isCompleted }
          : item,
      );
    case "updateText":
      return items.map((item) =>
        item.id === action.itemId ? { ...item, text: action.text } : item,
      );
    case "delete":
      return items.filter((item) => item.id !== action.itemId);
    case "add":
      return [...items, action.item];
    default:
      return items;
  }
}

export function ListChecklist({
  tripId,
  listType,
  initialItems,
}: ListChecklistProps) {
  const t = useTranslations("Lists");
  const tErrors = useTranslations("Lists.errors");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newItemText, setNewItemText] = useState("");

  const [optimisticItems, setOptimisticItems] = useOptimistic(
    initialItems,
    applyOptimisticAction,
  );

  function resolveError(errorCode?: string) {
    if (!errorCode) {
      return tErrors(TRIP_LIST_ERROR_CODES.generic);
    }
    return tErrors(errorCode as "generic" | "notFound");
  }

  function handleSetCompleted(itemId: string, isCompleted: boolean) {
    startTransition(async () => {
      setOptimisticItems({ type: "setCompleted", itemId, isCompleted });
      const formData = new FormData();
      formData.set("tripId", tripId);
      formData.set("itemId", itemId);
      formData.set("isCompleted", String(isCompleted));
      const result = await setTripListItemCompletedAction({}, formData);
      if (result.ok) {
        setError(undefined);
        router.refresh();
        return;
      }
      setError(resolveError(result.errorCode));
      router.refresh();
    });
  }

  function handleStartEdit(item: TripListItemViewModel) {
    setEditingItemId(item.id);
    setEditText(item.text);
    setError(undefined);
  }

  function handleCancelEdit() {
    setEditingItemId(null);
    setEditText("");
  }

  function handleSaveEdit(itemId: string) {
    const trimmed = editText.trim();
    if (!trimmed) {
      return;
    }

    startTransition(async () => {
      setOptimisticItems({ type: "updateText", itemId, text: trimmed });
      const formData = new FormData();
      formData.set("tripId", tripId);
      formData.set("itemId", itemId);
      formData.set("text", trimmed);
      const result = await updateTripListItemAction({}, formData);
      if (result.ok) {
        setEditingItemId(null);
        setEditText("");
        setError(undefined);
        router.refresh();
        return;
      }
      setError(resolveError(result.errorCode));
      router.refresh();
    });
  }

  function handleDelete(itemId: string) {
    if (!window.confirm(t("deleteConfirm"))) {
      return;
    }

    startTransition(async () => {
      setOptimisticItems({ type: "delete", itemId });
      const formData = new FormData();
      formData.set("tripId", tripId);
      formData.set("itemId", itemId);
      const result = await deleteTripListItemAction({}, formData);
      if (result.ok) {
        setError(undefined);
        router.refresh();
        return;
      }
      setError(resolveError(result.errorCode));
      router.refresh();
    });
  }

  function handleAddItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = newItemText.trim();
    if (!trimmed) {
      return;
    }

    const optimisticItem: TripListItemViewModel = {
      id: `optimistic-${Date.now()}`,
      listType,
      text: trimmed,
      isCompleted: false,
      order: optimisticItems.length,
      createdAt: new Date().toISOString(),
    };

    startTransition(async () => {
      setOptimisticItems({ type: "add", item: optimisticItem });
      const formData = new FormData();
      formData.set("tripId", tripId);
      formData.set("listType", listType);
      formData.set("text", trimmed);
      const result = await createTripListItemAction({}, formData);
      if (result.ok) {
        setNewItemText("");
        setError(undefined);
        router.refresh();
        return;
      }
      setError(resolveError(result.errorCode));
      router.refresh();
    });
  }

  return (
    <div className={styles.checklist}>
      <ul className={styles.itemList}>
        {optimisticItems.map((item) => {
          const isEditing = editingItemId === item.id;

          return (
            <li key={item.id} className={styles.itemRow}>
              <label
                className={`${styles.itemLabel} ${item.isCompleted ? styles.itemLabelCompleted : ""}`}
              >
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={item.isCompleted}
                  disabled={isPending || isEditing}
                  onChange={(event) =>
                    handleSetCompleted(item.id, event.target.checked)
                  }
                  aria-label={
                    item.isCompleted
                      ? t("markIncompleteAriaLabel")
                      : t("markCompletedAriaLabel")
                  }
                />
                {isEditing ? (
                  <input
                    type="text"
                    className={styles.editInput}
                    value={editText}
                    onChange={(event) => setEditText(event.target.value)}
                    dir="auto"
                    autoFocus
                  />
                ) : (
                  <span className={styles.itemText} dir="auto">
                    {item.text}
                  </span>
                )}
              </label>

              <div className={styles.itemActions}>
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => handleSaveEdit(item.id)}
                      disabled={isPending}
                    >
                      {t("saveButton")}
                    </button>
                    <button
                      type="button"
                      className={styles.actionButtonMuted}
                      onClick={handleCancelEdit}
                      disabled={isPending}
                    >
                      {t("cancelButton")}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => handleStartEdit(item)}
                      disabled={isPending}
                    >
                      {t("editButton")}
                    </button>
                    <button
                      type="button"
                      className={styles.actionButtonDanger}
                      onClick={() => handleDelete(item.id)}
                      disabled={isPending}
                    >
                      {t("deleteButton")}
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <form className={styles.addForm} onSubmit={handleAddItem}>
        <input
          type="text"
          className={styles.addInput}
          value={newItemText}
          onChange={(event) => setNewItemText(event.target.value)}
          placeholder={t("addItemPlaceholder")}
          dir="auto"
          disabled={isPending}
        />
        <button type="submit" className={styles.addButton} disabled={isPending}>
          {t("addItemButton")}
        </button>
      </form>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
