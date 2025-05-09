import { router, publicProcedure } from "./trpc";
import { type } from "arktype";
import { _settingsValidator, setSettings, getSettings } from "@server/settings";

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
