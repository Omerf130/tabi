import { homeCurrencyPickerSelectedCode } from "./home-currency-picker-selection";

export function isHomeCurrencySaveEnabled(input: {
  draft: string | null;
  saved: string | null;
  pending: boolean;
}): boolean {
  if (input.pending || input.draft === null) {
    return false;
  }
  return input.draft !== input.saved;
}

export function isTripCurrencySaveEnabled(input: {
  draft: string;
  saved: string;
  pending: boolean;
}): boolean {
  if (input.pending) {
    return false;
  }
  return input.draft !== input.saved;
}

export function tripCurrencyPickerSelectedCode(draft: string): string {
  return draft;
}

export { homeCurrencyPickerSelectedCode };
