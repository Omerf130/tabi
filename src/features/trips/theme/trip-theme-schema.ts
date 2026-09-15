import { z } from "zod";
import { TRIP_THEME_KEYS } from "./trip-theme-keys";

export const tripThemeKeySchema = z.enum(TRIP_THEME_KEYS);

export type TripThemeKeyInput = z.infer<typeof tripThemeKeySchema>;
