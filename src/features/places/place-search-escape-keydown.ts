/** Escape handling for PlaceSearchField combobox input. */

export type PlaceSearchEscapeKeyEvent = {
  key: string;
  preventDefault: () => void;
  stopPropagation: () => void;
};

export function handlePlaceSearchEscapeKeyDown(
  event: PlaceSearchEscapeKeyEvent,
  suggestionsLength: number,
  callbacks: {
    dismissSuggestions: () => void;
    resetActiveIndex: () => void;
  },
): void {
  if (event.key !== "Escape") {
    return;
  }

  if (suggestionsLength > 0) {
    callbacks.dismissSuggestions();
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  callbacks.resetActiveIndex();
}
