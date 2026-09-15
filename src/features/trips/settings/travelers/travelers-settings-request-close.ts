/** Imperative dialog close used before syncing React `open` state (avoids showModal re-open races). */
export function closeDialogIfOpen(
  dialog: Pick<HTMLDialogElement, "open" | "close"> | null | undefined,
): void {
  if (dialog?.open) {
    dialog.close();
  }
}
