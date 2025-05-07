import { ORPCError, os } from "@orpc/server";
import { type } from "arktype";
import { _settingsValidator, settings } from "./settings";
import type { Settings } from "./settings";

export const getSettings = os.output(_settingsValidator).handler(() => {
  const currentSettings = _settingsValidator(settings.store);
  if (currentSettings instanceof type.errors) {
    // reset settings to default
    settings.clear();
    // return default value
    return _settingsValidator(settings.store) as Settings;
  } else {
    return currentSettings;
  }
});

export const setSettings = os
  .input(_settingsValidator)
  .output(_settingsValidator)
  .handler((newSettings) => {
    settings.set(newSettings.input);
    return newSettings.input;
  });

export const orpcRouter = {
  settings: {
    get: getSettings,
    set: setSettings,
  },
};
