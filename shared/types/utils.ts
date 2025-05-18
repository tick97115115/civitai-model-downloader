import type { ModelId, ModelVersion } from "@shared/types/models_endpoint";
import _ from "lodash";

export function findModelVersion(
  modelId: ModelId,
  modelVersionId: number
): ModelVersion {
  const modelVersion = _.find(modelId.modelVersions, function (mv) {
    return mv.id === modelVersionId;
  });
  if (modelVersion === undefined) {
    throw new Error(`model have no version id: ${modelVersionId}`);
  }
  return modelVersion;
}
