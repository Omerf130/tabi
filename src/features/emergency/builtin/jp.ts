import type { EmergencyResource } from "../types";

const PACK_ID = "JP";
const VERIFIED_AT = "2026-09-09";

const JNTO_SOURCE = {
  sourceLabel: "Japan National Tourism Organization (JNTO)",
  sourceUrl: "https://www.japan.travel/en/plan/hotline/",
  verifiedAt: VERIFIED_AT,
} as const;

const MFA_SOURCE = {
  sourceLabel: "Embassy of Israel in Tokyo — Ministry of Foreign Affairs",
  sourceUrl: "https://embassies.gov.il/tokyo/Pages/default.aspx",
  verifiedAt: VERIFIED_AT,
} as const;

function resource(
  id: string,
  kind: EmergencyResource["kind"],
  title: string,
  fields: Omit<EmergencyResource, "id" | "kind" | "title">,
): EmergencyResource {
  return {
    id,
    kind,
    title,
    ...fields,
  };
}

export const JP_EMERGENCY_RESOURCES: readonly EmergencyResource[] = [
  resource("jp.police", "police", "משטרה", {
    phone: "110",
    description: "חירום — משטרה",
    source: {
      sourceLabel: "National Police Agency of Japan",
      sourceUrl: "https://www.npa.go.jp/english/index.html",
      verifiedAt: VERIFIED_AT,
    },
  }),
  resource("jp.ambulance_fire", "ambulance_fire", "אמבולנס / כיבוי אש", {
    phone: "119",
    description: "חירום — אמבולנס או כיבוי אש",
    source: {
      sourceLabel: "Fire and Disaster Management Agency (FDMA)",
      sourceUrl: "https://www.fdma.go.jp/en/",
      verifiedAt: VERIFIED_AT,
    },
  }),
  resource("jp.tourist_hotline", "tourist_hotline", "קו סיוע לתיירים ביפן (JNTO)", {
    phone: "050-3816-2787",
    internationalPhone: "+81-50-3816-2787",
    availability: "24/7, 365 days",
    description:
      "סיוע בתאונות, מחלה, מצבי חירום, אסונות טבע ומידע תיירותי כללי.",
    source: JNTO_SOURCE,
  }),
  resource("jp.embassy_tokyo", "embassy_consular", "שגרירות ישראל בטוקיו", {
    phone: "03-3264-0911",
    address: "3 Nibanchō, Chiyoda City, Tokyo 102-0084, Japan",
    source: MFA_SOURCE,
  }),
  resource("jp.consular_tokyo", "embassy_consular", "מדור הקונסוליה", {
    phone: "03-3264-0197",
    email: "consular@tokyo.mfa.gov.il",
    address: "3 Nibanchō, Chiyoda City, Tokyo 102-0084, Japan",
    source: MFA_SOURCE,
  }),
];

export const JP_EMERGENCY_PACK = {
  id: PACK_ID,
  countryCode: "JP",
  label: "Japan",
  resources: JP_EMERGENCY_RESOURCES,
} as const;
