import { getSettings, setSettings } from "@server/settings";
import { test, expect, describe } from "vitest";

describe(`test settings module`, () => {
  test(`test getSettings() function`, () => {
    const settings = getSettings();
    expect(settings.basePath !== "").eq(true);
  });

  test(`test setSettings() function`, () => {
    const originalCivitaiToken = getSettings().civitaiToken;
    const testUseToken = "12345" + originalCivitaiToken;
    try {
      const settings = setSettings({
        civitaiToken: testUseToken,
      });
      expect(getSettings(true).civitaiToken).eq(testUseToken);
    } catch (error) {
      throw error;
    } finally {
      const settings = setSettings({
        civitaiToken: originalCivitaiToken,
      });
    }
  });
});
