import { describe, expect, it } from "vitest";
import {
  isValidEmergencyPhoneNumber,
  normalizeCountryEmergencyServices,
} from "./normalize-emergency-services";
import type { ParsedAospCountryBlock } from "./aosp-ecc-types";

describe("normalizeCountryEmergencyServices", () => {
  it("merges ambulance and fire on one number", () => {
    const country: ParsedAospCountryBlock = {
      isoCode: "XX",
      eccFallback: null,
      eccRows: [
        { phoneNumber: "119", types: ["AMBULANCE"], routing: undefined },
        { phoneNumber: "119", types: ["FIRE"], routing: undefined },
      ],
    };
    expect(normalizeCountryEmergencyServices(country)).toEqual([
      { id: "XX:ambulance_and_fire:119", category: "ambulance_and_fire", phone: "119" },
    ]);
  });

  it("merges police, ambulance, and fire into general", () => {
    const country: ParsedAospCountryBlock = {
      isoCode: "YY",
      eccFallback: null,
      eccRows: [
        { phoneNumber: "112", types: ["POLICE"], routing: undefined },
        { phoneNumber: "112", types: ["AMBULANCE"], routing: undefined },
        { phoneNumber: "112", types: ["FIRE"], routing: undefined },
      ],
    };
    expect(normalizeCountryEmergencyServices(country)).toEqual([
      { id: "YY:general:112", category: "general", phone: "112" },
    ]);
  });

  it("drops invalid phone numbers", () => {
    const country: ParsedAospCountryBlock = {
      isoCode: "ZZ",
      eccFallback: null,
      eccRows: [{ phoneNumber: "not-a-number", types: ["POLICE"], routing: undefined }],
    };
    expect(normalizeCountryEmergencyServices(country)).toEqual([]);
  });
});

describe("isValidEmergencyPhoneNumber", () => {
  it("accepts common short codes", () => {
    expect(isValidEmergencyPhoneNumber("112")).toBe(true);
    expect(isValidEmergencyPhoneNumber("911")).toBe(true);
    expect(isValidEmergencyPhoneNumber("110")).toBe(true);
  });

  it("rejects empty values", () => {
    expect(isValidEmergencyPhoneNumber("")).toBe(false);
  });
});
