import { defineStore } from "pinia";
import { reactive } from "vue";
import { trpcClient } from "@/utils/trpcClient";
import type { Settings } from "@shared/types/settings";

export const useSettingsStore = defineStore("settings", () => {
  const settings = reactive<Settings>({
    basePath: "",
    civitaiToken: "",
    httpProxy: "",
  });
  async function getSettings(refresh: boolean = false) {
    if (refresh) {
      const settingsInfo = await trpcClient.settings.getSettings.query({
        refresh: refresh,
      });
      Object.assign(settings, settingsInfo);
    }
    return settings;
  }
  async function setSettings(newSettings: Settings) {
    const result = await trpcClient.settings.setSettings.mutate(newSettings);
    Object.assign(settings, result);
    return settings;
  }
  return {
    settings,
    getSettings,
    setSettings,
  };
});
