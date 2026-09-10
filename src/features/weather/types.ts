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

export type WeatherHourSummary = {
  time: string;
  temperatureC: number;
  condition: WeatherCondition;
  isDay: boolean;
};

export type WeatherSnapshot = {
  location: WeatherLocationRef;
  current: WeatherCurrent;
  today: WeatherDaySummary;
  forecast: WeatherDaySummary[];
  hourly: WeatherHourSummary[];
  observedAt: string;
};

export type WeatherPageInitialData = {
  tripId: string;
  defaultLocation: WeatherLocationRef;
  initialSnapshot: WeatherSnapshot | null;
};

export type WeatherPageProps = WeatherPageInitialData & {
  backHref: string;
};
