import type { ModelId, ModelVersion } from "@shared/types/models_endpoint";
import { getPrismaClient } from "@server/settings";
import { upsertOneBaseModel } from "./baseModel";
import { upsertOneBaseModelType } from "./baseModelType";
import { upsertOneModelId } from "./modelId";

export async function addOneModelVersion(
  modelId: ModelId,
  modelVersion: ModelVersion
) {
  const baseModelRecord = await upsertOneBaseModel(modelVersion.baseModel);
  const baseModelTypeRecord = modelVersion.baseModelType
    ? await upsertOneBaseModelType(
        modelVersion.baseModelType,
        baseModelRecord.id
      )
    : undefined;
  const modelIdRecord = await upsertOneModelId(modelId);

  const record = await getPrismaClient().modelVersion.upsert({
    where: {
      id: modelVersion.id,
    },
    update: {
      name: modelVersion.name,
      baseModelId: baseModelRecord.id,
      baseModelTypeId: baseModelTypeRecord ? baseModelTypeRecord.id : undefined,
      publishedAt: modelVersion.publishedAt ?? undefined,
      nsfwLevel: modelVersion.nsfwLevel,
    },
    create: {
      id: modelVersion.id,
      modelId: modelIdRecord.id,
      name: modelVersion.name,
      baseModelId: baseModelRecord.id,
      baseModelTypeId: baseModelTypeRecord ? baseModelTypeRecord.id : undefined,
      publishedAt: modelVersion.publishedAt ?? undefined,
      nsfwLevel: modelVersion.nsfwLevel,
    },
  });

  return record;
}

export async function deleteOneModelVersion(
  modelVersionId: number,
  modelId: number
) {
  await getPrismaClient().modelVersion.delete({
    where: {
      id: modelVersionId,
    },
  });
  // Check if there is any modelVersion have same modelId
  const remainingModelVersions = await getPrismaClient().modelVersion.count({
    where: { modelId: modelId },
  });

  // delete modelId if it has no modelversion records in database
  if (remainingModelVersions === 0) {
    await getPrismaClient().model.delete({
      where: {
        id: modelId,
      },
    });
  }
}
