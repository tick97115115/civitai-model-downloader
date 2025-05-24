import { getPrismaClient } from "@server/settings";

export async function searchTag(tag: string) {
  const result = await getPrismaClient().tag.findMany({
    where: {
      name: {
        contains: tag,
      },
    },
  });
  return result;
}
