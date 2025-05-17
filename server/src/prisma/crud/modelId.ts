import { getPrismaClient } from "@server/settings";
import type { ModelId, ModelsRequestOpts } from "@shared/types/models_endpoint";
import { upsertOneCreator } from "./creator";
import { upsertOneModelType } from "./modelType";

export async function upsertOneModelId(modelId: ModelId) {
  const creatorRecord = modelId.creator
    ? await upsertOneCreator(modelId.creator)
    : undefined;
  const modelTypeRecord = await upsertOneModelType(modelId.type);

  const record = await getPrismaClient().model.upsert({
    where: {
      id: modelId.id,
    },
    update: {},
    create: {
      id: modelId.id,
      name: modelId.name,
      creatorId: creatorRecord ? creatorRecord.id : undefined,
      typeId: modelTypeRecord.id,
      nsfw: modelId.nsfw,
      nsfwLevel: modelId.nsfwLevel,
      tags: {
        connectOrCreate: modelId.tags.map((tag) => ({
          where: { name: tag },
          create: { name: tag },
        })),
      },
    },
  });
  return record;
}

const defaultQuerySettings: ModelsRequestOpts = {
  page: 1,
  limit: 20,
};

export async function find(params: ModelsRequestOpts) {
  const records = await getPrismaClient().model.findMany({
    where: {
      name: {
        contains: params.query,
      },
      tags: {
        some: {
          name: { in: params.tag },
        },
      },
      creator: {
        username: params.username,
      },
      type: {
        name: { in: params.types },
      },
      nsfw: params.nsfw,
      modelVersions: {
        some: {
          baseModel: {
            name: { in: params.baseModels },
          },
        },
      },
    },
    skip:
      params.page && params.limit
        ? (params.page - 1) * params.limit
        : (defaultQuerySettings.page! - 1) * defaultQuerySettings.limit!,
    take: params.limit ?? defaultQuerySettings.limit!,

    include: {
      creator: true,
      modelVersions: true,
      tags: true,
      type: true,
    },
  });
  // return an array of modelId objects with only modelVersions these on disk
  // need invoke some procedure on server side.
}
