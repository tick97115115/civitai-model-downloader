import { getPrismaClient } from "@server/settings";

export async function findOrCreateOneModelType(modelTypeString: string) {
  const record = await getPrismaClient().modelType.upsert({
    where: {
      name: modelTypeString,
    },
    update: {},
    create: {
      name: modelTypeString,
    },
  });
  return record;
}
