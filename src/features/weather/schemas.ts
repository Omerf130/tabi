import { z } from "zod";

export const weatherSearchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(3, "Query too short")
    .max(100, "Query too long"),
});

export const weatherLocationRefSchema = z.object({
  label: z.string().trim().min(1),
  region: z.string().trim().optional(),
  country: z.string().trim().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const weatherSnapshotQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  label: z.string().trim().min(1).optional(),
  region: z.string().trim().optional(),
  country: z.string().trim().min(1).optional(),
});

export type WeatherSearchQuery = z.infer<typeof weatherSearchQuerySchema>;
export type WeatherSnapshotQuery = z.infer<typeof weatherSnapshotQuerySchema>;
