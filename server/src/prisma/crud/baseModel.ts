import { getPrismaClient } from "@server/settings";

export async function upsertOneBaseModel(baseModelString: string) {
  const record = await getPrismaClient().baseModel.upsert({
    where: {
      name: baseModelString,
    },
    update: {},
    create: {
      name: baseModelString,
    },
  });
  return record;
}
