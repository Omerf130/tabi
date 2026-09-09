export type WeatherLocationRef = {
  label: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type WeatherCondition = {
  code: number;
  label: string;
  iconUrl: string;
};

export type WeatherCurrent = {
  temperatureC: number;
  feelsLikeC: number;
  condition: WeatherCondition;
  isDay: boolean;
};

export type WeatherDaySummary = {
  date: string;
  minTemperatureC: number;
  maxTemperatureC: number;
  condition: WeatherCondition;
  chanceOfRainPercent: number | null;
};

export type WeatherSnapshot = {
  location: WeatherLocationRef;
  current: WeatherCurrent;
  today: WeatherDaySummary;
  forecast: WeatherDaySummary[];
  observedAt: string;
};

export type WeatherPageInitialData = {
  tripId: string;
  defaultLocation: WeatherLocationRef;
  initialSnapshot: WeatherSnapshot | null;
};
