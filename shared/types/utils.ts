import type { ModelId, ModelVersion } from "@shared/types/models_endpoint";
import { find } from "lodash-es";

export function findModelVersion(
  modelId: ModelId,
  modelVersionId: number
): ModelVersion {
  const modelVersion = find(modelId.modelVersions, function (mv) {
    return mv.id === modelVersionId;
  });
  if (modelVersion === undefined) {
    throw new Error(`model have no version id: ${modelVersionId}`);
  }
  return modelVersion;
}
