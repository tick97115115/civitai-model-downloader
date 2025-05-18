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

describe("prisma CRUD example", () => {
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
        creator: modelId1.creator?.username
          ? {
              connectOrCreate: {
                where: { username: modelId1.creator?.username },
                create: {
                  username: modelId1.creator?.username,
                  link: modelId1.creator?.link ?? undefined,
                  image: modelId1.creator?.image ?? undefined,
                },
              },
            }
          : undefined,
        type: {
          connectOrCreate: {
            where: { name: modelId1.type as string },
            create: { name: modelId1.type },
          },
        },
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
      const baseModelResult = await prisma.baseModel.upsert({
        where: { name: modelVersion.baseModel },
        create: { name: modelVersion.baseModel },
        update: {},
      });
      // create baseModelType record
      const baseModelTypeResult = modelVersion.baseModelType
        ? await prisma.baseModelType.upsert({
            where: { name: modelVersion.baseModelType },
            create: {
              name: modelVersion.baseModelType,
              baseModelId: baseModelResult.id,
            },
            update: {},
          })
        : undefined;

      const modelVersionResult = await prisma.modelVersion.upsert({
        where: {
          id: modelVersion.id,
        },
        update: {
          name: modelVersion.name,
          baseModel: {
            connectOrCreate: {
              where: {
                name: modelVersion.baseModel,
              },
              create: {
                name: modelVersion.baseModel,
              },
            },
          },
          baseModelType: modelVersion.baseModelType
            ? {
                connectOrCreate: {
                  where: { name: modelVersion.baseModelType },
                  create: {
                    name: modelVersion.baseModelType,
                    baseModel: {
                      connectOrCreate: {
                        where: { name: modelVersion.baseModel },
                        create: { name: modelVersion.baseModel },
                      },
                    },
                  },
                },
              }
            : undefined,
          publishedAt: modelVersion.publishedAt,
          nsfwLevel: modelVersion.nsfwLevel,
        },
        create: {
          id: modelVersion.id,
          name: modelVersion.name,
          publishedAt: modelVersion.publishedAt,
          nsfwLevel: modelVersion.nsfwLevel,
          modelId: modelId1.id,
          baseModelId: baseModelResult.id,
          baseModelTypeId: baseModelTypeResult?.id,
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
