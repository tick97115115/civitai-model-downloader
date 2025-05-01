import { defineStore } from "pinia";
import { ref, watch } from "vue";
import type { ModelId } from "@shared/types/models_endpoint";

export const useModelDetailStore = defineStore("modelDetail", () => {
  const modelId = ref<ModelId | null>(null);

  const setModelId = (model: ModelId) => {
    modelId.value = model;
  };
  const modelDetailCardDisplay = ref(false);
  const setModelDetailCardDisplay = (display: boolean) => {
    modelDetailCardDisplay.value = display;
  };
  const activeVersionId = ref<number | null>(null);
  watch(modelId, (newModelId, oldModelId) => {
    activeVersionId.value = modelId.value?.modelVersions[0]?.id ?? null
    console.log(`initial tab modelVersion id is: ${activeVersionId.value}`)
  })

  return {
    modelId,
    setModelId,
    modelDetailCardDisplay,
    setModelDetailCardDisplay,
    activeVersionId
  };
});
