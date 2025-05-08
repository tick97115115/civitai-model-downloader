import { getSettings } from "@server/settings";
import { test, expect, describe } from "vitest";

describe(`test settings module`, () => {
  test(`test getSettings() function`, () => {
    const settings = getSettings()
    expect(settings.basePath !== "").eq(true)
  })
})

