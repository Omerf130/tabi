export type CurrencyOption = {
  code: string;
  symbol: string;
  englishName: string;
  hebrewName: string;
};

export type ExchangeRate = {
  from: string;
  to: string;
  rate: number;
  date: string;
};

export type CurrencyConverterInitialData = {
  tripId: string;
  currencies: CurrencyOption[];
  initialFrom: string;
  initialTo: string;
  initialAmount: string;
  initialRate: ExchangeRate | null;
};
