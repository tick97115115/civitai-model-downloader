import { getPrismaClient, getSettings } from "@server/settings";
import type { ModelId } from "@shared/types/models_endpoint";
import { findOrCreateOneCreator } from "./creator";
import { findOrCreateOneModelType } from "./modelType";
import { LocalModelsRequestOpts } from "@shared/types/local/trpc_models";

export async function findOrCreateOneModelId(modelId: ModelId) {
  const creatorRecord = modelId.creator
    ? await findOrCreateOneCreator(modelId.creator)
    : undefined;
  const modelTypeRecord = await findOrCreateOneModelType(modelId.type);

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

export async function findManyModels(params: LocalModelsRequestOpts) {
  const [records, totalCount] = await getPrismaClient().$transaction([
    getPrismaClient().model.findMany({
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
      skip: (params.page - 1) * params.limit,
      take: params.limit,

      include: {
        creator: true,
        modelVersions: true,
        tags: true,
        type: true,
      },
    }),
    getPrismaClient().model.count({
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
    }),
  ]);
  return { records, totalCount };
}
