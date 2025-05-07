import Conf from "conf";
import { type } from "arktype";

export const _settingsValidator = type({
  basePath: "string | null",
  civitaiToken: "string | null",
});
export type Settings = typeof _settingsValidator.infer;

export const settings = new Conf({
  projectName: "civitai-model-downloader",
  schema: {
    basePath: {
      type: "string",
      default: null,
    },
    civitaiToken: {
      type: "string",
      default: null,
    },
  },
  projectVersion: "1.0.0",
  configName: "settings",
});

export function setSettings(newSettings: Partial<Settings>) {
  const currentSettings = settings.store;
  settings.set({ ...currentSettings, ...newSettings });
}
