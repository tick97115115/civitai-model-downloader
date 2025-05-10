import { test, expect, describe } from "vitest";
import { join } from "node:path";
import { PrismaClient } from "@server/prisma/generated";
import { modelId1 } from "./testFileStoreLayout.test";
import * as _ from "lodash-es";
const prisma = new PrismaClient();

test("basic test", () => {
  const path = join(__dirname, "db/testCRUD.test.ts");
  expect(path).toBeTypeOf("string");
});

describe("prisma CRUD", () => {
  test("create", async () => {
    await prisma.model.upsert({
      where: { id: modelId1.id },
      update: {
        name: modelId1.name,
        nsfwLevel: modelId1.nsfwLevel,
        nsfw: modelId1.nsfw,
        tags: {
          connectOrCreate: modelId1.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      create: {
        id: modelId1.id,
        name: modelId1.name,
        creator: modelId1.creator?.username,
        type: modelId1.type,
        nsfwLevel: modelId1.nsfwLevel,
        nsfw: modelId1.nsfw,
        tags: {
          connectOrCreate: modelId1.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });
    for (let index = 0; index < modelId1.modelVersions.length; index++) {
      const modelVersion = modelId1.modelVersions[index];
      await prisma.modelVersion.upsert({
        where: {
          id: modelVersion.id,
        },
        update: {
          name: modelVersion.name,
          baseModel: modelVersion.baseModel,
          baseModelType: modelVersion.baseModelType,
          publishedAt: modelVersion.publishedAt,
          nsfwLevel: modelVersion.nsfwLevel,
        },
        create: {
          id: modelVersion.id,
          modelId: modelId1.id,
          name: modelVersion.name,
          baseModel: modelVersion.baseModel,
          baseModelType: modelVersion.baseModelType,
          publishedAt: modelVersion.publishedAt,
          nsfwLevel: modelVersion.nsfwLevel,
        },
      });
    }

    // check if the model is created
    const model = await prisma.model.findUnique({
      where: { id: modelId1.id },
      include: {
        modelVersions: true,
        tags: true,
      },
    });
    expect(model?.id).toBe(modelId1.id);
    expect(model?.modelVersions[0].id).toBeTypeOf("number");
    expect(model?.tags.length).toBe(modelId1.tags.length);
  });
});
