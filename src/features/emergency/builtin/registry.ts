import { DEFAULT_EMERGENCY_PACK_ID } from "../constants";
import type { EmergencyPack } from "../types";
import { JP_EMERGENCY_PACK } from "./jp";

const PACKS: Record<string, EmergencyPack> = {
  [DEFAULT_EMERGENCY_PACK_ID]: JP_EMERGENCY_PACK,
};

export function getEmergencyPack(packId: string): EmergencyPack | null {
  return PACKS[packId] ?? null;
}

/** V1 default: Tabi explicitly uses the JP pack. No Trip country field yet. */
export function getDefaultEmergencyPack(): EmergencyPack {
  return JP_EMERGENCY_PACK;
}
