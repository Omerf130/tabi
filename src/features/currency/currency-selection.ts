export type CurrencyPanelSide = "from" | "to";

export type CurrencyPairState = {
  from: string;
  to: string;
};

export function resolveNextCurrencyPair(
  current: CurrencyPairState,
  side: CurrencyPanelSide,
  selectedCode: string,
): CurrencyPairState {
  if (side === "from") {
    if (selectedCode === current.to) {
      return { from: selectedCode, to: current.from };
    }

    return { from: selectedCode, to: current.to };
  }

  if (selectedCode === current.from) {
    return { from: current.to, to: selectedCode };
  }

  return { from: current.from, to: selectedCode };
}
