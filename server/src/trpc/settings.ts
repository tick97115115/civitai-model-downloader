import { router, publicProcedure } from "./trpc";
import { type } from "arktype";
import { setSettings, getSettings } from "@server/settings";
import { _settingsValidator } from "@shared/types/settings";

export const settingsRouter = router({
  getSettings: publicProcedure
    .input(type("undefined"))
    .query(async (params) => {
      return getSettings();
    }),
  setSettings: publicProcedure
    .input(_settingsValidator)
    .mutation((newSettings) => {
      setSettings(newSettings.input);
      return newSettings.input;
    }),
});
