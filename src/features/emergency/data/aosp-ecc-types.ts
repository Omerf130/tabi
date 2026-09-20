/** AOSP ECC protobuf-text types we consume (subset). */

export const AOSP_ECC_SUPPORTED_TYPES = ["POLICE", "AMBULANCE", "FIRE"] as const;

export type AospEccSupportedType = (typeof AOSP_ECC_SUPPORTED_TYPES)[number];

export type AospEccRouting = "EMERGENCY" | "NORMAL" | undefined;

export type ParsedAospEccRow = {
  phoneNumber: string;
  types: AospEccSupportedType[];
  routing: AospEccRouting;
};

export type ParsedAospCountryBlock = {
  isoCode: string;
  eccRows: ParsedAospEccRow[];
  eccFallback: string | null;
};

export type ParsedAospEccFile = {
  revision: number;
  countries: ParsedAospCountryBlock[];
};
