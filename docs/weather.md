# Weather (Phase 13)

Trip-scoped travel weather at `/app/trips/[tripId]/weather`.

## Product note

Phase 13 UI is **functional, not final**. A later dedicated Product Polish phase may significantly redesign cards, layouts, icons, and tool presentation. Weather business logic, normalized types, and provider boundaries remain stable across that redesign.

## Provider

WeatherAPI.com via server-only fetch ([`src/features/weather/weatherapi.server.ts`](../src/features/weather/weatherapi.server.ts)).

- Env: `WEATHER_API_KEY` (server-side only; configure in Vercel Production/Preview for deployment)
- Endpoints used in V1:
  - `GET /v1/search.json` — location search
  - `GET /v1/forecast.json?days=3` — current + 3-day forecast
- Client never calls WeatherAPI directly

## Coordinate-based core

The reusable weather contract is coordinate-based:

```typescript
type WeatherLocationRef = {
  label: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
};
```

`getWeatherSnapshot(location)` queries WeatherAPI with `q={latitude},{longitude}`.

Future contextual weather (Accommodation, Activity, GPS) can supply coordinates without WeatherAPI-specific IDs.

## Defaults and preferences

- First-use default: **Tokyo, Japan** (coordinates only)
- Browser preference: `tabi.weather.v1.location` (normalized `WeatherLocationRef` JSON)
- No MongoDB

## Cache

| Data | Revalidation |
|------|--------------|
| Snapshot | 15 minutes |
| Search | 24 hours |

Client session also caches loaded snapshots by coordinate key.

## Authorization

`requireTripMember` — owners and members may use Weather.

## Travel Hub

**מזג אוויר** is active and links to `/weather`. Bottom nav **עוד** remains active.
