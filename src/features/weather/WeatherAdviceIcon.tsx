import type { TravelWeatherAdviceIcon } from "./build-travel-weather-advice";

type WeatherAdviceIconProps = {
  kind: TravelWeatherAdviceIcon;
  className?: string;
};

const stroke = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function WeatherAdviceIcon({ kind, className }: WeatherAdviceIconProps) {
  switch (kind) {
    case "umbrella":
      return (
        <svg {...stroke} className={className} aria-hidden>
          <path d="M12 13v6" />
          <path d="M7.5 13a4.5 4.5 0 0 1 9 0" />
          <path d="M12 7.5V5.5" />
        </svg>
      );
    case "water":
      return (
        <svg {...stroke} className={className} aria-hidden>
          <path d="M12 4.5c2.5 4 4.5 6.5 4.5 9a4.5 4.5 0 1 1-9 0c0-2.5 2-5 4.5-9Z" />
        </svg>
      );
    case "jacket":
      return (
        <svg {...stroke} className={className} aria-hidden>
          <path d="M9 6.5 7 8v11h10V8l-2-1.5" />
          <path d="M9 6.5h6" />
          <path d="M12 6.5V4.5" />
          <path d="M9 11h6" />
        </svg>
      );
    case "layer":
      return (
        <svg {...stroke} className={className} aria-hidden>
          <path d="M12 5.5 5 9l7 3.5L19 9l-7-3.5Z" />
          <path d="M5 13l7 3.5L19 13" />
        </svg>
      );
    case "comfort":
      return (
        <svg {...stroke} className={className} aria-hidden>
          <circle cx="12" cy="12" r="3.25" />
          <path d="M12 4.5v1.75M12 17.75V19.5M4.5 12h1.75M17.75 12H19.5" />
        </svg>
      );
  }
}
