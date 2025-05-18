import type { ModelId, ModelVersion } from "@shared/types/models_endpoint";
import { model_id, model_version } from "@shared/types/models_endpoint";
import { getPrismaClient, getSettings } from "@server/settings";
import { findOrCreateOneBaseModel } from "./baseModel";
import { findOrCreateOneBaseModelType } from "./baseModelType";
import { findOrCreateOneModelId } from "./modelId";
import _ from "lodash";
import { normalize, sep, dirname, join } from "node:path";
import { readFile } from "node:fs/promises";
import { scanModels } from "@server/utils";
import {
  getModelIdApiInfoJsonPath,
  getModelVersionApiInfoJsonPath,
} from "@server/fileStoreLayout";
import type { ModelTypes } from "@shared/types/baseModels/misc";
import { type } from "arktype";

export async function upsertOneModelVersion(
  modelId: ModelId,
  modelVersion: ModelVersion
) {
  const baseModelRecord = await findOrCreateOneBaseModel(
    modelVersion.baseModel
  );
  const baseModelTypeRecord = modelVersion.baseModelType
    ? await findOrCreateOneBaseModelType(
        modelVersion.baseModelType,
        baseModelRecord.id
      )
    : undefined;
  const modelIdRecord = await findOrCreateOneModelId(modelId);

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

type ModelInfo = {
  modelType: string;
  modelId: number;
  versionId: number;
  filePath: string;
  fileName: string;
};

/**
 * 从.safetensors文件路径中提取模型信息（支持批量处理）
 * @param filePaths 文件路径数组
 * @returns 包含模型信息的数组，无效路径会被过滤
 */
export function extractAllModelInfo(filePaths: string[]): ModelInfo[] {
  return filePaths
    .map((filePath) => {
      const normalizedPath = normalize(filePath);
      const parts = normalizedPath.split(sep);

      if (parts.length < 3) return null;

      const fileName = parts[parts.length - 1];
      if (!fileName.endsWith(".safetensors")) return null;

      return {
        modelType: parts[parts.length - 4],
        modelId: Number(parts[parts.length - 3]),
        versionId: Number(parts[parts.length - 2]),
        filePath: normalizedPath,
        fileName: fileName.replace(".safetensors", ""),
      };
    })
    .filter((info): info is ModelInfo => info !== null);
}

export async function scanModelsAndSyncToDb() {
  const safetensorsPaths = await scanModels();
  const safetensors = extractAllModelInfo(safetensorsPaths);
  for (let index = 0; index < safetensors.length; index++) {
    const modelInfo = safetensors[index];
    const isExistsInDb = await getPrismaClient().modelVersion.findUnique({
      where: {
        id: modelInfo.versionId,
      },
    });
    if (isExistsInDb === null) {
      const modelVersionInfo = model_version(
        JSON.parse(
          await readFile(
            getModelVersionApiInfoJsonPath(
              getSettings().basePath,
              modelInfo.modelType as ModelTypes,
              modelInfo.modelId,
              modelInfo.versionId
            ),
            { encoding: "utf-8" }
          )
        )
      );
      if (modelVersionInfo instanceof type.errors) {
        // hover out.summary to see validation errors
        // console.error(modelVersionInfo.summary)
        throw modelVersionInfo;
      }
      const modelIdInfo = model_id(
        JSON.parse(
          await readFile(
            getModelIdApiInfoJsonPath(
              getSettings().basePath,
              modelInfo.modelType as ModelTypes,
              modelInfo.modelId
            ),
            { encoding: "utf-8" }
          )
        )
      );
      if (modelIdInfo instanceof type.errors) {
        // hover out.summary to see validation errors
        // console.error(modelVersionInfo.summary)
        throw modelIdInfo;
      }
      await upsertOneModelVersion(modelIdInfo, modelVersionInfo);
    }
  }
}
