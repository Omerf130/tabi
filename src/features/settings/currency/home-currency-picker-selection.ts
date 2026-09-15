/** Maps unset home-currency draft to CurrencyPicker selectedCode (no preselection). */
export function homeCurrencyPickerSelectedCode(draft: string | null): string {
  return draft ?? "";
}
