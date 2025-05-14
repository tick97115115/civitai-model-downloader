import { defineStore } from "pinia";
import { ref } from "vue";
import { trpcClient } from "@/utils/trpcClient";
import type { Settings } from "@shared/types/settings";

export const useSettingsStore = defineStore("settings", () => {
  const settings = ref<Settings>({
    basePath: "",
    civitaiToken: "",
    httpProxy: "",
  });
  async function getSettings(refresh: boolean = false) {
    if (refresh) {
      settings.value = await trpcClient.settings.getSettings.query();
    }
    return settings.value;
  }
  async function setSettings(newSettings: Settings) {
    const result = await trpcClient.settings.setSettings.mutate(newSettings);
    settings.value = result;
    return settings.value;
  }
  return {
    settings,
    getSettings,
    setSettings,
  };
});
