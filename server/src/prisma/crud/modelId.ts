import { getPrismaClient } from "@server/settings";
import type { ModelId } from "@shared/types/models_endpoint";
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
