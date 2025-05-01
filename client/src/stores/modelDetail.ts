import { defineStore } from "pinia";
import { ref } from "vue";
import {} from "";
import type { ModelId } from "../../../shared/types/models_endpoint";

export const useModelDetailStore = defineStore("modelDetail", () => {
  const modelId = ref<ModelId | null>(null);

  const setModelId = (model: ModelId) => {
    modelId.value = model;
  };
  const modelDetailCardDisplay = ref(false);
  const setModelDetailCardDisplay = (display: boolean) => {
    modelDetailCardDisplay.value = display;
  };

  return {
    modelId,
    setModelId,
    modelDetailCardDisplay,
    setModelDetailCardDisplay,
  };
});
