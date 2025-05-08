import Conf from "conf";
import { type } from "arktype";
import ky, { KyInstance } from "ky";
import { EnvHttpProxyAgent } from "undici";

export const _settingsValidator = type({
  basePath: "string",
  civitaiToken: "string",
  httpProxy: "string",
});
export type Settings = typeof _settingsValidator.infer;

export const settings = new Conf({
  projectName: "civitai-model-downloader",
  schema: {
    basePath: {
      type: "string",
      default: "",
    },
    civitaiToken: {
      type: "string",
      default: "",
    },
    httpProxy: {
      type: "string",
      default: "",
    },
  },
  projectVersion: "1.0.0",
  configName: "settings",
});

let currentSettings = _settingsValidator(settings.store) as Settings;

export function getSettings() {
  return currentSettings;
}

function instantiateKy() {
  if (getSettings().httpProxy === "") {
    return ky;
  } else {
    return ky.extend({
      // @ts-ignore
      dispatcher: new EnvHttpProxyAgent({
        httpsProxy: getSettings().httpProxy,
        noProxy: "localhost",
      }),
    });
  }
}

let kyWithProxy: KyInstance = instantiateKy();

export function getKy() {
  return kyWithProxy;
}

export function setSettings(newSettings: Partial<Settings>) {
  if (newSettings.httpProxy !== currentSettings.httpProxy) {
    kyWithProxy = instantiateKy();
  }
  settings.set({ ...currentSettings, ...newSettings });
}
