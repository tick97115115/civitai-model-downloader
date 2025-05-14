import { type } from "arktype";

// Settings - Start
export const _settingsValidator = type({
  basePath: "string",
  civitaiToken: "string",
  httpProxy: "string",
});
export type Settings = typeof _settingsValidator.infer;
