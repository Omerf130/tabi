import { z } from "zod";

const currencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Invalid currency code");

export const currencyPairQuerySchema = z
  .object({
    from: currencyCodeSchema,
    to: currencyCodeSchema,
  })
  .refine((value) => value.from !== value.to, {
    message: "from and to must differ",
  });

export type CurrencyPairQuery = z.infer<typeof currencyPairQuerySchema>;
