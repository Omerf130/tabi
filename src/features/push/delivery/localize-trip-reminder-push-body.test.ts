import { describe, expect, it } from "vitest";
import { localizeTripReminderPushBody } from "./localize-trip-reminder-push-body";

describe("localizeTripReminderPushBody", () => {
  it("localizes generic reminder copy from persisted locale catalogs", () => {
    expect(localizeTripReminderPushBody("en")).toBe("You have a trip reminder");
    expect(localizeTripReminderPushBody("he")).toBe("יש לך תזכורת לטיול");
  });
});
