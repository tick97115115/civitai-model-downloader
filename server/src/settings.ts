import Conf from "conf";
import { type } from "arktype";
import ky, { KyInstance } from "ky";
import { EnvHttpProxyAgent } from "undici";
import { PrismaClient } from "@server/prisma/generated";
import "dotenv/config";
import { _settingsValidator } from "@shared/types/settings";

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

export function setSettings(newSettings: Partial<Settings>) {
  settings.set({ ...currentSettings, ...newSettings });
  if (newSettings.httpProxy !== currentSettings.httpProxy) {
    kyWithProxy = instantiateKy();
  }
}
// Settings - End

// Ky client - Start
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

console.log(`this is http proxy address: ` + getSettings().httpProxy);

export function getKy() {
  return kyWithProxy;
}
// Ky client - End

// Prisma client - Start
let prisma = new PrismaClient();
export function getPrismaClient() {
  return prisma;
}
// Prisma client - End

// for dev use, check dotenv value
if (process.env.basePath && settings.get("basePath") !== process.env.basePath) {
  settings.set("basePath", process.env.basePath);
}
if (
  process.env.civitaiToken &&
  settings.get("civitaiToken") !== process.env.civitaiToken
) {
  settings.set("civitaiToken", process.env.civitaiToken);
}
if (
  process.env.httpProxy &&
  settings.get("httpProxy") !== process.env.httpProxy
) {
  settings.set("httpProxy", process.env.httpProxy);
}
