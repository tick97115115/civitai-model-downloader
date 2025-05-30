import { getPrismaClient } from "@server/settings";

export async function findOrCreateOneBaseModelType(
  baseModelTypeString: string,
  baseModelId: number
) {
  const record = await getPrismaClient().baseModelType.upsert({
    where: {
      name: baseModelTypeString,
    },
    update: {},
    create: {
      name: baseModelTypeString,
      baseModelId: baseModelId,
    },
  });
  return record;
}
